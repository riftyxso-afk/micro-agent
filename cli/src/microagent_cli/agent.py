import json
import re
import shutil
import sys
from .llm import stream_chat
from .tools.executor import execute_tool, TOOL_SCHEMAS


TOOL_DEFS = "\n\n".join(
    f"## {name}\n{sch['description']}\n"
    f"Parameters:\n" + "\n".join(f"  - {k}: {v}" for k, v in sch['params'].items())
    for name, sch in TOOL_SCHEMAS.items()
)

SYSTEM_PROMPT = f"""You are MicroAgent CLI — an autonomous AI coding assistant. You can code, debug, run apps, open files, and do anything in the terminal.

You have tools. Call them one at a time. Think step by step. Show your plan before executing. After finishing, give summary.

TOOLS:
{TOOL_DEFS}

RULES:
- Plan first, then execute step by step.
- Call ONE tool at a time. Wait for result before next call.
- Use bash for everything: run code, git, npm, pip, open apps, build, test.
- Use open to open files/folders/URLs in GUI.
- Read files before editing. Grep to find code. Glob to find files.
- Always use absolute paths.
- When coding: write clean code, test it, fix errors.
- For web dev: use python -m http.server or npx serve.
- Be autonomous. Don't ask for permission unless stuck.

THINKING:
Before each step, show your reasoning:
<plan>
Step-by-step plan here
</plan>

TOOL CALLS:
<tool>
{{"name": "tool_name", "params": {{"key": "value"}}}}
</tool>

FINAL ANSWER:
When task is done, summarize what was accomplished."""


def parse_tool_call(text: str) -> dict | None:
    m = re.search(r"<tool>\s*(\{.*?\})\s*</tool>", text, re.DOTALL)
    if not m:
        return None
    try:
        return json.loads(m.group(1))
    except json.JSONDecodeError:
        return None


def extract_plan(text: str) -> str | None:
    m = re.search(r"<plan>(.*?)</plan>", text, re.DOTALL)
    if m:
        return m.group(1).strip()
    return None


C = shutil.get_terminal_size((80, 20)).columns


def print_loading_box():
    w = min(C - 4, 40)
    sys.stdout.write(f"\r\033[K  \033[1;36m┌{'─' * w}┐\033[0m\n")
    sys.stdout.write(f"\r\033[K  \033[1;36m│\033[0m  \033[1;36mµ\033[0m Generating response{' ' * (w - 23)}\033[1;36m│\033[0m\n")
    sys.stdout.write(f"\r\033[K  \033[1;36m└{'─' * w}┘\033[0m\n")
    sys.stdout.flush()


def run_agent(messages: list[dict], max_iterations: int = 25) -> list[dict]:
    for iteration in range(max_iterations):
        full_response = ""

        print_loading_box()

        self_calls = 0
        bar = f"\033[1;36m{'─' * C}\033[0m"
        bar_dim = f"\033[90m{'─' * C}\033[0m"

        for token in stream_chat(messages):
            if full_response == "":
                print(f"{bar}")
            print(token, end="", flush=True)
            full_response += token
        print()

        messages.append({"role": "assistant", "content": full_response})

        # Show plan if present
        plan = extract_plan(full_response)
        if plan:
            print(f"\033[90m  ── plan ──\033[0m")
            for line in plan.split("\n"):
                print(f"  \033[90m•\033[0m {line.strip()}")
            print(f"\033[90m{'─' * C}\033[0m")

        tool_call = parse_tool_call(full_response)
        if not tool_call:
            break

        name = tool_call.get("name", "")
        params = tool_call.get("params", {})

        if name == "bash":
            cmd_preview = params.get("command", "")[:80]
            print(f"\033[90m  ⚡ bash:\033[0m {cmd_preview}")
            print(f"\033[90m{'─' * C}\033[0m")
        else:
            print(f"\033[90m  ⚡ {name}\033[0m {json.dumps(params)[:80]}")
            print(f"\033[90m{'─' * C}\033[0m")

        result = execute_tool(name, params)
        truncated = result[:3000]
        messages.append({
            "role": "user",
            "content": f"<tool_result>\n{truncated}\n</tool_result>"
        })

    return messages
