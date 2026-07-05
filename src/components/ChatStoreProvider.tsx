"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import { UIMessage } from "ai";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChatStore = Record<string, UIMessage[]>;

interface ChatStoreContextValue {
    getMessages: (personaId: string) => UIMessage[];
    setMessages: (personaId: string, messages: UIMessage[]) => void;
    clearMessages: (personaId: string) => void;
    /** Returns a map of personaId → last message text (80 chars) for all stored personas */
    getAllLastMessages: () => Record<string, string>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ChatStoreContext = createContext<ChatStoreContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Wraps the /chat layout. Holds a mutable ref map of personaId → UIMessage[].
 * Using a ref (not state) so that updating the store does NOT trigger a full
 * re-render of the provider tree — only the consuming chat page re-renders
 * via its own local state.
 */
export function ChatStoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<ChatStore>({});

    const getMessages = useCallback((personaId: string): UIMessage[] => {
        return storeRef.current[personaId] ?? [];
    }, []);

    const setMessages = useCallback((personaId: string, messages: UIMessage[]) => {
        storeRef.current[personaId] = messages;
    }, []);

    const clearMessages = useCallback((personaId: string) => {
        delete storeRef.current[personaId];
    }, []);

    const getAllLastMessages = useCallback((): Record<string, string> => {
        const result: Record<string, string> = {};
        for (const [id, msgs] of Object.entries(storeRef.current)) {
            // Find the last message that has text content
            for (let i = msgs.length - 1; i >= 0; i--) {
                const msg = msgs[i];
                const text = Array.isArray(msg.parts)
                    ? msg.parts
                        .filter((p: any) => p.type === "text")
                        .map((p: any) => p.text || "")
                        .join("")
                    : "";
                if (text.trim().length > 0) {
                    result[id] = text.slice(0, 80);
                    break;
                }
            }
        }
        return result;
    }, []);

    return (
        <ChatStoreContext.Provider value={{ getMessages, setMessages, clearMessages, getAllLastMessages }}>
            {children}
        </ChatStoreContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatStore(): ChatStoreContextValue {
    const ctx = useContext(ChatStoreContext);
    if (!ctx) {
        throw new Error("useChatStore must be used within <ChatStoreProvider>");
    }
    return ctx;
}
