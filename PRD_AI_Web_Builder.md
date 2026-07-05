# PRD — AI Web Builder Platform
**Product codename:** (belum ditentukan)
**Versi dokumen:** 1.0
**Tanggal:** 2 Juli 2026
**Author:** Radz

---

## 1. Ringkasan Eksekutif

Platform SaaS berbasis AI yang memungkinkan siapa saja — tanpa harus bisa coding — membuat landing page dan aplikasi web fullstack hanya lewat percakapan natural language. User cukup deskripsikan apa yang ingin dibuat, AI generate code secara real-time, langsung bisa di-preview, di-revisi lewat chat, dan di-deploy dalam satu klik.

Kompetitor langsung: **Lovable, Bolt.new, Replit Agent, v0 (Vercel)**.

Diferensiasi awal: fokus ke kecepatan iterasi (streaming file-by-file, bukan tunggu full generation) dan UX yang lebih ringan/cepat untuk kasus penggunaan landing page & MVP sederhana, dengan potensi ekspansi ke ceruk pasar Indonesia (UMKM, freelancer, agency lokal) di fase lanjut.

---

## 2. Problem Statement

- Membuat landing page atau MVP web app masih butuh skill teknis (React/Next.js, hosting, deployment) yang jadi barrier buat non-developer, founder solo, atau UMKM.
- Tools existing (Lovable, Bolt, Replit) sudah kuat tapi: (a) harga relatif mahal untuk pasar Indonesia, (b) belum ada yang benar-benar optimized untuk workflow lokal (bahasa Indonesia, pembayaran lokal, hosting murah/lokal).
- Proses iterasi di banyak AI builder terasa lambat — user harus tunggu generation selesai total sebelum lihat hasil, gak ada feedback loop yang cepat.

## 3. Goals & Objectives

| Goal | Metric | Target (6 bulan pasca launch) |
|---|---|---|
| Validasi product-market fit | Weekly Active Projects | 200+ |
| Retensi awal | User yang generate >1 project | 30% dari signup |
| Monetisasi | Paid conversion rate | 5% dari free user |
| Kualitas output | % generation tanpa error runtime | >85% |
| Kecepatan | Time-to-first-preview | <15 detik dari prompt submit |

### Non-goals (di luar scope awal)
- Tidak kompetisi head-to-head fitur lengkap dengan Replit (full IDE, multiplayer coding, dsb)
- Tidak mendukung bahasa pemrograman selain JavaScript/TypeScript ecosystem di fase awal
- Tidak membangun infrastruktur hosting sendiri — reliance ke Vercel/Netlify/Supabase di awal

---

## 4. Target User & Persona

**Persona utama — "Solo Builder"**
- Founder solo, indie hacker, atau freelancer yang butuh MVP/landing page cepat tanpa hire developer
- Familiar teknologi tapi tidak selalu bisa coding penuh
- Value speed & iterasi cepat lebih dari kustomisasi mendalam

**Persona sekunder — "Non-technical Business Owner"**
- Pemilik UMKM/bisnis kecil yang butuh landing page/company profile
- Zero coding knowledge
- Sensitif harga, butuh hasil yang terlihat profesional tanpa effort desain

**Persona tersier (fase lanjut) — "Agency/Freelancer Developer"**
- Pakai tool ini buat mempercepat delivery client, bukan pengganti skill mereka

---

## 5. Scope & Fasa Pengembangan

### Fase 1 — MVP: Landing Page Generator
**Target: 4-6 minggu**

Fitur inti:
- Chat interface single-prompt → generate landing page (Next.js + Tailwind)
- Live preview via WebContainers (real-time, streaming file-by-file)
- Revisi iteratif lewat chat (multi-turn, context-aware terhadap project existing)
- Code editor read-only (Monaco) buat lihat hasil generate
- Export project (.zip) atau deploy one-click ke Vercel
- Auth (email/Google login)
- Project save & history (list project yang pernah dibuat)

**Explicitly out of scope Fase 1:** backend/database generation, custom domain, team collaboration, template marketplace

### Fase 2 — Fullstack App Generator
**Target: +8-10 minggu setelah Fase 1 validated**

- Generate backend API routes (Next.js API routes atau FastAPI terpisah)
- Integrasi database (Supabase — schema generation dari prompt)
- Auth generation (built-in ke app yang di-generate, bukan cuma platform)
- File upload / storage handling
- Environment variable management di UI

### Fase 3 — Growth & Monetisasi Lanjut
- Template marketplace (community-submitted)
- Team workspace / collaboration
- Custom domain + white-label untuk agency tier
- Integrasi pembayaran lokal (Midtrans/Xendit) buat app yang di-generate

---

## 6. User Stories (Fase 1)

1. **Sebagai** solo builder, **saya ingin** menuliskan deskripsi landing page dalam bahasa natural, **agar** saya dapat prototype tanpa menulis code.
2. **Sebagai** user, **saya ingin** melihat progress generation secara real-time (file mana yang sedang ditulis), **agar** saya tahu AI sedang bekerja dan tidak merasa stuck.
3. **Sebagai** user, **saya ingin** merevisi hasil generate lewat chat lanjutan ("ubah warna jadi biru", "tambah section testimoni"), **agar** saya tidak perlu generate ulang dari nol.
4. **Sebagai** user, **saya ingin** men-deploy hasil generate dengan satu klik, **agar** saya punya URL live tanpa setup manual.
5. **Sebagai** user, **saya ingin** melihat riwayat project saya, **agar** saya bisa lanjutkan pekerjaan sebelumnya.
6. **Sebagai** user free-tier, **saya ingin** tahu batas kuota saya, **agar** saya bisa putuskan upgrade atau tidak.

