import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProjectWorkspace } from "@/hooks/useProjectWorkspace";
import { WorkspaceTopBar } from "@/components/project/WorkspaceTopBar";
import { WorkspaceChatPanel } from "@/components/project/WorkspaceChatPanel";
import { WorkspacePreviewPanel } from "@/components/project/WorkspacePreviewPanel";

// ── Build mode system prompts ──────────────────────────────────────────────
const PLAN_PREFIX = `Before generating any code, first output a concise project plan:
- Goal summary (1 sentence)
- Pages / sections to build
- Key components needed
- Tech decisions (fonts, colors, libraries)

Then proceed to generate the full project code.

User request: `;

function buildUserMessage(prompt, mode) {
  if (mode === "plan") return PLAN_PREFIX + prompt;
  return prompt;
}

export default function ProjectWorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [device, setDevice] = useState("desktop");
  const generationFiredRef = useRef(false);

  // State passed from BuilderPage
  const initialPrompt = location.state?.initialPrompt ?? null;
  const buildMode = location.state?.buildMode ?? "build";

  const {
    projectMeta,
    messages,
    fileTree,
    loadingMeta,
    loadingMessages,
    previewState,
    appendMessage,
    onFileComplete,
  } = useProjectWorkspace(id);

  // ── Stream generation via backend SSE ─────────────────────────────────────
  const streamGeneration = useCallback(
    async (prompt, mode, currentFileTree = {}) => {
      const apiBase =
        process.env.REACT_APP_BUILDER_API_URL || "http://127.0.0.1:8002";
      const userMessage = buildUserMessage(prompt, mode);

      // Optimistic assistant placeholder
      const assistantMsgId = `msg-assistant-${Date.now()}`;
      appendMessage({
        id: assistantMsgId,
        role: "assistant",
        content: mode === "plan" ? "Planning your project..." : "Generating...",
        text: mode === "plan" ? "Planning your project..." : "Generating...",
        state: "streaming",
        createdAt: new Date().toISOString(),
      });

      try {
        const res = await fetch(`${apiBase}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userMessage,
            file_tree:
              Object.keys(currentFileTree).length > 0 ? currentFileTree : null,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let fileCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          let eventName = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventName = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (eventName === "file_complete") {
                  fileCount++;
                }
                if (eventName === "file_chunk" && data.path && data.content) {
                  onFileComplete(data.path, data.content);
                }
                if (eventName === "done") {
                  appendMessage({
                    id: assistantMsgId,
                    role: "assistant",
                    content: `Generated ${fileCount} file${fileCount !== 1 ? "s" : ""}.`,
                    text: `Generated ${fileCount} file${fileCount !== 1 ? "s" : ""}.`,
                    state: "complete",
                    createdAt: new Date().toISOString(),
                  });
                }
              } catch (_) {
                // ignore malformed SSE lines
              }
              eventName = "";
            }
          }
        }
      } catch (err) {
        console.error("[ProjectWorkspace] streamGeneration error:", err);
        appendMessage({
          id: assistantMsgId,
          role: "assistant",
          content: "Generation failed. Please try again.",
          text: "Generation failed. Please try again.",
          state: "error",
          createdAt: new Date().toISOString(),
        });
      }
    },
    [appendMessage, onFileComplete]
  );

  // ── Fire initial prompt once messages are loaded ───────────────────────────
  useEffect(() => {
    if (!initialPrompt) return;
    if (loadingMessages) return;
    if (messages.length > 0) return;
    if (generationFiredRef.current) return;
    generationFiredRef.current = true;

    appendMessage({
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: initialPrompt,
      text: initialPrompt,
      createdAt: new Date().toISOString(),
    });

    streamGeneration(initialPrompt, buildMode, {});

    // Clear location state so refresh doesn't re-send
    window.history.replaceState({}, "", window.location.pathname);
  }, [initialPrompt, buildMode, loadingMessages, messages.length, appendMessage, streamGeneration]);

  // ── Handle subsequent chat messages (always revise mode) ──────────────────
  const handleSend = useCallback(
    (text) => {
      if (!text.trim()) return;
      appendMessage({
        id: `msg-user-${Date.now()}`,
        role: "user",
        content: text,
        text,
        createdAt: new Date().toISOString(),
      });
      streamGeneration(text, "build", fileTree);
    },
    [appendMessage, streamGeneration, fileTree]
  );

  const handleRefresh = useCallback(() => {
    window.dispatchEvent(new CustomEvent("wc:refresh"));
  }, []);

  const handleOpenExternal = useCallback(() => {
    window.open("about:blank", "_blank", "noopener,noreferrer");
  }, []);

  const handlePublish = useCallback(() => {
    navigate(`/project/${id}/deploy`);
  }, [id, navigate]);

  const handleShare = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }, []);

  return (
    <div className="pw-root" data-testid="project-workspace">
      <WorkspaceTopBar
        projectName={
          loadingMeta ? "Loading..." : (projectMeta?.name ?? "Untitled Project")
        }
        activePage={projectMeta?.activePage ?? "Homepage"}
        pages={projectMeta?.pages ?? ["Homepage"]}
        device={device}
        onDeviceChange={setDevice}
        onRefresh={handleRefresh}
        onOpenExternal={handleOpenExternal}
        onPublish={handlePublish}
        onShare={handleShare}
      />

      <div className="pw-body">
        <WorkspaceChatPanel
          messages={messages}
          loading={loadingMessages}
          onSend={handleSend}
        />

        <WorkspacePreviewPanel
          previewState={previewState}
          previewUrl={null}
          device={device}
        />
      </div>
    </div>
  );
}
