import json
import os
from pathlib import Path

SESSION_DIR = Path.home() / ".microagent"
SESSION_FILE = SESSION_DIR / "session.json"


def load_session(project_dir: str = None) -> list[dict]:
    path = _session_path(project_dir)
    if path.exists():
        try:
            return json.loads(path.read_text())
        except (json.JSONDecodeError, Exception):
            pass
    return []


def save_session(messages: list[dict], project_dir: str = None):
    path = _session_path(project_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(messages[-50:], indent=2))


def _session_path(project_dir: str = None) -> Path:
    if project_dir:
        proj_path = Path(project_dir).expanduser().resolve()
        return SESSION_DIR / proj_path.name / "session.json"
    return SESSION_FILE
