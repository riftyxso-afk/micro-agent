import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import { createSession, saveMessages, fetchSessions, deleteSession, updateSession, isSupabaseEnabled, uploadFileToStorage } from "@/lib/supabase";
import { Sidebar } from "@/components/workspace/Sidebar";
import { MobileNav } from "@/components/workspace/MobileNav";
import { UserMessage, AssistantMessage } from "@/components/chat/ChatMessage";
import { PromptComposer } from "@/components/workspace/PromptComposer";
import { HistoryDialog } from "@/components/workspace/HistoryDialog";
import { ProjectsDialog } from "@/components/workspace/ProjectsDialog";
import { MoreDialog } from "@/components/workspace/MoreDialog";
import { LowTokenPopup } from "@/components/workspace/LowTokenPopup";
import { RagPanel } from "@/components/workspace/RagPanel";
import { SurveyModal } from "@/components/workspace/SurveyModal";
import {
  getModelById,
  DEFAULT_MODEL_ID,
  AUTO_PICKED_MODEL_ID,
  DEFAULT_ROOM,
  QUICK_CHIPS,
  IMAGE_MODEL,
  MODEL_TOKEN_COST,
} from "@/lib/workspaceData";
import { streamChat, isImageRequest, isComparisonRequest, generateImage, streamDeepResearch, uploadAndAnalyze, aiGenerateDocument, API_BASE_URL, needsWebSearch } from "@/lib/chatApi";
import { useSubscription } from "@/lib/useSubscription";
import { ClarificationOptions } from "@/components/chat/ClarificationOptions";
import { isVaguePrompt, getCodingOptions } from "@/lib/promptClarifier";
import { DeepResearchPanel } from "@/components/chat/DeepResearchPanel";
import { MarkdownMessage } from "@/components/chat/MarkdownMessage";
import { CodeGenerationPanel } from "@/components/chat/CodeGenerationPanel";
import { LoadingAnimation, getLoadingType } from "@/components/chat/LoadingAnimation";

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
  const { sessionId: urlSessionId } = useParams();

  const seed = location.state || null;

  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("new");
  const [activeDialog, setActiveDialog] = useState(null);
  const [credits, setCredits] = useState(null);
  const [model, setModel] = useState(() =>
    getModelById(seed?.modelId || DEFAULT_MODEL_ID),
  );
  const [autoMode, setAutoMode] = useState(seed?.autoMode || false);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [activeChip, setActiveChip] = useState(seed?.chipId || null);
  const [room, setRoom] = useState(
    QUICK_CHIPS.find((c) => c.id === seed?.chipId)?.room || DEFAULT_ROOM,
  );
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // File objects pending send
  const [sessionFiles, setSessionFiles] = useState([]); // { name, url, type, size } uploaded to storage
  const [isDragging, setIsDragging] = useState(false);
  const [showRagPanel, setShowRagPanel] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(true);
  const [comparisonEnabled, setComparisonEnabled] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const deepResearchAbortRef = useRef(null);

  const seededRef = useRef(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  // Supabase session
  const { user, session, incrementGuestCount, checkGuestAllowed, isGuestLimitReached, guestRemaining, GUEST_LIMIT } = useAuth();

  const { plan, isPro, isUltra, features, subscription, decrementCredits } = useSubscription();
  const [sessionId, setSessionId] = useState(urlSessionId || null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const effectiveTokenBalance = user ? tokenBalance : guestRemaining;
  const [loadingSession, setLoadingSession] = useState(false);
  const savedMsgCountRef = useRef(0);

  // Load existing session from URL param or history navigation
  useEffect(() => {
    const sid = urlSessionId || seed?.sessionId;
    if (!sid || !user || !isSupabaseEnabled) return;
    // Don't reload if already loaded this session
    if (sid === sessionId && messages.length > 0) return;
    setSessionId(sid);
    setMessages([]);
    setLoadingSession(true);
    savedMsgCountRef.current = 0;
    import("@/lib/supabase").then(({ fetchMessages }) => {
      fetchMessages(sid).then((msgs) => {
        if (!msgs.length) { setLoadingSession(false); return; }
        const restored = msgs.map((m) => ({
          id: m.id || nextId(),
          role: m.role,
          text: m.text || "",
          model: m.model_id
            ? { id: m.model_id, name: m.model_id, credits: 1 }
            : { id: "deepseek-v4-flash", name: "DeepSeek v4 Flash", credits: 1 },
          state: "completed",
          status: "history",
          searchMode: m.search_mode || "off",
          skillSlug: m.skill_slug || null,
          imageUrl: m.image_url || null,
          uploadedFiles: m.metadata?.uploadedFiles || [],
        }));
        setMessages(restored);
        savedMsgCountRef.current = restored.length;
        setLoadingSession(false);
      }).catch(() => setLoadingSession(false));
    });
  }, [urlSessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync credits from subscription
  useEffect(() => {
    if (subscription?.credits != null) {
      setCredits(subscription.credits);
    }
  }, [subscription?.credits]);

  // Fetch token balance from backend
  const fetchTokenBalance = useCallback(async () => {
    if (!user) { setTokenBalance(null); return; }
    try {
      const token = session?.access_token;
      const res = await fetch(`${API_BASE_URL}/api/credits/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setTokenBalance(data.balance ?? 0);
    } catch {
      setTokenBalance(null);
    }
  }, [user, session]);

  useEffect(() => {
    fetchTokenBalance();
  }, [fetchTokenBalance]);

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
    messages.find((m) => m.role === "user")?.text,
  );

  // Override title (set after AI generate or manual rename)
  const [chatTitle, setChatTitle] = useState(null);
  const [titleDropdownOpen, setTitleDropdownOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const displayTitle = chatTitle || title || "New chat";

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
        comparisonAtSend = false,
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

      console.log('[Memory Debug] user:', user, 'user.id:', user?.id);
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
        comparison: comparisonAtSend,
        userId: user?.id || null,
        authToken: session?.access_token || null,
        signal: controller.signal,
        onMeta: (meta) => {
          updateMessage(assistantId, {
            providerModel: meta.model,
            status: "connected",
          });
          // Sync actual balance from server
          if (meta.tokens_left != null) {
            setTokenBalance(meta.tokens_left);
          }
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
          if (status.phase === "web_search" && status.status === "skipped") {
            updateMessage(assistantId, {
              status: "no web search needed",
              webPhase: "skipped",
              webResults: [],
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
            updateMessage(assistantId, { state: "streaming", status: "streaming", webPhase: null });
          }
        },
        onComparisonData: (comparisonData) => {
          setMessages((prev) => prev.map((m) => m.id === assistantId ? {
            ...m,
            comparisonData,
          } : m));
        },
        onDone: () => {
          // Check if completed text contains a QNA block or COMPARISON_DATA block (fallback)
          setMessages((prev) => {
            const msg = prev.find((m) => m.id === assistantId);
            if (!msg) return prev;
            const fullText = msg._rawText || msg.text || "";
            
            // Check for COMPARISON_DATA block (only if not already set from SSE event)
            const compMatch = msg.comparisonData ? null : fullText.match(/<COMPARISON_DATA>([\s\S]*?)<\/COMPARISON_DATA>/);
            if (compMatch) {
              try {
                const compData = JSON.parse(compMatch[1].trim());
                const preText = fullText.slice(0, compMatch.index).trim();
                return prev.map((m) => m.id === assistantId ? {
                  ...m,
                  state: "completed",
                  status: "just now",
                  text: preText,
                  comparisonData: compData,
                } : m);
              } catch (e) { 
                console.error("Failed to parse COMPARISON_DATA:", e);
                /* malformed JSON — fall through to normal */ 
              }
            }
            
            // Check for QNA block
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
          setCredits((c) => c !== null ? Math.max(0, c - cost) : null);
          // Token balance already deducted optimistically in sendMessage; sync from meta if available
          setIsGenerating(false);
          abortRef.current = null;
        },
        onError: (err) => {
          updateMessage(assistantId, {
            state: "error",
            status: "failed",
            error: err.message || "Streaming failed",
          });
          // Resync balance on error (backend may have refunded)
          if (err.message?.includes("insufficient_tokens") || err.message?.includes("Token tidak cukup")) {
            setTokenBalance(0);
            fetchTokenBalance();
          }
          setIsGenerating(false);
          abortRef.current = null;
          toast("Generation failed", {
            description: err.message || "Provider stream failed",
          });
        },
      });
    },
    [autoMode, updateMessage], // eslint-disable-line react-hooks/exhaustive-deps
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
    const fileMeta = files.map(f => ({ name: f.name, type: f.type, size: f.size }));
    // Build user-facing prompt (strip auto-generated prefix, keep user text)
    const userText = text.replace(/^Tolong analisis file:[^\n]*/i, "").trim()
      || `Analisis ${fileMeta.map(f => f.name).join(", ")}`;
    const userMsg = { id: nextId(), role: "user", text: userText, uploadedFiles: fileMeta };
    const assistantMsgId = nextId();
    const assistantMsg = {
      id: assistantMsgId, role: "assistant", state: "pending",
      model: usedModel, text: "", prompt: text, thinkingSteps: [], reasoningText: "",
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsGenerating(true);

    // Upload files to Supabase Storage in background
    if (user && isSupabaseEnabled) {
      Promise.all(files.map(f => uploadFileToStorage(f, user.id).catch(() => null)))
        .then((results) => {
          const uploaded = results.filter(Boolean);
          if (uploaded.length) {
            setSessionFiles((prev) => [...prev, ...uploaded]);
          }
        });
    }

    try {
      const data = await uploadAndAnalyze({ files, prompt: text, chatHistory: messages, modelId: model?.id || "" });
      updateMessage(assistantMsgId, { state: "completed", status: "just now", text: data.response || "", uploadedFiles: fileMeta });
    } catch (err) {
      updateMessage(assistantMsgId, { state: "error", status: "failed", error: err.message });
      toast("Analisis gagal", { description: err.message });
    } finally {
      setIsGenerating(false);
      setUploadedFiles([]);
    }
  }, [autoMode, model, messages, updateMessage, isPro, navigate, user]);

  const sendMessage = useCallback(
    (text, attachments = [], searchModePrompt = "", searchModeId = "", modeWebSearch = false, skillSlug = null, effortLevel = "low", _isSeed = false, _comparison = false) => {
      // Guest limit gate — seed prompts already counted in HomeWorkspace
      const allowed = _isSeed ? checkGuestAllowed() : incrementGuestCount();
      if (!allowed) {
        navigate("/auth", { state: { from: "/chat", tab: "login" } });
        toast("Prompt limit reached", { description: `Sign in to continue. Guest limit: ${GUEST_LIMIT} prompts.` });
        return;
      }
      // Token balance check (skip for guest — guest uses prompt count, not tokens)
      const usedModel = autoMode ? getModelById(AUTO_PICKED_MODEL_ID) : model;
      const isImgReq = isImageRequest(text);
      const effectiveModel = isImgReq ? IMAGE_MODEL : usedModel;
      const tokenCost = MODEL_TOKEN_COST[effectiveModel.id] || effectiveModel.credits || 1;
      if (user && tokenBalance !== null && tokenBalance < tokenCost) {
        toast("Token tidak cukup", {
          description: `Model ini butuh ${tokenCost} token, kamu punya ${tokenBalance}.`,
        });
        return;
      }
      // If files are attached, route to file analysis
      if (uploadedFiles.length > 0) {
        handleFileUploadAnalysis(text, uploadedFiles);
        return;
      }
      // Optimistic token deduction
      if (tokenBalance !== null) {
        setTokenBalance((prev) => prev !== null ? Math.max(0, prev - tokenCost) : prev);
      }
      const userMsg = { id: nextId(), role: "user", text, webSearch: true };
      // Use explicit searchModeId from composer, fallback to web
      const activeModeId = searchModeId && searchModeId !== "off"
        ? searchModeId
        : "web";
      
      // Detect comparison requests (toggle OR text keywords)
      const isCompReq = _comparison || comparisonEnabled || isComparisonRequest(text);
      
      const assistantMsg = {
        id: nextId(),
        role: "assistant",
        state: "pending",
        model: isImgReq ? IMAGE_MODEL : usedModel,
        autoMode: isImgReq ? false : autoMode,
        webSearch: true,
        searchMode: isImgReq ? "off" : activeModeId,
        skillSlug: skillSlug || null,
        skillPhase: skillSlug ? "loading" : null,
        text: "",
        code: null,
        prompt: text,
        thinkingSteps: [],
        reasoningText: "",
        isComparison: isCompReq,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Route image requests to image generation
      if (isImgReq) {
        updateMessage(assistantMsg.id, { state: "streaming", status: "generating image..." });
        setIsGenerating(true);
        generateImage(text, user?.id || null, session?.access_token || null)
          .then((data) => {
            updateMessage(assistantMsg.id, {
              state: "completed",
              status: "just now",
              imageUrl: data.image_url,
              text: `Gambar berhasil digenerate untuk prompt: "${text}"`,
            });
            if (data.saved_image) {
              toast("Gambar tersimpan", { description: "Tersimpan ke gallery" });
            } else if (user) {
              toast("Gambar belum tersimpan", { description: "Run SQL migration & coba lagi" });
            }
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

      // Route document generation requests
      const DOC_KEYWORDS = [
        "buat pdf", "buatkan pdf", "generate pdf", "create pdf",
        "buat excel", "buatkan excel", "generate excel",
        "buat word", "buatkan word", "generate word",
        "buat dokumen", "buatkan dokumen", "buat file", "buatkan file",
        "buat laporan", "buatkan laporan", "buat absensi", "buat tabel",
        "download pdf", "download excel", "generate document", "create file",
      ];
      const isDocReq = DOC_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));

      if (isDocReq) {
        // Use streaming code generation panel
        updateMessage(assistantMsg.id, {
          state: "streaming",
          isCodeGeneration: true,
          codeGenPrompt: text,
        });
        setIsGenerating(true);
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

      // Web search only when needed
      runGeneration(assistantMsg.id, text, {
        roomAtSend: room,
        cost: usedModel.credits || 0,
        usedModel,
        attachments,
        contextMessages,
        webSearchAtSend: needsWebSearch(text),
        reasoningAtSend: reasoningEnabled,
        searchModePrompt,
        skillSlug,
        effortLevel,
        comparisonAtSend: isCompReq,
      });
    },
    [autoMode, model, messages, room, runGeneration, reasoningEnabled, updateMessage, uploadedFiles, handleFileUploadAnalysis, incrementGuestCount, checkGuestAllowed, navigate, GUEST_LIMIT, decrementCredits, user], // eslint-disable-line react-hooks/exhaustive-deps
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
      webSearch: true,
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
      webSearchAtSend: true,
      reasoningAtSend: reasoningEnabled,
    });
  }, [autoMode, model, messages, room, runGeneration, reasoningEnabled, setMessages]);

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
            seed.searchModeId || "web",
            true,
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
    createSession({ title: makeTitleTopic(firstUser.text), model_id: model.id, room, user_id: user.id })
      .then((sess) => {
        if (sess) {
          setSessionId(sess.id);
          window.history.replaceState({}, "", `/chat/${sess.id}`);
          // Auto-generate better title via AI (non-blocking)
          if (session?.access_token) {
            fetch(`${API_BASE_URL}/api/sessions/${sess.id}/improve-title`, {
              method: "POST",
              headers: { Authorization: `Bearer ${session.access_token}` },
            })
              .then((r) => r.json())
              .then((d) => { if (d.title) setChatTitle(d.title); })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, [messages, user, sessionId, model, room]); // eslint-disable-line react-hooks/exhaustive-deps

  // Survey trigger — show after 5th session
  useEffect(() => {
    if (!user || !session?.access_token || showSurvey) return;
    fetch(`${API_BASE_URL}/api/survey/status`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (!d.dismissed && !d.completed && d.session_count >= 5) setShowSurvey(true);
      })
      .catch(() => {});
  }, [user, session]); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Resync token balance from server (backend may refund on abort)
    if (generatingMsg) {
      fetchTokenBalance();
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
      // Block Pro-only models for free users
      if (!isPro && (m.isExpensive || m.requiresPro)) {
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
    if (id === "images") {
      navigate("/gallery");
      return;
    }
    setActiveNav(id);
    setActiveDialog(id);
  };

  const getFileIcon = (name) => {
    const ext = (name || "").split(".").pop().toLowerCase();
    const icons = { pdf: "📄", jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️", docx: "📝", xlsx: "📊", xls: "📊", txt: "📃", csv: "📃", md: "📃" };
    return icons[ext] || "📎";
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

      {/* Files panel — left sidebar, shown when sessionFiles exist */}
      {sessionFiles.length > 0 && (
        <div className={`fixed bottom-0 top-0 z-20 hidden w-[220px] flex-col border-r border-[#E5E7EB] bg-white shadow-[1px_0_0_rgba(17,24,39,0.04)] transition-all duration-300 lg:flex ${
          collapsed ? "left-[68px]" : "left-[86px]"
        }`}>
          <div className="flex items-center justify-between border-b border-[#F0F1F3] px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">Files ({sessionFiles.length})</p>
            <button onClick={() => setSessionFiles([])} className="grid h-5 w-5 place-items-center rounded text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#374151]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {sessionFiles.map((f, i) => (
              <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-[#F7F7F8] transition-colors group">
                <span className="text-base shrink-0">{getFileIcon(f.name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[#111111]">{f.name}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{f.type?.split("/")[1]?.toUpperCase() || "FILE"}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div
        className={`flex h-full min-h-0 flex-col transition-[margin] duration-300 ease-out ${
          collapsed ? "md:ml-[56px]" : "md:ml-[86px]"
        } ${
          sessionFiles.length > 0 ? "lg:ml-[calc(86px+220px)]" : ""
        }`}
      >
        {/* Chat title header */}
        {messages.length > 0 && (
          <div className="relative flex items-center gap-1.5 pl-12 md:pl-4 pr-4 py-2.5 border-b border-[#F0F1F3]">
            {renaming ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                const v = renameValue.trim();
                if (v) {
                  setChatTitle(v);
                  if (sessionId) updateSession(sessionId, { title: v });
                }
                setRenaming(false);
              }} className="flex items-center gap-2 flex-1 max-w-[400px]">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Escape") setRenaming(false); }}
                  className="flex-1 text-sm font-medium text-[#111111] border-b border-[#6366F1] outline-none bg-transparent px-0.5"
                />
                <button type="submit" className="text-xs text-[#6366F1] font-medium">Save</button>
                <button type="button" onClick={() => setRenaming(false)} className="text-xs text-[#9CA3AF]">Cancel</button>
              </form>
            ) : (
              <button
                onClick={() => setTitleDropdownOpen((v) => !v)}
                className="flex items-center gap-1 text-sm font-medium text-[#374151] hover:text-[#111111] transition-colors max-w-[320px] truncate"
              >
                <span className="truncate">{displayTitle}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[#9CA3AF]"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            )}

            {/* Dropdown menu */}
            {titleDropdownOpen && !renaming && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setTitleDropdownOpen(false)} />
                <div className="absolute left-4 top-full mt-1 z-50 min-w-[200px] rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  <button
                    onClick={() => {
                      setTitleDropdownOpen(false);
                      setRenameValue(displayTitle);
                      setRenaming(true);
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-[13px] text-[#111111] hover:bg-[#F7F7F8]"
                  >
                    <span className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Rename
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">R</span>
                  </button>
                  <div className="my-1 border-t border-[#F0F1F3]" />
                  <button
                    onClick={async () => {
                      setTitleDropdownOpen(false);
                      if (sessionId && window.confirm("Hapus chat ini?")) {
                        await deleteSession(sessionId);
                        navigate("/home");
                      }
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-[13px] text-red-600 hover:bg-[#FEF2F2]"
                  >
                    <span className="flex items-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Delete
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">D</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
            {/* Loading session skeleton */}
            {loadingSession && (
              <div className="space-y-4 pt-4" data-testid="chat-skeleton">
                {[0.85, 0.6, 0.75, 0.5, 0.9, 0.4].map((w, i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] space-y-2.5 ${i % 2 === 0 ? "items-end" : "items-start"}`}>
                      {i % 2 !== 0 && (
                        <div className="flex items-center gap-2">
                          <div className="h-5 w-5 rounded-lg bg-[#F3F4F6] animate-pulse" />
                          <div className="h-3 w-16 rounded bg-[#F3F4F6] animate-pulse" />
                        </div>
                      )}
                      <div className={`rounded-2xl ${i % 2 === 0
                        ? "rounded-br-md bg-[#F0F0F0] px-5 py-3.5"
                        : "rounded-bl-md border border-[#E5E7EB] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(17,24,39,0.03)]"
                      }`}>
                        <div className="space-y-2">
                          <div className="h-3 rounded bg-[#E5E7EB] animate-pulse" style={{ width: `${w * 100}%` }} />
                          <div className="h-3 rounded bg-[#E5E7EB] animate-pulse" style={{ width: `${w * 65}%` }} />
                          {i % 2 !== 0 && i < 4 && (
                            <div className="h-3 rounded bg-[#E5E7EB] animate-pulse" style={{ width: `${w * 40}%` }} />
                          )}
                        </div>
                      </div>
                      {i % 2 === 0 && (
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="h-2.5 w-10 rounded bg-[#F3F4F6] animate-pulse" />
                          <div className="h-2.5 w-3 rounded bg-[#F3F4F6] animate-pulse" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex justify-start pl-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                    <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Loading conversation...
                  </div>
                </div>
              </div>
            )}

            {messages.length === 0 && !loadingSession && (
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
              ) : m.isCodeGeneration ? (
                <div key={m.id} className="ma-msg-in flex justify-start">
                  <div className="w-full max-w-full">
                    <CodeGenerationPanel
                      prompt={m.codeGenPrompt}
                      userId={user?.id || "anonymous"}
                      modelId={model?.id || "deepseek-v4-flash"}
                      onComplete={({ filename, downloadUrl }) => {
                        updateMessage(m.id, {
                          state: "completed",
                          status: "just now",
                          text: `Dokumen ${filename} berhasil dibuat!`,
                          downloadUrl,
                          downloadFilename: filename,
                        });
                        setIsGenerating(false);
                        decrementCredits(model?.credits || 1);
                      }}
                      onError={(err) => {
                        updateMessage(m.id, {
                          state: "error",
                          error: err || "Gagal generate dokumen",
                        });
                        setIsGenerating(false);
                        toast("Gagal generate dokumen", { description: err });
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div key={m.id}>
                  <AssistantMessage message={m} onRetry={handleRetry} onRefine={handleRefine} onAbort={handleStop} />
                  {/* Document download button */}
                  {m.downloadUrl && m.state === "completed" && (
                    <div className="mt-2 ml-10">
                      <a
                        href={`${API_BASE_URL}${m.downloadUrl}`}
                        download={m.downloadFilename}
                        className="ma-focus inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F7F7F8] px-4 py-2.5 text-[13px] font-medium text-[#111111] shadow-[0_1px_3px_rgba(17,24,39,0.04)] transition-all hover:bg-[#EEF2FF] hover:border-[#C7D2FE] hover:text-[#6366F1]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Download {m.downloadFilename}
                      </a>
                    </div>
                  )}
                  {/* RAG indicator badge */}
                  {m.ragUsed && m.state === "completed" && (
                    <div className="mt-1.5 ml-10 flex items-center gap-1.5 text-[11px] text-[#6366F1]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                      </svg>
                      {m.ragChunks || 0} bagian dari dokumen digunakan
                    </div>
                  )}
                </div>
              ),
            )}
            {/* Bottom padding so last message isn't hidden behind composer */}
            <div className="h-4" aria-hidden="true" />
          </div>
        </main>

        <footer className="shrink-0 pt-3 sm:pb-4 md:pb-4" style={{paddingBottom: 'max(32px, env(safe-area-inset-bottom))'}}>        
          <div className="mx-auto w-full max-w-[720px] px-4 sm:px-6" data-testid="chat-composer">
            <PromptComposer
              compact
              placeholder="Ask anything"
              initialValue={seed?.prompt || ""}
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
              onFileRemove={(idx) => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
              uploadedFilesCount={uploadedFiles.length}
              isGenerating={isGenerating}
              onStop={handleStop}
              model={model}
              autoMode={autoMode}
              onModelSelect={handleModelSelect}
              onAutoModeToggle={handleAutoModeToggle}
              reasoningEnabled={reasoningEnabled}
              onReasoningToggle={handleReasoningToggle}
              initialSearchMode={seed?.searchModeId || "web"}
              initialSkill={seed?.skillSlug ? { slug: seed.skillSlug, name: seed.skillSlug, icon: "🧠" } : null}
              initialEffortLevel={seed?.effortLevel || "low"}
              tokenBalance={tokenBalance}
              onRagToggle={() => setShowRagPanel((v) => !v)}
              ragEnabled={ragEnabled}
              comparisonEnabled={comparisonEnabled}
              onComparisonToggle={() => setComparisonEnabled((v) => !v)}
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
      <LowTokenPopup tokenBalance={effectiveTokenBalance} isGuest={!user} />
      <RagPanel open={showRagPanel} onClose={() => setShowRagPanel(false)} />
      {showSurvey && <SurveyModal session={session} onClose={() => setShowSurvey(false)} />}
    </div>
  );
}
