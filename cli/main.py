#!/usr/bin/env python3
import argparse
import os
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from agent import run_agent, SYSTEM_PROMPT
from session import load_session, save_session


LOGO = r"""
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║     __  __ _                   _____ _      ___  ║
  ║    |  \/  (_)                 / ____| |    |__ \ ║
  ║    | \  / |_  ___ _ __ ___   | |    | |       ) |║
  ║    | |\/| | |/ __| '__/ _ \  | |    | |      / / ║
  ║    | |  | | | (__| | | (_) | | |____| |____ / /_ ║
  ║    |_|  |_|_|\___|_|  \___/   \_____|______|____|║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
"""


def cols():
    return shutil.get_terminal_size((80, 20)).columns


def load_dotenv(path: str = None):
    if not path:
        path = Path(__file__).parent / ".env"
    path = Path(path).expanduser().resolve()
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip())


def print_logo():
    model = os.environ.get("OPENAI_MODEL", "default")
    base = os.environ.get("OPENAI_BASE_URL", "")
    provider = base.split("//")[-1].split("/")[0] if base else "?"
    logo_colored = f"\033[1;37m{LOGO}\033[0m"
    info = f"  \033[90m├─ model:\033[0m \033[93m{model}\033[0m  \033[90mprovider:\033[0m \033[93m{provider}\033[0m \033[90m─\033[0m"
    print(logo_colored)
    print(info)
    print()


def print_prompt_composer(model_name: str, msg_count: int, guest_mode: bool = False):
    c = cols()
    bar = "\033[90m" + "─" * c + "\033[0m"
    model_tag = f"\033[93m{model_name}\033[0m"
    msgs_tag = f"\033[90mmsgs:\033[0m \033[92m{msg_count}\033[0m"

    print(bar)
    print(f"  \033[1;36mµ\033[0m  {model_tag}  {msgs_tag}")
    print(bar)

    help_hint = "\033[90mtype\033[0m \033[93m/help\033[0m \033[90mfor commands\033[0m"
    print(f"  \033[1;32m❯\033[0m  \033[90m{help_hint}\033[0m")
    print(bar)


SLASH_COMMANDS = {
    "/exit":  {"desc": "Keluar MicroAgent CLI", "usage": "/exit"},
    "/quit":  {"desc": "Keluar MicroAgent CLI", "usage": "/quit"},
    "/help":  {"desc": "Tampilkan bantuan ini", "usage": "/help"},
    "/new":   {"desc": "Session baru (hapus riwayat)", "usage": "/new"},
    "/task":  {"desc": "Jalankan task coding otomatis", "usage": "/task <deskripsi>"},
    "/model": {"desc": "Ganti model AI", "usage": "/model <model-id>"},
    "/save":  {"desc": "Simpan session sekarang", "usage": "/save"},
    "/clear": {"desc": "Bersihkan layar terminal", "usage": "/clear"},
    "/info":  {"desc": "Info session saat ini", "usage": "/info"},
}


def print_help():
    w = max(len(cmd) for cmd in SLASH_COMMANDS) + 2
    c = cols()
    print(f"\n  \033[1;36m╔{'═' * (w + 34)}╗\033[0m")
    print(f"  \033[1;36m║\033[0m  \033[1mSlash Commands\033[0m")
    print(f"  \033[1;36m╠{'═' * (w + 34)}╣\033[0m")
    for cmd, info in SLASH_COMMANDS.items():
        pad = w - len(cmd)
        print(f"  \033[1;36m║\033[0m    \033[93m{cmd}\033[0m{' ' * pad}  {info['desc']}")
    print(f"  \033[1;36m╚{'═' * (w + 34)}╝\033[0m")
    print()


def handle_slash(cmd: str, messages: list, sys_prompt: str, project_dir: str) -> tuple[bool, list]:
    args = cmd.strip().split(maxsplit=1)
    base_cmd = args[0] if args else cmd

    if base_cmd in ("/exit", "/quit"):
        return False, messages
    elif base_cmd == "/help":
        print_help()
    elif base_cmd == "/new":
        messages = [{"role": "system", "content": sys_prompt}]
        save_session(messages, project_dir)
        print(f"  \033[90mSession reset. Siap mulai baru.\033[0m")
    elif base_cmd == "/model" and len(args) > 1:
        os.environ["OPENAI_MODEL"] = args[1]
        print(f"  \033[90mModel switched to:\033[0m \033[93m{args[1]}\033[0m")
    elif base_cmd == "/task" and len(args) > 1:
        task = args[1]
        print(f"  \033[1;36mµ\033[0m Autonomous task: \033[93m{task}\033[0m")
        print()
        messages.append({"role": "user", "content": f"Task: {task}\n\nWork autonomously. Plan, code, test, fix errors. Show progress. Open app if needed. Done = summary."})
        messages = run_agent(messages, max_iterations=50)
        save_session(messages, project_dir)
    elif base_cmd == "/save":
        save_session(messages, project_dir)
        print(f"  \033[90mSession saved.\033[0m")
    elif base_cmd == "/clear":
        os.system("clear")
        print_logo()
    elif base_cmd == "/info":
        msg_count = len([m for m in messages if m["role"] in ("user", "assistant")])
        user_count = len([m for m in messages if m["role"] == "user"])
        model_name = os.environ.get("OPENAI_MODEL", "?")
        print(f"  \033[90mModel:\033[0m \033[93m{model_name}\033[0m")
        print(f"  \033[90mPesan:\033[0m {msg_count} (\033[92m{user_count}\033[0m user)")
        print(f"  \033[90mProject:\033[0m {project_dir}")
    else:
        print(f"  \033[91m╷\033[0m")
        print(f"  \033[91m╰ Unknown command:\033[0m {base_cmd}. Type \033[93m/help\033[0m")
        print()

    return True, messages


