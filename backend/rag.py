"""
RAG + Document Generation module for MicroAgent.
Uses TF-IDF embeddings (no torch/sentence-transformers needed).
"""
import os, io, json, uuid, subprocess, sys, re, shutil, asyncio, math, hashlib
from typing import Optional
import tiktoken

# ── Config ────────────────────────────────────────────────────────────────────
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
OPENAI_BASE_URL = os.environ.get("OPENAI_BASE_URL", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

_supa = None
def _get_supa():
    global _supa
    if _supa is None and SUPABASE_URL and SUPABASE_SERVICE_KEY:
        from supabase import create_client
        _supa = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    return _supa


# ── Lightweight TF-IDF Embeddings ─────────────────────────────────────────────
# No torch/sentence-transformers needed. Uses character n-grams + cosine.
EmbeddingDim = 256

_char_ngram_cache: dict[str, list[float]] = {}

def get_embedding(text: str) -> list[float]:
    """Generate a lightweight TF-IDF-style embedding from text using character n-grams."""
    if text in _char_ngram_cache:
        return _char_ngram_cache[text]

    # Character 3-grams
    ngrams: dict[str, int] = {}
    for i in range(len(text) - 2):
        ng = text[i:i+3].lower()
        ngrams[ng] = ngrams.get(ng, 0) + 1

    # Hash each ngram into a fixed-dim vector
    vec = [0.0] * EmbeddingDim
    total = sum(ngrams.values()) or 1
    for ng, count in ngrams.items():
        h = int(hashlib.md5(ng.encode()).hexdigest()[:8], 16)
        idx = h % EmbeddingDim
        vec[idx] += count / total

    # Normalize
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    vec = [x / norm for x in vec]

    # Cache (limit size)
    if len(_char_ngram_cache) < 5000:
        _char_ngram_cache[text] = vec
    return vec


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(x * x for x in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


# ── Text Extraction ───────────────────────────────────────────────────────────

def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "pdf":
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            return "\n".join(p.extract_text() or "" for p in reader.pages)
        except Exception:
            return ""
    elif ext == "docx":
        try:
            from docx import Document
            return "\n".join(p.text for p in Document(io.BytesIO(file_bytes)).paragraphs if p.text.strip())
        except Exception:
            return ""
    elif ext in ("xlsx", "xls"):
        try:
            import openpyxl
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True, data_only=True)
            lines = []
            for ws in wb.worksheets:
                for row in ws.iter_rows(values_only=True):
                    vals = [str(c) for c in row if c is not None]
                    if vals:
                        lines.append(" | ".join(vals))
            return "\n".join(lines)
        except Exception:
            return ""
    elif ext in ("txt", "md", "csv", "json", "py", "js", "ts"):
        return file_bytes.decode("utf-8", errors="ignore")
    return ""


# ── Chunking ──────────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    enc = tiktoken.get_encoding("cl100k_base")
    tokens = enc.encode(text)
    chunks = []
    i = 0
    while i < len(tokens):
        chunk = enc.decode(tokens[i:i + chunk_size]).strip()
        if len(chunk) > 50:
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


# ── Ingest ────────────────────────────────────────────────────────────────────

async def ingest_document(file_bytes: bytes, filename: str, user_id: str, is_public: bool = False) -> dict:
    supa = _get_supa()
    if not supa:
        return {"success": False, "error": "Supabase not configured"}

    text = extract_text(file_bytes, filename)
    if not text.strip():
        return {"success": False, "error": "Tidak bisa membaca isi file"}

    # Create document record
    doc = supa.table("rag_documents").insert({
        "user_id": user_id,
        "filename": filename,
        "file_type": filename.rsplit(".", 1)[-1].lower() if "." in filename else "unknown",
        "is_public": is_public,
    }).execute()
    if not doc.data:
        return {"success": False, "error": "Gagal membuat record document"}

    doc_id = doc.data[0]["id"]
    chunks = chunk_text(text)
    stored = 0
    for i, chunk in enumerate(chunks):
        try:
            emb = get_embedding(chunk)
            supa.table("rag_chunks").insert({
                "document_id": doc_id,
                "user_id": user_id,
                "content": chunk,
                "embedding": json.dumps(emb),
                "chunk_index": i,
            }).execute()
            stored += 1
        except Exception as e:
            print(f"Chunk {i} error: {e}")

    supa.table("rag_documents").update({"chunk_count": stored}).eq("id", doc_id).execute()
    return {"success": True, "document_id": doc_id, "chunks": stored, "filename": filename}


# ── Retrieve ──────────────────────────────────────────────────────────────────

def retrieve_context(query: str, user_id: str, match_count: int = 5) -> list[dict]:
    supa = _get_supa()
    if not supa:
        return []

    q_emb = get_embedding(query)

    # Fetch all chunks for user (works for moderate doc counts)
    try:
        result = supa.table("rag_chunks").select(
            "id, content, document_id, embedding"
        ).eq("user_id", user_id).execute()
    except Exception:
        return []

    if not result.data:
        return []

    # Compute similarity
    scored = []
    for row in result.data:
        try:
            emb = json.loads(row["embedding"]) if isinstance(row["embedding"], str) else row["embedding"]
            sim = cosine_similarity(q_emb, emb)
            if sim > 0.15:
                scored.append({
                    "id": row["id"],
                    "content": row["content"],
                    "document_id": row["document_id"],
                    "similarity": sim,
                })
        except Exception:
            continue

    scored.sort(key=lambda x: x["similarity"], reverse=True)
    return scored[:match_count]


# ── Document Generation ───────────────────────────────────────────────────────

DOCUMENT_KEYWORDS = [
    "buat pdf", "buatkan pdf", "generate pdf", "create pdf",
    "buat excel", "buatkan excel", "generate excel",
    "buat word", "buatkan word", "generate word",
    "buat dokumen", "buatkan dokumen", "buat file", "buatkan file",
    "buat laporan", "buatkan laporan", "buat absensi", "buat tabel",
    "generate document", "create file", "download pdf", "download excel",
]


def is_document_request(message: str) -> bool:
    lower = message.lower()
    return any(kw in lower for kw in DOCUMENT_KEYWORDS)


DOC_GEN_SYSTEM = """You are a Python code generator for documents.

When asked to create a document, respond with ONLY:
1. Complete runnable Python code in a ```python block
2. Use correct library:
   - PDF  → reportlab
   - Excel → openpyxl + xlsxwriter
   - Word  → python-docx
3. Save file with a descriptive Indonesian filename
4. End response with EXACTLY this line:
   OUTPUT_FILE: <filename.ext>

Rules:
- Code must be complete and runnable as-is
- No user input required — generate sample/template data
- File saved in current directory (use os.chdir)
- Do NOT add lengthy explanations outside the code block
- OUTPUT_FILE line is MANDATORY at the end
- Generate realistic sample data in Indonesian
- Use proper formatting (headers, colors, borders for tables)"""


def execute_python_code(code: str, output_filename: str) -> dict:
    tmp_dir = os.path.join("/tmp", f"docgen_{uuid.uuid4().hex[:12]}")
    os.makedirs(tmp_dir, exist_ok=True)
    script_path = os.path.join(tmp_dir, f"gen_{uuid.uuid4().hex[:8]}.py")
    output_path = os.path.join(tmp_dir, output_filename)

    patched = f'import os\nos.chdir(r"{tmp_dir}")\n\n{code}'
    with open(script_path, "w", encoding="utf-8") as f:
        f.write(patched)

    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode != 0:
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise RuntimeError(f"Script error:\n{result.stderr[:1000]}")
        if not os.path.exists(output_path):
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise FileNotFoundError(f"File '{output_filename}' tidak ditemukan setelah eksekusi")
        return {"success": True, "file_path": output_path, "tmp_dir": tmp_dir}
    except subprocess.TimeoutExpired:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise RuntimeError("Eksekusi timeout (>30 detik)")


async def generate_document_with_ai(prompt: str, user_id: str, model: str = "deepseek-v4-flash") -> dict:
    """Ask AI to generate Python code, execute it, return download info."""
    import httpx

    # Call AI to generate code
    clean_base = OPENAI_BASE_URL.rstrip("/")
    if clean_base.endswith("/chat/completions"):
        clean_base = clean_base[:-len("/chat/completions")]

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": DOC_GEN_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 4096,
        "temperature": 0.3,
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(f"{clean_base}/chat/completions", headers=headers, json=payload)
        if resp.status_code >= 400:
            raise RuntimeError(f"AI error {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        text = data["choices"][0]["message"]["content"]

    # Parse code block
    code_match = re.search(r"```python\n(.*?)```", text, re.DOTALL)
    if not code_match:
        raise ValueError("AI tidak menghasilkan kode Python. Coba jelaskan lebih spesifik.")

    file_match = re.search(r"OUTPUT_FILE:\s*(\S+)", text)
    if not file_match:
        raise ValueError("AI tidak menyebutkan OUTPUT_FILE di akhir kode.")

    code = code_match.group(1)
    filename = file_match.group(1).strip("`\"'")

    # Execute code
    result = execute_python_code(code, filename)
    file_id = uuid.uuid4().hex

    # Register in Supabase
    supa = _get_supa()
    if supa:
        supa.table("generated_files").insert({
            "id": file_id,
            "user_id": user_id,
            "filename": filename,
            "file_path": result["file_path"],
        }).execute()

    # Schedule cleanup after 10 minutes
    asyncio.create_task(_cleanup_file(file_id, result["tmp_dir"], delay=600))

    return {
        "success": True,
        "file_id": file_id,
        "filename": filename,
        "download_url": f"/api/download/{file_id}/{filename}",
        "message": f"Dokumen **{filename}** berhasil dibuat dan siap didownload!",
    }


async def _cleanup_file(file_id: str, tmp_dir: str, delay: int):
    await asyncio.sleep(delay)
    shutil.rmtree(tmp_dir, ignore_errors=True)
    supa = _get_supa()
    if supa:
        supa.table("generated_files").delete().eq("id", file_id).execute()
