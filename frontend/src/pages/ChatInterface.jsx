import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { ChatTopBar } from "@/components/chat/ChatTopBar";
import { UserMessage, AssistantMessage } from "@/components/chat/ChatMessage";
import { PromptComposer } from "@/components/workspace/PromptComposer";
import { QuickChips } from "@/components/workspace/QuickChips";
import {
  getModelById,
  DEFAULT_MODEL_ID,
  AUTO_PICKED_MODEL_ID,
  DEFAULT_ROOM,
  QUICK_CHIPS,
} from "@/lib/workspaceData";
import { streamChat } from "@/lib/chatApi";

const nextId = () => `msg-${crypto.randomUUID().slice(0, 8)}`;

const makeTitleTopic = (text = "") => {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return "New Chat";
  return clean.length > 58 ? `${clean.slice(0, 58).trim()}…` : clean;
};

const toProviderMessages = (messages, nextUserText = null) => {
  const base = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.text?.trim())
    .map((m) => ({
      role: m.role,
      content: m.text,
    }));

  if (nextUserText) {
    base.push({ role: "user", content: nextUserText });
  }

  return base;
};

export default function ChatInterface() {
  const location = useLocation();
  const navigate = useNavigate();

  const seed = location.state || null;

  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("new");
  const [credits, setCredits] = useState(4250);
  const [model, setModel] = useState(() =>
    getModelById(seed?.modelId || DEFAULT_MODEL_ID),
  );
  const [autoMode, setAutoMode] = useState(seed?.autoMode || false);
  const [webSearch, setWebSearch] = useState(seed?.webSearch || false);
  const [activeChip, setActiveChip] = useState(seed?.chipId || null);
  const [room, setRoom] = useState(
    QUICK_CHIPS.find((c) => c.id === seed?.chipId)?.room || DEFAULT_ROOM,
  );
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const seededRef = useRef(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  const updateMessage = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }, []);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const title = makeTitleTopic(
    [...messages].reverse().find((m) => m.role === "user")?.text,
  );

  useEffect(() => {
    document.title = title ? `${title} — MicroAgent` : "MicroAgent — AI Workspace";
    return () => {
      document.title = "MicroAgent — AI Super Workspace";
    };
  }, [title]);

  const runGeneration = useCallback(
    (assistantId, prompt, opts = {}) => {
      const {
        roomAtSend = DEFAULT_ROOM,
        cost = 0,
        usedModel,
        contextMessages = [],
        webSearchAtSend = false,
      } = opts;
      const controller = new AbortController();
      abortRef.current = controller;
      setIsGenerating(true);

      let receivedToken = false;
      let thinkingSteps = [];

      streamChat({
        messages: contextMessages,
        modelId: usedModel?.id,
        autoMode,
        room: roomAtSend,
        webSearch: webSearchAtSend,
        signal: controller.signal,
        onMeta: (meta) => {
          updateMessage(assistantId, {
            providerModel: meta.model,
            status: "connected",
          });
        },
        onStatus: (status) => {
          if (status.phase === "web_search" && status.status === "started") {
            const step = status.message || `Searching the web for: ${status.query || prompt}`;
            thinkingSteps = [...thinkingSteps, step].filter(Boolean);
            updateMessage(assistantId, {
              state: "thinking",
              status: "searching web...",
              thinkingSteps,
            });
          }
          if (status.phase === "web_search" && status.status === "results") {
            const resultSteps = (status.results || [])
              .slice(0, 6)
              .map((result) => ({
                type: "web_result",
                title: result.title || result.url,
                url: result.url,
              }));
            thinkingSteps = [...thinkingSteps, ...resultSteps].filter(Boolean);
            updateMessage(assistantId, {
              state: "thinking",
              status: "reading sources...",
              thinkingSteps,
            });
          }
          if (status.phase === "web_fetch" && status.status === "completed") {
            const step = status.message || "Fetched web sources for synthesis.";
            thinkingSteps = [...thinkingSteps, step, "Synthesizing answer from web context."].filter(Boolean);
            updateMessage(assistantId, {
              state: "thinking",
              status: "synthesizing...",
              thinkingSteps,
            });
          }
        },
        onThinking: (step) => {
          thinkingSteps = [...thinkingSteps, step].filter(Boolean);
          updateMessage(assistantId, {
            state: "thinking",
            thinkingSteps,
            status: "thinking",
          });
        },
        onToken: (token) => {
          if (!token) return;
          receivedToken = true;
          updateMessage(assistantId, {
            state: "streaming",
            status: "streaming",
          });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, text: `${m.text || ""}${token}` } : m,
            ),
          );
        },
        onDone: () => {
          if (receivedToken) {
            updateMessage(assistantId, {
              state: "completed",
              status: "just now",
            });
          } else {
            updateMessage(assistantId, {
              state: "completed",
              status: "just now",
              text: "No response content received.",
            });
          }
          setCredits((c) => Math.max(0, c - cost));
          setIsGenerating(false);
          abortRef.current = null;
        },
        onError: (err) => {
          updateMessage(assistantId, {
            state: "error",
            status: "failed",
            error: err.message || "Streaming failed",
          });
          setIsGenerating(false);
          abortRef.current = null;
          toast("Generation failed", {
            description: err.message || "Provider stream failed",
          });
        },
      });
    },
    [autoMode, updateMessage],
  );

  const sendMessage = useCallback(
    (text, attachments = []) => {
      const userMsg = { id: nextId(), role: "user", text, webSearch };
      const usedModel = autoMode ? getModelById(AUTO_PICKED_MODEL_ID) : model;
      const assistantMsg = {
        id: nextId(),
        role: "assistant",
        state: "pending",
        model: usedModel,
        autoMode,
        webSearch,
        text: "",
        code: null,
        prompt: text,
        thinkingSteps: [],
      };
      const contextMessages = toProviderMessages(messages, text);

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      runGeneration(assistantMsg.id, text, {
        roomAtSend: room,
        cost: usedModel.credits || 0,
        usedModel,
        attachments,
        contextMessages,
        webSearchAtSend: webSearch,
      });
    },
    [autoMode, model, messages, room, runGeneration, webSearch],
  );

  useEffect(() => {
    if (seed?.prompt && !seededRef.current) {
      seededRef.current = true;
      sendMessage(seed.prompt);
      window.history.replaceState({}, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    const generatingMsg = messages.find(
      (m) =>
        m.role === "assistant" &&
        (m.state === "pending" || m.state === "thinking" || m.state === "streaming"),
    );
    if (generatingMsg) {
      setCredits((c) => Math.max(0, c - (generatingMsg.model.credits || 0)));
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.role === "assistant" &&
        (m.state === "pending" || m.state === "thinking" || m.state === "streaming")
          ? {
              ...m,
              state: "completed",
              status: "stopped",
              stopped: true,
              text: m.text || "—",
            }
          : m,
      ),
    );
    setIsGenerating(false);
    toast("Generation stopped");
  };

  const handleRetry = (messageId) => {
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    const priorMessages = messages.filter((m) => m.id !== messageId);
    const contextMessages = toProviderMessages(priorMessages);

    updateMessage(messageId, {
      state: "pending",
      text: "",
      code: null,
      thinkingSteps: [],
      stopped: false,
      error: null,
    });
    runGeneration(messageId, msg.prompt, {
      roomAtSend: room,
      cost: msg.model.credits || 0,
      usedModel: msg.model,
      contextMessages,
      webSearchAtSend: msg.webSearch || false,
    });
  };

  const handleModelSelect = (m, isAuto) => {
    if (isAuto) {
      setAutoMode(true);
    } else {
      setAutoMode(false);
      setModel(m);
    }
  };

  const handleAutoModeToggle = () => {
    const next = !autoMode;
    setAutoMode(next);
    toast(next ? "Auto Mode on" : "Auto Mode off", {
      description: next
        ? "MicroAgent picks the best model for every prompt"
        : `Back to ${model.name}`,
    });
  };

  const handleChipClick = (chip) => {
    if (activeChip === chip.id) {
      setActiveChip(null);
      setRoom(DEFAULT_ROOM);
      toast(`Back to ${DEFAULT_ROOM}`);
    } else {
      setActiveChip(chip.id);
      setRoom(chip.room);
      toast(`Switched to ${chip.room}`);
    }
  };

  const handleNavChange = (id) => {
    if (id === "new") {
      navigate("/home");
      return;
    }
    setActiveNav(id);
  };

  return (
    <div className="ma-page relative flex h-dvh flex-col">
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div
        className={`flex h-full min-h-0 flex-col transition-[margin] duration-300 ease-out ${
          collapsed ? "md:ml-[68px]" : "md:ml-[86px]"
        }`}
      >
        <ChatTopBar title={title} room={room} credits={credits} />

        <main
          ref={scrollRef}
          data-testid="chat-messages"
          className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
        >
          <div className="mx-auto flex w-full max-w-[860px] flex-col gap-4 px-3 py-6 sm:gap-6 sm:px-4 sm:py-8">
            {messages.length === 0 && (
              <div className="mx-auto mt-[8vh] max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-5 text-center shadow-[0_1px_2px_rgba(17,24,39,0.04)] sm:mt-[12vh] sm:rounded-[28px] sm:p-6">
                <p className="text-sm font-semibold text-[#111111]">Start a real chat</p>
                <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                  Pick a model, type a prompt, and MicroAgent will stream the response from your configured provider.
                </p>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <UserMessage key={m.id} message={m} />
              ) : (
                <AssistantMessage key={m.id} message={m} onRetry={handleRetry} />
              ),
            )}
          </div>
        </main>

        <footer className="shrink-0 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8]/95 to-transparent pb-[84px] pt-2 sm:pb-5 md:pb-5">
          <div className="mx-auto w-full max-w-[860px] px-3 sm:max-w-[860px] sm:px-4 sm:px-6" data-testid="chat-composer">
            <div className="mb-2.5 sm:mb-3">
              <QuickChips compact activeChip={activeChip} onChipClick={handleChipClick} />
            </div>
            <PromptComposer
              compact
              placeholder="Ask anything"
              onSend={sendMessage}
              isGenerating={isGenerating}
              onStop={handleStop}
              model={model}
              autoMode={autoMode}
              onModelSelect={handleModelSelect}
              onAutoModeToggle={handleAutoModeToggle}
              webSearchEnabled={webSearch}
              onWebSearchToggle={() => setWebSearch((value) => !value)}
            />
          </div>
        </footer>
      </div>

      <MobileNav activeNav={activeNav} onNavChange={handleNavChange} />
    </div>
  );
}