---

## 7. Requirement Fungsional

| ID | Requirement | Prioritas |
|---|---|---|
| F1 | User dapat submit prompt teks untuk generate landing page | Must |
| F2 | Sistem menampilkan live streaming progress (file-by-file) saat generate | Must |
| F3 | Live preview otomatis update setelah file selesai ditulis | Must |
| F4 | User dapat kirim prompt revisi lanjutan dengan context project yang ada | Must |
| F5 | User dapat lihat & edit code manual di editor (Monaco) | Should |
| F6 | User dapat deploy project ke Vercel dengan satu aksi | Must |
| F7 | User dapat download project sebagai .zip | Should |
| F8 | Sistem menyimpan riwayat project per user | Must |
| F9 | Sistem membatasi jumlah generation berdasarkan tier (free/paid) | Must |
| F10 | User dapat fork/duplicate project yang sudah ada | Could |

## 8. Requirement Non-Fungsional

- **Performa:** Time-to-first-file-write < 5 detik dari prompt submit
- **Reliability:** Uptime backend generation API ≥ 99% (di luar downtime provider LLM)
- **Skalabilitas:** Sandbox eksekusi (WebContainers) berjalan client-side, sehingga load generation compute tidak membebani server pusat
- **Keamanan:** Isolasi WebContainers per sesi user (tidak ada shared execution), API key LLM tidak pernah exposed ke client
- **Kompatibilitas browser:** Chrome/Edge (WebContainers butuh SharedArrayBuffer support) — Safari/Firefox support terbatas, perlu disclaimer

---

## 9. Arsitektur Teknis (Ringkas)

```
┌─────────────┐     prompt      ┌──────────────┐    stream    ┌─────────────┐
│   Frontend   │ ──────────────> │   FastAPI     │ ───────────> │  Claude API  │
│ (Next.js 15) │ <────SSE─────── │  (backend)    │ <─────────── │              │
└──────┬───────┘                 └──────┬────────┘              └─────────────┘
       │                                │
       │ file writes                    │ save project
       v                                v
┌──────────────┐                ┌──────────────┐
│ WebContainers │                │   Supabase    │
│ (live sandbox)│                │ (DB + Auth)   │
└──────────────┘                └──────────────┘
```

- **Frontend:** Next.js 15, Tailwind, Monaco Editor
- **Sandbox/preview:** WebContainers API (client-side execution)
- **Backend:** FastAPI (SSE streaming endpoint, auth proxy, project CRUD)
- **LLM:** Claude API (streaming + custom parser buat structured file output)
- **DB & Auth:** Supabase
- **Deploy target:** Vercel API (untuk project hasil generate user)

*(Detail implementasi streaming & parser sudah dikerjakan — lihat kode `stream_parser.py` / `main.py` dari sesi sebelumnya)*

---

## 10. Monetisasi

| Tier | Harga | Kuota generation/bulan | Fitur |
|---|---|---|---|
| Free | Rp 0 | 5x generate, revisi unlimited per project | Preview only, no deploy, watermark |
| Pro | ~Rp 99-149rb/bulan | 50x generate | Deploy + custom domain 1x, no watermark |
| Business | ~Rp 399rb/bulan | Unlimited | Multi-project, priority generation, white-label |

*Angka harga masih indikatif — perlu divalidasi lewat riset kompetitor lokal & willingness-to-pay survey sebelum finalisasi.*

---

## 11. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Biaya API LLM membengkak seiring user growth | Tinggi | Rate limiting ketat per tier, monitoring cost per generation, evaluasi model lebih murah untuk revisi kecil |
| WebContainers tidak support di semua browser | Sedang | Deteksi browser + fallback message, prioritaskan Chrome/Edge di awal |
| Output AI tidak konsisten format (`boltAction` parsing gagal) | Tinggi | Structured output/prefill enforcement, validasi + retry otomatis kalau parsing gagal |
| Kompetisi dari pemain besar (Lovable, Bolt) dengan resource lebih besar | Tinggi | Fokus niche (harga lokal, UX kecepatan, bahasa Indonesia) alih-alih head-to-head fitur |
| User generate konten/app yang melanggar ToS (malware, scam site) | Sedang | Content moderation di prompt level, ToS jelas, monitoring abuse pattern |

---

## 12. Metrik Sukses (Fase 1)

- **Activation rate:** % signup yang berhasil generate minimal 1 landing page
- **Time-to-value:** rata-rata waktu dari signup → first successful preview
- **Retention D7/D30:** user yang kembali generate/edit project
- **NPS/qualitative feedback** dari 20-30 early user pertama

---

## 13. Timeline Ringkas

| Minggu | Milestone |
|---|---|
| 1-2 | Setup infra (FastAPI + Next.js + WebContainers boot), auth, DB schema |
| 3-4 | Streaming generation pipeline + live preview end-to-end |
| 5 | Revisi/chat iteratif + project history |
| 6 | Deploy pipeline (Vercel API) + QA + polish UI |
| 7+ | Closed beta ke 20-30 user pertama, kumpulkan feedback |

---

## 14. Open Questions

- Nama produk & branding belum ditentukan
- Perlu validasi harga lewat riset kompetitor lokal (Indonesian SaaS pricing)
- Apakah perlu dukungan bahasa Indonesia untuk prompt (bukan cuma UI)?
- Strategi acquisition awal: komunitas developer Indonesia, Product Hunt, atau langsung ke UMKM?