def main():
    load_dotenv()
    load_dotenv(Path.cwd() / ".env")

    parser = argparse.ArgumentParser(
        description="MicroAgent CLI — AI coding assistant",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("-p", "--prompt", help="Prompt langsung (non-interaktif)")
    parser.add_argument("-t", "--task", help="Jalankan task coding otomatis (autonomous mode)")
    parser.add_argument("-m", "--model", help="Ganti model ID (e.g. claude-sonnet-4-6)")
    parser.add_argument("--new", action="store_true", help="Session baru (abaikan session tersimpan)")
    parser.add_argument("--system", help="Custom system prompt file path")
    args = parser.parse_args()

    if args.model:
        os.environ["OPENAI_MODEL"] = args.model

    if not os.environ.get("OPENAI_BASE_URL") or not os.environ.get("OPENAI_API_KEY"):
        print("\033[91mERROR:\033[0m Set \033[93mOPENAI_BASE_URL\033[0m dan \033[93mOPENAI_API_KEY\033[0m di .env", file=sys.stderr)
        sys.exit(1)

    project_dir = os.environ.get("MICROAGENT_PROJECT_DIR") or str(Path.cwd())

    messages = []
    if not args.new:
        messages = load_session(project_dir)

    sys_prompt = Path(args.system).read_text() if args.system else SYSTEM_PROMPT

    has_system = any(m.get("role") == "system" for m in messages)
    if not has_system:
        messages.insert(0, {"role": "system", "content": sys_prompt})

    if args.task:
        task = args.task
        print(f"  \033[1;36mµ\033[0m Autonomous task: \033[93m{task}\033[0m")
        print()
        messages.append({"role": "user", "content": f"Task: {task}\n\nWork autonomously. Plan, code, test, fix errors. Show progress. Open app if needed. Done = summary."})
        messages = run_agent(messages, max_iterations=50)
        save_session(messages, project_dir)
        return

    if args.prompt:
        messages.append({"role": "user", "content": args.prompt})
        messages = run_agent(messages)
        save_session(messages, project_dir)
        return

    from prompt_toolkit import PromptSession
    from prompt_toolkit.completion import Completer, Completion
    from prompt_toolkit.styles import Style
    from prompt_toolkit.history import FileHistory
    from prompt_toolkit.shortcuts import CompleteStyle
    from prompt_toolkit.formatted_text import ANSI

    class SlashCompleter(Completer):
        def get_completions(self, document, complete_event):
            text = document.text_before_cursor
            if text.startswith("/"):
                for cmd, info in SLASH_COMMANDS.items():
                    if cmd.startswith(text):
                        yield Completion(cmd, start_position=-len(text), display_meta=info["desc"])

    pstyle = Style.from_dict({
        "completion-menu.completion":         "bg:#111827 #e5e7eb",
        "completion-menu.completion.current": "bg:#3b82f6 #ffffff",
        "completion-menu.meta":               "bg:#0f1117 #6b7280",
        "completion-menu.meta.current":       "bg:#2563eb #ffffff",
    })

    session = PromptSession(
        completer=SlashCompleter(),
        style=pstyle,
        history=FileHistory(str(Path.home() / ".microagent_history")),
        complete_style=CompleteStyle.COLUMN,
    )

    model = os.environ.get("OPENAI_MODEL", "deepseek-v4-flash")
    print_logo()

    while True:
        msg_count = len([m for m in messages if m["role"] in ("user", "assistant")])
        print_prompt_composer(model, msg_count)

        try:
            line = session.prompt(ANSI("  \033[1;32m❯\033[0m "))
        except (EOFError, KeyboardInterrupt):
            print()
            break

        prompt = line.strip()
        if not prompt:
            continue

        if prompt.startswith("/"):
            cont, messages = handle_slash(prompt, messages, sys_prompt, project_dir)
            if not cont:
                break
            continue

        messages.append({"role": "user", "content": prompt})
        messages = run_agent(messages)
        save_session(messages, project_dir)

        print()

    save_session(messages, project_dir)
    c = cols()
    print(f"\033[90m{'─' * c}\033[0m")
    print(f"  \033[1;36mµ\033[0m Session saved. \033[90mSampai jumpa!\033[0m")


if __name__ == "__main__":
    main()
