import json
import os
import subprocess
import re
from pathlib import Path


def execute_tool(name: str, params: dict) -> str:
    fn = TOOLS.get(name)
    if not fn:
        return f"Unknown tool: {name}. Available: {', '.join(TOOLS)}"
    try:
        result = fn(**params)
        return str(result)
    except Exception as e:
        return f"Tool {name} error: {e}"


def tool_bash(command: str, workdir: str = None, timeout: int = None) -> str:
    t = timeout or int(os.environ.get("TOOL_TIMEOUT", "30000"))
    cwd = workdir or os.getcwd()
    try:
        r = subprocess.run(
            command, shell=True, capture_output=True, text=True,
            timeout=t / 1000, cwd=cwd
        )
        out = r.stdout or ""
        err = r.stderr or ""
        result = out + (f"\n{err}" if err else "")
        if r.returncode != 0:
            result += f"\n(exit code: {r.returncode})"
        return result[:5000] or "(no output)"
    except subprocess.TimeoutExpired:
        return f"(timeout after {t}ms)"
    except Exception as e:
        return f"bash error: {e}"


def tool_read(file_path: str, offset: int = 0, limit: int = 200) -> str:
    path = Path(file_path).expanduser().resolve()
    if not path.exists():
        return f"File not found: {path}"
    with open(path) as f:
        lines = f.readlines()
    start = offset
    end = min(start + limit, len(lines))
    result = "".join(lines[start:end])
    meta = f"(lines {start+1}-{end} of {len(lines)})"
    return f"{meta}\n{result}"


def tool_write(file_path: str, content: str) -> str:
    path = Path(file_path).expanduser().resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    return f"Written {len(content)} bytes to {path}"


def tool_edit(file_path: str, old_string: str, new_string: str) -> str:
    path = Path(file_path).expanduser().resolve()
    if not path.exists():
        return f"File not found: {path}"
    text = path.read_text()
    if old_string not in text:
        return f"old_string not found in {path}"
    count = text.count(old_string)
    if count > 1:
        return f"Found {count} matches. Provide more context."
    text = text.replace(old_string, new_string, 1)
    path.write_text(text)
    return f"Edited {path}"


def tool_grep(pattern: str, path: str = ".", include: str = None) -> str:
    root = Path(path).expanduser().resolve()
    cmd = ["rg", "-n", pattern, "--max-count", "20"]
    if include:
        cmd.extend(["-g", include])
    try:
        r = subprocess.run(cmd + [str(root)], capture_output=True, text=True, timeout=10)
        return r.stdout[:3000] or "(no matches)"
    except FileNotFoundError:
        import fnmatch
        results = []
        for p in root.rglob("*"):
            if p.is_file() and (not include or fnmatch.fnmatch(p.name, include)):
                try:
                    for i, line in enumerate(p.read_text(errors="ignore").splitlines(), 1):
                        if pattern in line:
                            results.append(f"{p}:{i}:{line}")
                            if len(results) >= 20:
                                break
                except Exception:
                    pass
        return "\n".join(results[:20]) or "(no matches)"


def tool_glob(pattern: str, path: str = ".") -> str:
    root = Path(path).expanduser().resolve()
    results = [str(p.relative_to(root)) for p in root.glob(pattern)]
    if not results:
        return "(no files match)"
    return "\n".join(results[:50])


def tool_open(target: str) -> str:
    target = str(target)
    path = Path(target).expanduser().resolve()
    if path.exists():
        target = str(path)
    try:
        if os.name == "nt":
            os.startfile(target)
        elif sys.platform == "darwin":
            subprocess.run(["open", target], check=True)
        else:
            subprocess.run(["xdg-open", target], check=True)
        return f"Opened: {target}"
    except Exception as e:
        return f"Failed to open {target}: {e}"


TOOLS = {
    "bash":   tool_bash,
    "read":   tool_read,
    "write":  tool_write,
    "edit":   tool_edit,
    "grep":   tool_grep,
    "glob":   tool_glob,
    "open":   tool_open,
}

TOOL_SCHEMAS = {
    "bash": {
        "description": "Run shell command. For code, git, npm, python, build, run apps.",
        "params": {
            "command": "Shell command (required)",
            "workdir": "Working dir (optional, defaults cwd)",
            "timeout": "Timeout ms (optional, default 30000)"
        }
    },
    "read": {
        "description": "Read file contents with line numbers.",
        "params": {
            "file_path": "Absolute path to file (required)",
            "offset": "Start line, 0-based (optional, default 0)",
            "limit": "Max lines (optional, default 200)"
        }
    },
    "write": {
        "description": "Create new file or overwrite existing. Creates dirs.",
        "params": {
            "file_path": "Absolute path (required)",
            "content": "Full content (required)"
        }
    },
    "edit": {
        "description": "Replace exact text in existing file. Single match required.",
        "params": {
            "file_path": "Absolute path (required)",
            "old_string": "Text to find (required)",
            "new_string": "Replacement text (required)"
        }
    },
    "grep": {
        "description": "Search file contents by regex pattern.",
        "params": {
            "pattern": "Regex pattern (required)",
            "path": "Dir to search (optional, default .)",
            "include": "File glob like *.js (optional)"
        }
    },
    "glob": {
        "description": "Find files matching glob pattern.",
        "params": {
            "pattern": "Glob pattern like **/*.py (required)",
            "path": "Dir to search (optional, default .)"
        }
    },
    "open": {
        "description": "Open file/folder/URL/app with system default.",
        "params": {
            "target": "File path, URL, or app name (required)"
        }
    },
}

import sys  # needed for tool_open platform check
