import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { createSession, saveMessages, fetchSessions, deleteSession, isSupabaseEnabled } from "@/lib/supabase";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMessage, AssistantMessage } from "@/components/chat/ChatMessage";
import { PromptComposer } from "@/components/workspace/PromptComposer";
import { HistoryDialog } from "@/components/workspace/HistoryDialog";
import { ProjectsDialog } from "@/components/workspace/ProjectsDialog";
import { MoreDialog } from "@/components/workspace/MoreDialog";
import {
  getModelById,
  DEFAULT_MODEL_ID,
  AUTO_PICKED_MODEL_ID,
  DEFAULT_ROOM,
  QUICK_CHIPS,
  IMAGE_MODEL,
} from "@/lib/workspaceData";
import { streamChat, isImageRequest, generateImage, streamDeepResearch, uploadAndAnalyze } from "@/lib/chatApi";
import { useSubscription } from "@/lib/useSubscription";
import { ClarificationOptions } from "@/components/chat/ClarificationOptions";
import { isVaguePrompt, getCodingOptions } from "@/lib/promptClarifier";
import { DeepResearchPanel } from "@/components/chat/DeepResearchPanel";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";

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
  const [activeDialog, setActiveDialog] = useState(null);
  const [credits, setCredits] = useState(null);
  const [model, setModel] = useState(() =>
    getModelById(seed?.modelId || DEFAULT_MODEL_ID),
  );
  const [autoMode, setAutoMode] = useState(seed?.autoMode || false);
  const [webSearch, setWebSearch] = useState(seed?.modeWebSearch || seed?.webSearch || false);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [activeChip, setActiveChip] = useState(seed?.chipId || null);
  const [room, setRoom] = useState(
    QUICK_CHIPS.find((c) => c.id === seed?.chipId)?.room || DEFAULT_ROOM,
  );
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const deepResearchAbortRef = useRef(null);

  const seededRef = useRef(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  // Supabase session
  const { user, incrementGuestCount, checkGuestAllowed, isGuestLimitReached, guestRemaining, GUEST_LIMIT } = useAuth();
  const { plan, isPro, isUltra, features, subscription } = useSubscription();
  const [sessionId, setSessionId] = useState(null);
  const savedMsgCountRef = useRef(0);

  // Sync credits from subscription
  useEffect(() => {
    if (subscription?.credits != null) {
      setCredits(subscription.credits);
    }
  }, [subscription?.credits]);

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
        reasoningAtSend = true,
        searchModePrompt = "",
        skillSlug = null,
        effortLevel = "low",
      } = opts;
      // Abort any existing generation before starting a new one
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
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
        skillSlug,
        effortLevel,
        reasoning: reasoningAtSend,
        searchModePrompt,
        signal: controller.signal,
        onMeta: (meta) => {
          updateMessage(assistantId, {
            providerModel: meta.model,
            status: "connected",
          });
        },
        onStatus: (status) => {
          if (status.phase === "skill_loading" && status.status === "started") {
            updateMessage(assistantId, {
              state: "thinking",
              status: "loading skill...",
              skillPhase: "loading",
              skillSlug: status.skill_slug || skillSlug,
            });
          }
          if (status.phase === "skill_loading" && status.status === "completed") {
            updateMessage(assistantId, {
              skillPhase: "loaded",
              status: "skill loaded",
            });
          }
          if (status.phase === "web_search" && status.status === "started") {
            updateMessage(assistantId, {
              state: "thinking",
              status: "searching web...",
              webPhase: "searching",
              webQuery: status.query || "",
              webResults: [],
            });
            // For non-web search modes (academic/social), also set searchMode to trigger pipeline
            setMessages((prev) => prev.map((m) => {
              if (m.id !== assistantId) return m;
              if (!m.searchMode || m.searchMode === "off") return { ...m, searchMode: "web" };
              return m;
            }));
          }
          if (status.phase === "web_search" && status.status === "results") {
            const results = (status.results || []).slice(0, 10).map((r) => ({
              type: "web_result",
              title: r.title || r.url,
              url: r.url,
            }));
            updateMessage(assistantId, {
              state: "thinking",
              status: "reading sources...",
              webPhase: "reading",
              webResults: results,
            });
          }
          if (status.phase === "web_fetch" && status.status === "completed") {
            updateMessage(assistantId, {
              state: "thinking",
              status: "synthesizing...",
              webPhase: "synthesizing",
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
        onReasoning: (text) => {
          if (!text || !reasoningAtSend) return;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, state: "thinking", status: "reasoning", reasoningText: ((m.reasoningText || "") + text) }
                : m,
            ),
          );
        },
        onToken: (token) => {
          if (!token) return;
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantId) return m;
              const raw = (m._rawText || m.text || "") + token;

              // Route <think> content to reasoningText, not to chat text
              const thinkStart = raw.indexOf("<think>");
              const thinkEnd = raw.indexOf("</think>");

              let displayText;
              let reasoningText = m.reasoningText || "";

              if (thinkStart === -1) {
                // No think block at all
                displayText = raw;
              } else if (thinkEnd !== -1 && thinkEnd > thinkStart) {
                // Complete think block — extract reasoning, remove from display
                const thinking = raw.slice(thinkStart + 7, thinkEnd).trim();
                reasoningText = thinking;
                displayText = (raw.slice(0, thinkStart) + raw.slice(thinkEnd + 8)).trim();
              } else {
                // Think block still open — stream inner content to reasoningText
                reasoningText = raw.slice(thinkStart + 7).trim();
                displayText = raw.slice(0, thinkStart).trim();
              }

              const isThinking = thinkStart !== -1 && thinkEnd === -1;
              receivedToken = displayText.length > 0;

              return {
                ...m,
                _rawText: raw,
                text: displayText,
                reasoningText,
                state: isThinking ? "thinking" : "streaming",
                status: isThinking ? "reasoning" : "streaming",
              };
            }),
          );
          if (!receivedToken) receivedToken = false;
          else {
            updateMessage(assistantId, { state: "streaming", status: "streaming" });
          }
        },
        onDone: () => {
          // Check if completed text contains a QNA block
          setMessages((prev) => {
            const msg = prev.find((m) => m.id === assistantId);
            if (!msg) return prev;
            const fullText = msg._rawText || msg.text || "";
            const qnaMatch = fullText.match(/<QNA>([\s\S]*?)<\/QNA>/);
            if (qnaMatch) {
              try {
                const qnaData = JSON.parse(qnaMatch[1].trim());
                const preText = fullText.slice(0, qnaMatch.index).trim();
                return prev.map((m) => m.id === assistantId ? {
                  ...m,
                  state: "clarifying",
                  status: "just now",
                  text: preText,
                  qna: qnaData,
                } : m);
              } catch { /* malformed JSON — fall through to normal */ }
            }
            return prev;
          });

          if (receivedToken) {
            setMessages((prev) => prev.map((m) => {
              if (m.id !== assistantId) return m;
              if (m.state === "clarifying") return m; // already handled by QNA parser
              return { ...m, state: "completed", status: "just now" };
            }));
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

  const handleFileUploadAnalysis = useCallback(async (text, files) => {
    // File analysis requires Pro
    if (!isPro) {
      toast("File analysis membutuhkan Pro", {
        description: "Upgrade ke Pro untuk menganalisis file.",
        action: { label: "Upgrade", onClick: () => navigate("/pricing") },
      });
      setUploadedFiles([]);
      return;
    }
    const usedModel = autoMode ? getModelById(AUTO_PICKED_MODEL_ID) : model;
    const userMsg = { id: nextId(), role: "user", text, uploadedFiles: files.map(f => ({ name: f.name, type: f.type, size: f.size })) };
    const assistantMsgId = nextId();
    const assistantMsg = {
      id: assistantMsgId, role: "assistant", state: "pending",
      model: usedModel, text: "", prompt: text, thinkingSteps: [], reasoningText: "",
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsGenerating(true);
    try {
      const data = await uploadAndAnalyze({ files, prompt: text, chatHistory: messages });
      updateMessage(assistantMsgId, { state: "completed", status: "just now", text: data.response || "" });
    } catch (err) {
      updateMessage(assistantMsgId, { state: "error", status: "failed", error: err.message });
      toast("Analisis gagal", { description: err.message });
    } finally {
      setIsGenerating(false);
      setUploadedFiles([]);
    }
  }, [autoMode, model, messages, updateMessage, isPro, navigate]);

  const sendMessage = useCallback(
    (text, attachments = [], searchModePrompt = "", searchModeId = "", modeWebSearch = false, skillSlug = null, effortLevel = "low", _isSeed = false) => {
      // Guest limit gate — seed prompts already counted in HomeWorkspace
      const allowed = _isSeed ? checkGuestAllowed() : incrementGuestCount();
      if (!allowed) {
        navigate("/auth", { state: { from: "/chat", tab: "login" } });
        toast("Prompt limit reached", { description: `Sign in to continue. Guest limit: ${GUEST_LIMIT} prompts.` });
        return;
      }
      // If files are attached, route to file analysis
      if (uploadedFiles.length > 0) {
        handleFileUploadAnalysis(text, uploadedFiles);
        return;
      }
      const userMsg = { id: nextId(), role: "user", text, webSearch };
      const usedModel = autoMode ? getModelById(AUTO_PICKED_MODEL_ID) : model;
      const isImgReq = isImageRequest(text);
      // Use explicit searchModeId from composer, fallback to webSearch flag
      const activeModeId = searchModeId && searchModeId !== "off"
        ? searchModeId
        : webSearch ? "web" : "off";
      const assistantMsg = {
        id: nextId(),
        role: "assistant",
        state: "pending",
        model: isImgReq ? IMAGE_MODEL : usedModel,
        autoMode: isImgReq ? false : autoMode,
        webSearch,
        searchMode: isImgReq ? "off" : activeModeId,
        skillSlug: skillSlug || null,
        skillPhase: skillSlug ? "loading" : null,
        text: "",
        code: null,
        prompt: text,
        thinkingSteps: [],
        reasoningText: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Route image requests to image generation
      if (isImgReq) {
        updateMessage(assistantMsg.id, { state: "streaming", status: "generating image..." });
        setIsGenerating(true);
        generateImage(text)
          .then((data) => {
            updateMessage(assistantMsg.id, {
              state: "completed",
              status: "just now",
              imageUrl: data.image_url,
              text: `Gambar berhasil digenerate untuk prompt: "${text}"`,
            });
          })
          .catch((err) => {
            updateMessage(assistantMsg.id, {
              state: "error",
              status: "failed",
              error: err.message || "Gagal generate gambar",
            });
            toast("Gagal generate gambar", { description: err.message });
          })
          .finally(() => setIsGenerating(false));
        return;
      }

      const contextMessages = toProviderMessages(messages, text);

      if (isVaguePrompt(text)) {
        updateMessage(assistantMsg.id, {
          state: "clarifying",
          clarifyOptions: getCodingOptions(),
        });
        return;
      }

      // Use web search if: globe toggle is on, OR selected mode requires web search
      const shouldWebSearch = webSearch || modeWebSearch;
      runGeneration(assistantMsg.id, text, {
        roomAtSend: room,
        cost: usedModel.credits || 0,
        usedModel,
        attachments,
        contextMessages,
        webSearchAtSend: shouldWebSearch,
        reasoningAtSend: reasoningEnabled,
        searchModePrompt,
        skillSlug,
        effortLevel,
      });
    },
    [autoMode, model, messages, room, runGeneration, webSearch, reasoningEnabled, updateMessage, uploadedFiles, handleFileUploadAnalysis, incrementGuestCount, checkGuestAllowed, navigate, GUEST_LIMIT], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleDeepResearch = useCallback(async (query) => {
    const userMsg = { id: nextId(), role: "user", text: query };
    const usedModel = getModelById(DEFAULT_MODEL_ID);
    const researchMsgId = nextId();
    const researchMsg = {
      id: researchMsgId,
      role: "assistant",
      state: "pending",
      model: usedModel,
      text: "",
      prompt: query,
      isDeepResearch: true,
      deepResearch: { phase: "running", steps: [], sources: [], sourcesFound: [], query, elapsed: "" },
      thinkingSteps: [],
      reasoningText: "",
    };

    setMessages((prev) => [...prev, userMsg, researchMsg]);
    setIsGenerating(true);

    try {
      for await (const evt of streamDeepResearch(query)) {
        if (evt.type === "start") {
          updateMessage(researchMsgId, { state: "streaming", status: "starting..." });
        } else if (evt.type === "step") {
          setMessages((prev) => prev.map((m) => {
            if (m.id !== researchMsgId) return m;
            const dr = m.deepResearch || {};
            return { ...m, state: "streaming", deepResearch: { ...dr, steps: [...(dr.steps || []), { action: evt.action, message: evt.message, url: evt.url }] } };
          }));
        } else if (evt.type === "source_added") {
          setMessages((prev) => prev.map((m) => {
            if (m.id !== researchMsgId) return m;
            const dr = m.deepResearch || {};
            return { ...m, deepResearch: { ...dr, sources: [...(dr.sources || []), { url: evt.url, title: evt.title || evt.url }] } };
          }));
        } else if (evt.type === "source_found") {
          setMessages((prev) => prev.map((m) => {
            if (m.id !== researchMsgId) return m;
            const dr = m.deepResearch || {};
            return { ...m, deepResearch: { ...dr, sourcesFound: [...(dr.sourcesFound || []), { url: evt.url, title: evt.title || evt.url }] } };
          }));
        } else if (evt.type === "images_found") {
          setMessages((prev) => prev.map((m) => {
            if (m.id !== researchMsgId) return m;
            const dr = m.deepResearch || {};
            return { ...m, deepResearch: { ...dr, images: evt.images || [] } };
          }));
        } else if (evt.type === "complete") {
          const reportText = (evt.report || "").trim();
          // Preserve existing steps from streaming, update sources + phase
          setMessages((prev) => {
            const updated = prev.map((m) => {
              if (m.id !== researchMsgId) return m;
              const dr = m.deepResearch || {};
              return {
                ...m,
                state: "completed",
                status: "just now",
                text: "",  // panel message has no text
                deepResearch: {
                  ...dr,
                  phase: "done",
                  sources: evt.sources && evt.sources.length > 0 ? evt.sources : (dr.sources || []),
                  elapsed: evt.elapsed || dr.elapsed || "",
                  steps: dr.steps && dr.steps.length > 0 ? dr.steps : [],
                },
              };
            });
            // Add a separate regular assistant message with the report
            if (reportText.length > 50) {
              const reportMsg = {
                id: nextId(),
                role: "assistant",
                state: "completed",
                status: "just now",
                model: getModelById(DEFAULT_MODEL_ID),
                text: reportText,
                prompt: query,
                thinkingSteps: [],
                reasoningText: "",
                isDeepResearch: false,
              };
              return [...updated, reportMsg];
            }
            return updated;
          });
          setIsGenerating(false);
          return;
        } else if (evt.type === "error") {
          updateMessage(researchMsgId, { state: "error", status: "failed", error: evt.message });
          toast("Riset gagal", { description: evt.message });
          setIsGenerating(false);
          return;
        }
      }
    } catch (err) {
      updateMessage(researchMsgId, { state: "error", status: "failed", error: err.message });
      toast("Riset gagal", { description: err.message });
    } finally {
      setIsGenerating(false);
    }
  }, [updateMessage]);

  const handleRefine = useCallback((assistantId, refined) => {
    const assistantMsg = messages.find((m) => m.id === assistantId);
    if (!assistantMsg) return;
    const usedModel = autoMode ? getModelById(AUTO_PICKED_MODEL_ID) : model;

    // Tag the answer so AI knows it's a QNA response, not a new vague request
    const isQnaAnswer = assistantMsg.qna != null;
    const taggedContent = isQnaAnswer ? `[QNA_ANSWER] ${refined}` : refined;

    // Show clean text in UI (without internal tag)
    const userAnswerMsg = { id: nextId(), role: "user", text: refined };

    // Create a new assistant message for the response
    const newAssistantId = nextId();
    const newAssistantMsg = {
      id: newAssistantId,
      role: "assistant",
      state: "pending",
      model: usedModel,
      autoMode: autoMode,
      webSearch,
      text: "",
      code: null,
      prompt: refined,
      thinkingSteps: [],
      reasoningText: "",
    };

    // Mark old QNA message as answered
    setMessages((prev) => [
      ...prev.map((m) => m.id === assistantId ? { ...m, state: "completed", status: "answered" } : m),
      userAnswerMsg,
      newAssistantMsg,
    ]);

    // Build context: include full history with QNA assistant msg as text
    // and send tagged answer to API
    const historyForContext = messages.map((m) => {
      if (m.id === assistantId) {
        // Replace QNA card with its pre-text or a neutral placeholder for context
        return { ...m, role: "assistant", text: m.text || "[Pertanyaan klarifikasi]", state: "completed" };
      }
      return m;
    });
    const contextMessages = toProviderMessages(
      [...historyForContext, { id: "__qna_ans", role: "user", text: taggedContent }],
      null
    );

    runGeneration(newAssistantId, taggedContent, {
      roomAtSend: room,
      cost: usedModel.credits || 0,
      usedModel,
      attachments: [],
      contextMessages,
      webSearchAtSend: webSearch,
      reasoningAtSend: reasoningEnabled,
    });
  }, [autoMode, model, messages, room, runGeneration, webSearch, reasoningEnabled, setMessages]);

  // Seed from home workspace — wait until component is mounted and
  // isGenerating is confirmed false before triggering first message
  const seedTriggeredRef = useRef(false);
  useEffect(() => {
    if (seed?.prompt && !seedTriggeredRef.current && !seededRef.current) {
      seedTriggeredRef.current = true;
      // Small delay to ensure React state is stable after navigation
      const t = setTimeout(() => {
        if (!seededRef.current) {
          seededRef.current = true;
          sendMessage(
            seed.prompt,
            seed.attachments || [],
            seed.searchModePrompt || "",
            seed.searchModeId || "off",
            seed.modeWebSearch || false,
            seed.skillSlug || null,
            seed.effortLevel || "low",
            true, // _isSeed — already counted in HomeWorkspace
          );
          window.history.replaceState({}, "");
        }
      }, 80);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Auto-create Supabase session when first message sent
  useEffect(() => {
    if (!isSupabaseEnabled || !user || sessionId || messages.length === 0) return;
    const firstUser = messages.find((m) => m.role === "user");
    if (!firstUser) return;
    createSession({ title: makeTitleTopic(firstUser.text), model_id: model.id, room })
      .then((sess) => sess && setSessionId(sess.id))
      .catch(() => {});
  }, [messages, user, sessionId, model, room]);

  // Auto-save completed messages to Supabase
  useEffect(() => {
    if (!isSupabaseEnabled || !user || !sessionId) return;
    const completed = messages.filter((m) => m.state === "completed" || m.role === "user");
    const unsaved = completed.slice(savedMsgCountRef.current);
    if (!unsaved.length) return;
    saveMessages(sessionId, unsaved)
      .then(() => { savedMsgCountRef.current = completed.length; })
      .catch(() => {});
  }, [messages, sessionId, user]);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    const generatingMsg = messages.find(
      (m) =>
        m.role === "assistant" &&
        (m.state === "pending" || m.state === "thinking" || m.state === "streaming"),
    );
    if (generatingMsg) {
      setCredits((c) => c !== null ? Math.max(0, c - (generatingMsg.model.credits || 0)) : null);
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
      reasoningText: "",
      stopped: false,
      error: null,
    });
    runGeneration(messageId, msg.prompt, {
      roomAtSend: room,
      cost: msg.model.credits || 0,
      usedModel: msg.model,
      contextMessages,
      webSearchAtSend: msg.webSearch || false,
      reasoningAtSend: reasoningEnabled,
    });
  };

  const handleModelSelect = (m, isAuto) => {
    if (isAuto) {
      if (!isPro) {
        toast("Auto Mode requires Pro", { description: "Upgrade to Pro to use Auto Mode." });
        return;
      }
      setAutoMode(true);
    } else {
      setAutoMode(false);
      // Block expensive models for free users
      if (!isPro && m.isExpensive) {
        toast("Model ini membutuhkan plan Pro atau Ultra", {
          description: `${m.name} hanya tersedia di Pro/Ultra. Upgrade sekarang.`,
          action: { label: "Upgrade", onClick: () => navigate("/pricing") },
        });
        return;
      }
      setModel(m);
    }
  };

  const handleAutoModeToggle = () => {
    if (!isPro && !autoMode) {
      toast("Auto Mode requires Pro", {
        description: "Upgrade ke Pro untuk menggunakan Auto Mode.",
        action: { label: "Upgrade", onClick: () => navigate("/pricing") },
      });
      return;
    }
    const next = !autoMode;
    setAutoMode(next);
    toast(next ? "Auto Mode on" : "Auto Mode off", {
      description: next
        ? "MicroAgent picks the best model for every prompt"
        : `Back to ${model.name}`,
    });
  };

  const handleReasoningToggle = () => {
    setReasoningEnabled((r) => !r);
    toast(`Reasoning ${reasoningEnabled ? "off" : "on"}`, {
      description: reasoningEnabled
        ? "AI will skip showing its thought process"
        : "AI will show its reasoning steps",
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
    setActiveDialog(id);
  };

  return (
    <div className="ma-page relative flex h-dvh flex-col">
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onLogoClick={() => navigate("/home")}
      />

      <div
        className={`flex h-full min-h-0 flex-col transition-[margin] duration-300 ease-out ${
          collapsed ? "md:ml-[68px]" : "md:ml-[86px]"
        }`}
      >
        <main
          ref={scrollRef}
          data-testid="chat-messages"
          className="relative min-h-0 flex-1 overflow-y-auto scroll-smooth"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files).slice(0, 5);
            if (files.length) setUploadedFiles((prev) => [...prev, ...files].slice(0, 5));
          }}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#F0F9FF]/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-[#0369A1] px-12 py-10">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <p className="text-[15px] font-semibold text-[#0369A1]">Drop file untuk dianalisis</p>
                <p className="text-[12px] text-[#0369A1]/70">PDF, DOCX, XLSX, gambar, TXT</p>
              </div>
            </div>
          )}
        
          <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 px-4 py-6 sm:gap-4 sm:px-6 sm:py-8">
            {messages.length === 0 && (
              <div className="mx-auto mt-[6vh] max-w-sm text-center sm:mt-[10vh]">
                <p className="text-sm font-medium text-[#6B7280]">Start a conversation</p>
                <p className="mt-1.5 text-xs text-[#9CA3AF]">
                  Messages will appear here
                </p>
              </div>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <UserMessage key={m.id} message={m} />
              ) : m.isDeepResearch ? (
                <div key={m.id} className="ma-msg-in flex justify-start">
                  <div className="w-full max-w-full">
                    <DeepResearchPanel
                      steps={m.deepResearch?.steps || []}
                      sources={m.deepResearch?.sources || []}
                      sourcesFound={m.deepResearch?.sourcesFound || []}
                      images={m.deepResearch?.images || []}
                      phase={m.deepResearch?.phase || "running"}
                      query={m.deepResearch?.query || m.prompt || ""}
                      elapsed={m.deepResearch?.elapsed || ""}
                    />
                    {m.state === "completed" && m.text && m.text.length > 50 && (
                      <div className="ma-msg-in mt-2 rounded-[24px] bg-white p-5 shadow-[0_1px_3px_rgba(17,24,39,0.06)] sm:p-6">
                        <MarkdownMessage text={m.text} />
                      </div>
                    )}
                    {m.state === "error" && (
                      <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4">
                        <p className="text-sm text-[#991B1B]">{m.error || "Riset gagal"}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <AssistantMessage key={m.id} message={m} onRetry={handleRetry} onRefine={handleRefine} />
              ),
            )}
            {/* Bottom padding so last message isn't hidden behind composer */}
            <div className="h-4" aria-hidden="true" />
          </div>
        </main>

        <footer className="shrink-0 pt-3 sm:pb-4 md:pb-4" style={{paddingBottom: 'max(32px, env(safe-area-inset-bottom))'}}>        
          <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6" data-testid="chat-composer">
            {/* File preview bar */}
            {uploadedFiles.length > 0 && (
              <div className="ma-fade-in mb-2 flex flex-wrap gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-3 py-2">
                {uploadedFiles.map((file, idx) => {
                  const ext = file.name.split(".").pop().toLowerCase();
                  const icons = { pdf: "📄", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️", docx: "📝", xlsx: "📊", xls: "📊", txt: "📃", csv: "📃", md: "📃" };
                  const icon = icons[ext] || "📎";
                  return (
                    <span key={idx} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F7F7F8] py-1 pl-2 pr-1.5 text-xs text-[#374151]">
                      <span>{icon}</span>
                      <span className="max-w-[120px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="ml-0.5 grid h-4 w-4 place-items-center rounded-full text-[#9CA3AF] hover:bg-[#E5E7EB] hover:text-[#374151]"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            <PromptComposer
              compact
              placeholder={uploadedFiles.length > 0 ? "Tanya atau instruksikan tentang file ini..." : "Ask anything"}
              onSend={sendMessage}
              onDeepResearch={handleDeepResearch}
              onFileSelect={(files) => {
                if (!isPro) {
                  toast("File upload membutuhkan Pro", {
                    description: "Upgrade ke Pro untuk upload file.",
                    action: { label: "Upgrade", onClick: () => navigate("/pricing") },
                  });
                  return;
                }
                setUploadedFiles((prev) => [...prev, ...files].slice(0, 5));
              }}
              uploadedFilesCount={uploadedFiles.length}
              isGenerating={isGenerating}
              onStop={handleStop}
              model={model}
              autoMode={autoMode}
              onModelSelect={handleModelSelect}
              onAutoModeToggle={handleAutoModeToggle}
              webSearchEnabled={webSearch}
              onWebSearchToggle={() => setWebSearch((value) => !value)}
              reasoningEnabled={reasoningEnabled}
              onReasoningToggle={handleReasoningToggle}
              initialSearchMode={seed?.searchModeId || "off"}
              initialSkill={seed?.skillSlug ? { slug: seed.skillSlug, name: seed.skillSlug, icon: "🧠" } : null}
              initialEffortLevel={seed?.effortLevel || "low"}
            />
            <p className="mt-2 text-center text-[11px] text-[#9CA3AF]">
              MicroAgent can make mistakes. Always double-check important information.
            </p>
          </div>
        </footer>
      </div>

      <MobileNav activeNav={activeNav} onNavChange={handleNavChange} />

      <HistoryDialog
        open={activeDialog === "history"}
        onOpenChange={(open) => setActiveDialog(open ? "history" : null)}
      />
      <ProjectsDialog
        open={activeDialog === "projects"}
        onOpenChange={(open) => setActiveDialog(open ? "projects" : null)}
      />
      <MoreDialog
        open={activeDialog === "more"}
        onOpenChange={(open) => setActiveDialog(open ? "more" : null)}
      />
    </div>
  );
}
