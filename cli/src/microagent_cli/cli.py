#!/usr/bin/env python3
import os
import sys
import asyncio
from pathlib import Path

from textual.app import App, ComposeResult
from textual.widgets import Input, Static, RichLog
from textual.containers import Container, Vertical
from textual.binding import Binding
from rich.text import Text
from rich.markdown import Markdown

from .session import load_session, save_session
from .agent import run_agent, SYSTEM_PROMPT

def _env(key: str, default: str = "") -> str:
    return os.environ.get(key, "").strip() or default

# Auto-detect: use backend API if available, else fallback to direct LLM
if _env("API_BASE_URL") or not (_env("OPENAI_BASE_URL") and _env("OPENAI_API_KEY")):
    from . import backend_api as provider
else:
    from . import llm as provider
stream_chat = provider.stream_chat

VERSION = "1.0.0"

ASCII_ART = """\
[bold #2dd4bf] ███╗   ███╗██╗ ██████╗██████╗   ██████╗  █████╗  ██████╗ ███████╗███╗   ██╗████████╗[/]
[bold #22d3ee] ████╗ ████║██║██╔════╝██╔══██╗ ██╔═══██╗██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝[/]
[bold #38bdf8] ██╔████╔██║██║██║     ██████╔╝ ██║   ██║███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║[/]
[bold #818cf8] ██║╚██╔╝██║██║██║     ██╔══██╗ ██║   ██║██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║[/]
[bold #a78bfa] ██║ ╚═╝ ██║██║╚██████╗██║  ██║ ╚██████╔╝██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║[/]
[bold #c084fc] ╚═╝     ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝[/]
"""


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
        k, _, v = line.partition("=")
        os.environ.setdefault(k.strip(), v.strip())


SLASH_COMMANDS = {
    "/exit":  "Exit MicroAgent CLI",
    "/quit":  "Exit MicroAgent CLI",
    "/help":  "Show this help",
    "/new":   "New session (clear history)",
    "/task":  "Run autonomous coding task",
    "/model": "Switch AI model: /model <id>",
    "/save":  "Save session now",
    "/clear": "Clear screen",
    "/info":  "Current session info",
}


