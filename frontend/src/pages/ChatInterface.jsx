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
  buildMockAnswer,
  EXAMPLE_USER_PROMPT,
  EXAMPLE_ASSISTANT_TEXT,
  DYNAMIC_ISLAND_CODE,
} from "@/lib/workspaceData";

let idCounter = 0;
const nextId = () => `msg-${Date.now()}-${idCounter++}`;

const EXAMPLE_CONVERSATION = [
  {
    id: "example-user",
    role: "user",
    text: EXAMPLE_USER_PROMPT,
  },
  {
    id: "example-assistant",
    role: "assistant",
    state: "completed",
    model: getModelById("deepseek-v4-pro"),
    autoMode: false,
    status: "just now",
    text: EXAMPLE_ASSISTANT_TEXT,
    code: DYNAMIC_ISLAND_CODE,
    prompt: EXAMPLE_USER_PROMPT,
  },
];

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
  const [activeChip, setActiveChip] = useState(seed?.chipId || null);
  const [room, setRoom] = useState(
    QUICK_CHIPS.find((c) => c.id === seed?.chipId)?.room || DEFAULT_ROOM,
  );
  const [messages, setMessages] = useState(() =>
    seed?.prompt ? [] : EXAMPLE_CONVERSATION,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const timersRef = useRef([]);
  const intervalRef = useRef(null);
  const seededRef = useRef(false);
  const scrollRef = useRef(null);
  const retriedRef = useRef(new Set());

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const updateMessage = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );
  }, []);

  const runGeneration = useCallback(
    (assistantId, prompt, opts = {}) => {
      const { forceSuccess = false, roomAtSend = DEFAULT_ROOM, cost = 0 } = opts;
      const shouldFail =
        !forceSuccess &&
        /\berror\b/i.test(prompt) &&
        !retriedRef.current.has(assistantId);

      setIsGenerating(true);

      // pending -> thinking
      timersRef.current.push(
        setTimeout(() => {
          updateMessage(assistantId, { state: "thinking" });
        }, 500),
      );

      if (shouldFail) {
        timersRef.current.push(
          setTimeout(() => {
            updateMessage(assistantId, { state: "error" });
            setIsGenerating(false);
          }, 2300),
        );
        return;
      }

      const answer = buildMockAnswer(prompt, roomAtSend);
      const words = answer.text.split(" ");

      // thinking -> streaming
      timersRef.current.push(
        setTimeout(() => {
          updateMessage(assistantId, { state: "streaming", text: "" });
          let i = 0;
          intervalRef.current = setInterval(() => {
            i += 2;
            const partial = words.slice(0, i).join(" ");
            if (i >= words.length) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
              updateMessage(assistantId, {
                state: "completed",
                text: answer.text,
                code: answer.code,
                status: "just now",
              });
              setCredits((c) => Math.max(0, c - cost));
              setIsGenerating(false);
            } else {
              updateMessage(assistantId, { text: partial });
            }
          }, 50);
        }, 2100),
      );
    },
    [updateMessage],
  );

  const sendMessage = useCallback(
    (text) => {
      const userMsg = { id: nextId(), role: "user", text };
      const usedModel = autoMode
        ? getModelById(AUTO_PICKED_MODEL_ID)
        : model;
      const assistantMsg = {
        id: nextId(),
        role: "assistant",
        state: "pending",
        model: usedModel,
        autoMode,
        text: "",
        code: null,
        prompt: text,
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      runGeneration(assistantMsg.id, text, {
        roomAtSend: room,
        cost: usedModel.credits,
      });
    },
    [autoMode, model, room, runGeneration],
  );

  // Seed conversation from Home navigation (StrictMode-safe)
  useEffect(() => {
    if (seed?.prompt && !seededRef.current) {
      seededRef.current = true;
      sendMessage(seed.prompt);
      window.history.replaceState({}, "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom as messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleStop = () => {
    clearTimers();
    const generatingMsg = messages.find(
      (m) =>
        m.role === "assistant" &&
        (m.state === "pending" ||
          m.state === "thinking" ||
          m.state === "streaming"),
    );
    if (generatingMsg) {
      setCredits((c) => Math.max(0, c - generatingMsg.model.credits));
    }
    setMessages((prev) =>
      prev.map((m) =>
        m.role === "assistant" &&
        (m.state === "pending" ||
          m.state === "thinking" ||
          m.state === "streaming")
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
    retriedRef.current.add(messageId);
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;
    updateMessage(messageId, { state: "pending", text: "" });
    runGeneration(messageId, msg.prompt, {
      forceSuccess: true,
      roomAtSend: room,
      cost: msg.model.credits,
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
      navigate("/");
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
        <ChatTopBar title="New Chat" room={room} credits={credits} />

        {/* Messages */}
        <main
          ref={scrollRef}
          data-testid="chat-messages"
          className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
        >
          <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 py-8 sm:px-6">
            {messages.map((m) =>
              m.role === "user" ? (
                <UserMessage key={m.id} message={m} />
              ) : (
                <AssistantMessage
                  key={m.id}
                  message={m}
                  onRetry={handleRetry}
                />
              ),
            )}
          </div>
        </main>

        {/* Composer */}
        <footer className="shrink-0 bg-gradient-to-t from-[#F7F7F8] via-[#F7F7F8]/95 to-transparent pb-[84px] pt-2 md:pb-5">
          <div
            className="mx-auto w-full max-w-[860px] px-4 sm:px-6"
            data-testid="chat-composer"
          >
            <div className="mb-3">
              <QuickChips
                compact
                activeChip={activeChip}
                onChipClick={handleChipClick}
              />
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
            />
          </div>
        </footer>
      </div>

      <MobileNav activeNav={activeNav} onNavChange={handleNavChange} />
    </div>
  );
}
