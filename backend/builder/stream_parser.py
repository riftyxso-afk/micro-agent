"""
Incremental streaming parser untuk format boltAction.

Tugasnya: terima potongan teks (chunk) dari Claude stream satu per satu,
emit events begitu tag/konten ter-parse — tanpa harus tunggu seluruh
response selesai.

Events yang diemit:
- FILE_START   : tag <boltAction> terbuka, path sudah diketahui
- FILE_CHUNK   : potongan isi file yang baru masuk
- FILE_COMPLETE: tag </boltAction> ditutup, file selesai
- THINKING     : teks di luar tag (harusnya kosong sesuai format, tapi
                 kita tangkap buat debug kalau model melanggar aturan)

State machine:
  IDLE → (ketemu "<boltAction") → READING_TAG → (tag lengkap + valid) →
  IN_FILE → (ketemu "</boltAction>") → IDLE
"""

from dataclasses import dataclass, field
from enum import Enum, auto
import re


class EventType(Enum):
    FILE_START = auto()
    FILE_CHUNK = auto()
    FILE_COMPLETE = auto()
    THINKING = auto()


@dataclass
class ParseEvent:
    type: EventType
    path: str = ""
    content: str = ""


class _State(Enum):
    IDLE = auto()
    READING_TAG = auto()
    IN_FILE = auto()


# Regex buat extract path dari opening tag yang sudah lengkap
_OPEN_TAG_RE = re.compile(
    r'<boltAction\s+type=["\']file["\']\s+path=["\']([^"\']+)["\']>'
)
# Closing tag (sederhana, tidak butuh regex kompleks)
_CLOSE_TAG = "</boltAction>"


class IncrementalParser:
    """
    Feed teks chunk demi chunk via .feed(text), dapatkan list ParseEvent.

    Contoh pemakaian:
        parser = IncrementalParser()
        for chunk in stream:
            for event in parser.feed(chunk):
                handle(event)
    """

    def __init__(self) -> None:
        self._state = _State.IDLE
        self._buf = ""          # buffer akumulasi saat IDLE (nunggu tag)
        self._current_path = ""
        self._file_buf = ""     # buffer konten file saat IN_FILE

    # ── public ────────────────────────────────────────────────────────────────

    def feed(self, text: str) -> list[ParseEvent]:
        events: list[ParseEvent] = []
        self._buf += text

        while self._buf:
            if self._state == _State.IDLE:
                self._process_idle(events)
            elif self._state == _State.READING_TAG:
                self._process_reading_tag(events)
            elif self._state == _State.IN_FILE:
                self._process_in_file(events)
            else:
                break  # shouldn't happen

            # Kalau buffer tidak berubah di iterasi ini, break untuk
            # hindari infinite loop (nunggu chunk berikutnya)
            if not self._buf:
                break

        return events

    # ── private state handlers ────────────────────────────────────────────────

    def _process_idle(self, events: list[ParseEvent]) -> None:
        idx = self._buf.find("<boltAction")
        if idx == -1:
            # Tidak ada tag pembuka — seluruh buffer bisa jadi THINKING
            # (tapi flush hanya kalau bukan partial tag di ujung)
            safe = self._safe_thinking_flush()
            if safe:
                events.append(ParseEvent(EventType.THINKING, content=safe))
                self._buf = self._buf[len(safe):]
            else:
                # Buffer mungkin potongan tag di ujung — tahan dulu
                pass
            return

        # Ada teks sebelum tag → emit sebagai THINKING
        if idx > 0:
            thinking = self._buf[:idx]
            events.append(ParseEvent(EventType.THINKING, content=thinking))
            self._buf = self._buf[idx:]

        # Transisi ke READING_TAG
        self._state = _State.READING_TAG

    def _process_reading_tag(self, events: list[ParseEvent]) -> None:
        # Cari penutup ">" dari opening tag
        close_angle = self._buf.find(">")
        if close_angle == -1:
            # Tag belum lengkap — tunggu chunk berikutnya
            return

        tag_str = self._buf[: close_angle + 1]
        m = _OPEN_TAG_RE.match(tag_str)
        if m:
            self._current_path = m.group(1)
            self._file_buf = ""
            self._buf = self._buf[close_angle + 1:]
            self._state = _State.IN_FILE
            events.append(ParseEvent(EventType.FILE_START, path=self._current_path))
        else:
            # Bukan boltAction tag yang valid — perlakukan sebagai teks biasa
            events.append(ParseEvent(EventType.THINKING, content=tag_str))
            self._buf = self._buf[close_angle + 1:]
            self._state = _State.IDLE

    def _process_in_file(self, events: list[ParseEvent]) -> None:
        idx = self._buf.find(_CLOSE_TAG)
        if idx == -1:
            # Belum ada closing tag.
            # Tapi bisa jadi closing tag terpotong di akhir buffer.
            # Simpan potensi partial closing tag, flush sisanya.
            safe_len = self._safe_in_file_len()
            if safe_len > 0:
                chunk = self._buf[:safe_len]
                self._file_buf += chunk
                self._buf = self._buf[safe_len:]
                events.append(
                    ParseEvent(EventType.FILE_CHUNK, path=self._current_path, content=chunk)
                )
            return

        # Ada closing tag — ambil konten sampai sana
        content_chunk = self._buf[:idx]
        if content_chunk:
            self._file_buf += content_chunk
            events.append(
                ParseEvent(EventType.FILE_CHUNK, path=self._current_path, content=content_chunk)
            )

        events.append(ParseEvent(EventType.FILE_COMPLETE, path=self._current_path))
        self._buf = self._buf[idx + len(_CLOSE_TAG):]
        self._current_path = ""
        self._file_buf = ""
        self._state = _State.IDLE

    # ── helpers ───────────────────────────────────────────────────────────────

    def _safe_thinking_flush(self) -> str:
        """
        Berapa karakter buffer yang aman di-flush sebagai THINKING saat IDLE.
        Tahan max len("<boltAction") karakter di ujung kalau mungkin partial tag.
        """
        HOLD = len("<boltAction")
        if len(self._buf) <= HOLD:
            return ""
        return self._buf[: len(self._buf) - HOLD]

    def _safe_in_file_len(self) -> int:
        """
        Berapa karakter buffer yang aman di-flush sebagai FILE_CHUNK saat IN_FILE.
        Tahan max len(CLOSE_TAG) karakter di ujung.
        """
        hold = len(_CLOSE_TAG)
        safe = len(self._buf) - hold
        return max(0, safe)