class MicroCLI(App):
    CSS = """
    Screen {
        background: #0a0a0a;
    }
    #outer {
        width: 100%;
        height: 100%;
        layout: vertical;
        padding: 1 0;
    }
    #ascii-art {
        height: 10;
        padding: 2 2 0 2;
        content-align: center middle;
    }
    #chat-box {
        height: 1fr;
        margin: 0 2;
        border: tall #1f2937;
        background: #0f1117;
    }
    #chat-box:focus-within {
        border: tall #3b82f6;
    }
    RichLog {
        background: #0f1117;
        color: #e5e7eb;
        padding: 0 1;
    }
    #input-box {
        height: 5;
        margin: 0 2 0 2;
        border: tall #1f2937;
        background: #111827;
    }
    #input-box:focus-within {
        border: tall #3b82f6;
    }
    #input-box Input {
        background: #111827;
        color: #e5e7eb;
        border: none;
        padding: 0 1;
        height: 3;
    }
    #input-box Input:focus {
        border: none;
    }
    #input-box Input>.input--placeholder {
        color: #4b5563;
    }
    #status-bar {
        height: 1;
        padding: 0 2;
        color: #6b7280;
    }
    #hints {
        height: 1;
        padding: 0 2;
        color: #4b5563;
        text-align: right;
    }
    #tip {
        height: 1;
        padding: 0 2;
        color: #6b7280;
        text-align: center;
    }
    #version {
        height: 1;
        padding: 0 2;
        color: #374151;
        text-align: right;
    }
    """

    BINDINGS = [
        Binding("ctrl+c", "quit", "Quit"),
        Binding("tab", "command_mode", "Cmd"),
        Binding("ctrl+l", "clear_screen", "Clear"),
        Binding("escape", "clear_input", "Esc"),
    ]

    def __init__(self):
        super().__init__()
        load_dotenv()
        load_dotenv(Path.cwd() / ".env")

        api_base = _env("API_BASE_URL", "http://localhost:8001")
        if not _env("OPENAI_BASE_URL") and not _env("OPENAI_API_KEY"):
            print(f"  \033[90mBackend API:\033[0m \033[93m{api_base}\033[0m")
        else:
            print(f"  \033[90mProvider:\033[0m \033[93m{_env('OPENAI_MODEL', '?')}\033[0m")

        self.project_dir = _env("MICROAGENT_PROJECT_DIR") or str(Path.cwd())
        self.messages = load_session(self.project_dir)
        has_sys = any(m.get("role") == "system" for m in self.messages)
        if not has_sys:
            self.messages.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

        self.model_id = _env("OPENAI_MODEL", "deepseek-v4-flash")
        self.streaming = False

    def compose(self):
        with Vertical(id="outer"):
            yield Static(ASCII_ART, id="ascii-art")
            with Container(id="chat-box"):
                yield RichLog(id="chat-log", highlight=True, markup=True, max_lines=500)
            with Container(id="input-box"):
                yield Input(placeholder='Ask anything...  /help for commands', id="main-input")
            yield Static(id="status-bar")
            yield Static("          [bold #4b5563]tab[/] [#6b7280]commands[/]   [bold #4b5563]ctrl+c[/] [#6b7280]quit[/]", id="hints")
            yield Static("[bold #f59e0b]●[/] [#6b7280]Type[/] [bold white]/help[/] [#6b7280]for commands · [/] [bold white]/model <id>[/] [#6b7280]to switch[/]", id="tip")
            yield Static(f"[#374151]{VERSION}[/]", id="version")

    def on_mount(self):
        self._refresh_status()
        self.query_one("#main-input").focus()

    # ── helpers ──
    def _count_msgs(self):
        return len([m for m in self.messages if m["role"] in ("user", "assistant")])

    def _refresh_status(self):
        c = self._count_msgs()
        sb = self.query_one("#status-bar")
        if sb:
            sb.update(f" [#6b7280]µ[/] [bold white]{self.model_id}[/]  [#6b7280]· {c} msgs[/]")

    def _log(self, text: str):
        self.query_one("#chat-log").write(Text.from_markup(text))

    def _log_md(self, text: str):
        self.query_one("#chat-log").write(Markdown(text))

    def _focus(self):
        self.query_one("#main-input").focus()

    # ── input ──
    async def on_input_submitted(self, event: Input.Submitted):
        text = event.value.strip()
        if not text or self.streaming:
            return
        event.input.value = ""
        self._focus()
        if text.startswith("/"):
            await self._slash(text)
        else:
            await self._chat(text)

    # ── slash ──
    async def _slash(self, cmd: str):
        args = cmd.strip().split(maxsplit=1)
        base = args[0] if args else cmd

        if base in ("/exit", "/quit"):
            save_session(self.messages, self.project_dir)
            self.exit()
        elif base == "/help":
            lines = ["[bold #5eead4]Slash Commands:[/]"]
            for c, d in SLASH_COMMANDS.items():
                lines.append(f"  [bold white]{c}[/]  [#6b7280]{d}[/]")
            self._log("\n".join(lines))
        elif base == "/new":
            self.messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            save_session(self.messages, self.project_dir)
            self.query_one("#chat-log").clear()
            self._log("[#6b7280]Session reset.[/]")
        elif base == "/model" and len(args) > 1:
            self.model_id = args[1]
            os.environ["OPENAI_MODEL"] = self.model_id
            self._refresh_status()
            self._log(f"[#6b7280]Model →[/] [bold white]{self.model_id}[/]")
        elif base == "/task" and len(args) > 1:
            self._log(f"[bold #60a5fa]Task:[/] {args[1]}")
            self._log("[#f59e0b]● Running agent...[/]")
            self.messages.append({"role": "user", "content": f"Task: {args[1]}\n\nWork autonomously. Plan, code, test, fix errors. Show progress. Open app if needed. Done = summary."})
            self._focus()

            def run():
                import io, contextlib
                buf = io.StringIO()
                with contextlib.redirect_stdout(buf):
                    msgs = run_agent(self.messages, max_iterations=50)
                return msgs, buf.getvalue()

            loop = asyncio.get_event_loop()
            msgs, output = await loop.run_in_executor(None, run)
            self.messages = msgs
            save_session(self.messages, self.project_dir)
            self._refresh_status()
            self._log(output[:2000])
            self._log("[#22c55e]✓ Task complete[/]")
        elif base == "/save":
            save_session(self.messages, self.project_dir)
            self._log("[#6b7280]Session saved.[/]")
        elif base == "/clear":
            self.query_one("#chat-log").clear()
        elif base == "/info":
            self._log(
                f"[#6b7280]Model:[/] [white]{self.model_id}[/]\n"
                f"[#6b7280]Messages:[/] [white]{self._count_msgs()}[/]\n"
                f"[#6b7280]Project:[/] [white]{self.project_dir}[/]"
            )
        else:
            self._log(f"[#ef4444]Unknown:[/] {base}  [#6b7280]/help[/]")
        self._focus()

    # ── chat (async via thread, UI stays alive) ──
    async def _chat(self, text: str):
        self.streaming = True
        self.messages.append({"role": "user", "content": text})
        self._refresh_status()
        self._log(f"\n[bold #60a5fa]You:[/] {text}\n")
        self._log("[#f59e0b]● Generating...[/]")

        def run():
            return "".join(stream_chat(self.messages))

        try:
            loop = asyncio.get_event_loop()
            full = await loop.run_in_executor(None, run)
        except Exception as ex:
            self._log(f"\n[#ef4444]Error: {ex}[/]")
            self.streaming = False
            return

        self.query_one("#chat-log").clear()
        self._log(f"\n[bold #60a5fa]You:[/] {text}\n")
        self._log(f"[bold #5eead4]µ:[/] {full}")
        self.messages.append({"role": "assistant", "content": full})
        save_session(self.messages, self.project_dir)
        self.streaming = False
        self._refresh_status()

    # ── actions ──
    def action_quit(self):
        save_session(self.messages, self.project_dir)
        self.exit()

    def action_clear_screen(self):
        self.query_one("#chat-log").clear()

    def action_clear_input(self):
        self.query_one("#main-input").value = ""

    def action_command_mode(self):
        inp = self.query_one("#main-input")
        inp.value = "/"
        inp.focus()
        inp.cursor_position = 1


def main():
    app = MicroCLI()
    app.run()


if __name__ == "__main__":
    main()
