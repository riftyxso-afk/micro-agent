import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchBuilderProject,
  fetchProjectMessages,
  saveProjectMessage,
  updateBuilderProject,
} from "@/lib/supabase";

/**
 * useProjectWorkspace(projectId)
 *
 * Handles:
 * 1. Project metadata fetch from Supabase by id
 * 2. Message history fetch from Supabase
 * 3. WebContainers rehydration state machine
 * 4. Write-through on file_complete events
 */
export function useProjectWorkspace(projectId) {
  const [projectMeta, setProjectMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  // Independent loading states per step
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [previewState, setPreviewState] = useState("booting"); // "booting" | "mounting" | "ready" | "error"

  // Keep a ref to the latest fileTree for write-through without stale closure
  const fileTreeRef = useRef({});

  // ── 1. Fetch project metadata + file tree ──────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const fetchMeta = async () => {
      setLoadingMeta(true);
      try {
        const data = await fetchBuilderProject(projectId);
        if (!cancelled) {
          setProjectMeta(data);
          const tree = data?.file_tree ?? {};
          setFileTree(tree);
          fileTreeRef.current = tree;
        }
      } catch (err) {
        console.error("[useProjectWorkspace] fetchMeta error:", err);
        if (!cancelled) {
          setProjectMeta(null);
          setFileTree({});
          fileTreeRef.current = {};
        }
      } finally {
        if (!cancelled) setLoadingMeta(false);
      }
    };

    fetchMeta();
    return () => { cancelled = true; };
  }, [projectId]);

  // ── 2. Fetch message history ────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const data = await fetchProjectMessages(projectId);
        if (!cancelled) setMessages(data);
      } catch (err) {
        console.error("[useProjectWorkspace] fetchMessages error:", err);
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    };

    loadMessages();
    return () => { cancelled = true; };
  }, [projectId]);

  // ── 3. WebContainers rehydration state machine ─────────────────────────────
  useEffect(() => {
    if (loadingMeta) return;
    let cancelled = false;

    const rehydrate = async () => {
      setPreviewState("booting");
      try {
        // TODO: Replace with actual WebContainers logic:
        // const wc = await WebContainer.boot();
        // setPreviewState("mounting");
        // await wc.mount(fileTree);
        // const install = await wc.spawn("npm", ["install"]);
        // await install.exit;
        // const devServer = await wc.spawn("npm", ["run", "dev"]);
        // wc.on("server-ready", (port, url) => {
        //   setPreviewUrl(url);
        //   setPreviewState("ready");
        // });

        // Simulate boot sequence for UI until WebContainers is wired
        await new Promise((r) => setTimeout(r, 600));
        if (cancelled) return;
        setPreviewState("mounting");
        await new Promise((r) => setTimeout(r, 1200));
        if (cancelled) return;
        setPreviewState("ready");
      } catch (err) {
        console.error("[useProjectWorkspace] rehydrate error:", err);
        if (!cancelled) setPreviewState("error");
      }
    };

    rehydrate();
    return () => { cancelled = true; };
  }, [loadingMeta]);

  // ── 4. Write-through on file_complete ──────────────────────────────────────
  const onFileComplete = useCallback(async (filePath, content) => {
    setFileTree((prev) => {
      const updated = { ...prev, [filePath]: content };
      fileTreeRef.current = updated;
      // Fire-and-forget persist — non-blocking
      updateBuilderProject(projectId, { file_tree: updated }).catch((err) =>
        console.error("[useProjectWorkspace] file_tree persist error:", err)
      );
      return updated;
    });
  }, [projectId]);

  // ── Append a new message (optimistic + persist) ───────────────────────────
  const appendMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
    // Persist to Supabase if it's a real message (has role + text)
    if (message.role && message.text && projectId) {
      saveProjectMessage(projectId, {
        role: message.role,
        text: message.text,
        metadata: message.metadata ?? {},
      }).catch((err) =>
        console.error("[useProjectWorkspace] saveProjectMessage error:", err)
      );
    }
  }, [projectId]);

  return {
    projectMeta,
    messages,
    fileTree,
    loadingMeta,
    loadingMessages,
    previewState,
    onFileComplete,
    appendMessage,
  };
}
