import { Store } from "@tanstack/store";
import { useState, useEffect } from "react";

export type AIProvider = "openai" | "anthropic" | "google";

export interface AIKey {
  provider: AIProvider;
  key: string;
  addedAt: string;
}

interface AIState {
  keys: AIKey[];
  pendingPrompt: string;
}

const STORAGE_KEY = "sysdesign-ai-keys";

function loadKeys(): AIKey[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveKeys(keys: AIKey[]) {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  } catch {}
}

export const PROVIDER_META: Record<
  AIProvider,
  { label: string; placeholder: string; prefix: string; color: string }
> = {
  openai: {
    label: "OpenAI",
    placeholder: "sk-proj-...",
    prefix: "sk-",
    color: "#10a37f",
  },
  anthropic: {
    label: "Claude (Anthropic)",
    placeholder: "sk-ant-...",
    prefix: "sk-ant-",
    color: "#c96b3f",
  },
  google: {
    label: "Gemini (Google)",
    placeholder: "AIza...",
    prefix: "AIza",
    color: "#4285F4",
  },
};

/** Mask an API key like a credit card: first 6 chars + … + last 4 chars */
export function maskKey(key: string): string {
  if (key.length <= 10) return "••••••••••";
  return `${key.slice(0, 6)}••••••••••${key.slice(-4)}`;
}

export const aiStore = new Store<AIState>({
  keys: loadKeys(),
  pendingPrompt: "",
});

// ── CRUD helpers ────────────────────────────────────────────────────

export function setPrompt(prompt: string) {
  aiStore.setState((s) => ({ ...s, pendingPrompt: prompt }));
}

export function addKey(provider: AIProvider, key: string): void {
  const keys = aiStore.state.keys.filter((k) => k.provider !== provider);
  const nextKeys = [...keys, { provider, key, addedAt: new Date().toISOString() }];
  saveKeys(nextKeys);
  aiStore.setState((s) => ({ ...s, keys: nextKeys }));
}

export function removeKey(provider: AIProvider): void {
  const nextKeys = aiStore.state.keys.filter((k) => k.provider !== provider);
  saveKeys(nextKeys);
  aiStore.setState((s) => ({ ...s, keys: nextKeys }));
}

export function getKeyForProvider(provider: AIProvider): AIKey | undefined {
  return aiStore.state.keys.find((k) => k.provider === provider);
}

// ── Hook ─────────────────────────────────────────────────────────────

export function useAIKeys() {
  const [keys, setKeys] = useState<AIKey[]>(aiStore.state.keys);

  useEffect(() => {
    const sub = aiStore.subscribe(() => {
      setKeys(aiStore.state.keys);
    });
    return () => sub.unsubscribe();
  }, []);

  return { 
    keys, 
    add: addKey, 
    remove: removeKey, 
    hasAny: keys.length > 0 
  };
}

export function useAIPrompt() {
  const [prompt, setPromptState] = useState(aiStore.state.pendingPrompt);

  useEffect(() => {
    const sub = aiStore.subscribe(() => {
      setPromptState(aiStore.state.pendingPrompt);
    });
    return () => sub.unsubscribe();
  }, []);

  return { prompt, setPrompt };
}
