import { useState, useEffect } from 'react'

export type AIProvider = 'openai' | 'anthropic' | 'google'

export interface AIKey {
  provider: AIProvider
  key: string
  addedAt: string
}

const STORAGE_KEY = 'sysdesign-ai-keys'

function loadKeys(): AIKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveKeys(keys: AIKey[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
  } catch {}
}

/** Mask an API key like a credit card: first 6 chars + … + last 4 chars */
export function maskKey(key: string): string {
  if (key.length <= 10) return '••••••••••'
  return `${key.slice(0, 6)}••••••••••${key.slice(-4)}`
}

export const PROVIDER_META: Record<AIProvider, { label: string; placeholder: string; prefix: string; color: string }> = {
  openai: {
    label: 'OpenAI',
    placeholder: 'sk-proj-...',
    prefix: 'sk-',
    color: '#10a37f',
  },
  anthropic: {
    label: 'Claude (Anthropic)',
    placeholder: 'sk-ant-...',
    prefix: 'sk-ant-',
    color: '#c96b3f',
  },
  google: {
    label: 'Gemini (Google)',
    placeholder: 'AIza...',
    prefix: 'AIza',
    color: '#4285F4',
  },
}

// ── Exported CRUD helpers ──────────────────────────────────────────

export function getKeys(): AIKey[] {
  return loadKeys()
}

export function addKey(provider: AIProvider, key: string): void {
  const keys = loadKeys().filter((k) => k.provider !== provider)
  keys.push({ provider, key, addedAt: new Date().toISOString() })
  saveKeys(keys)
}

export function removeKey(provider: AIProvider): void {
  saveKeys(loadKeys().filter((k) => k.provider !== provider))
}

export function hasAnyKey(): boolean {
  return loadKeys().length > 0
}

export function getKeyForProvider(provider: AIProvider): AIKey | undefined {
  return loadKeys().find((k) => k.provider === provider)
}

// ── React hook ───────────────────────────────────────────────────

export function useAIKeys() {
  const [keys, setKeys] = useState<AIKey[]>([])

  useEffect(() => {
    setKeys(loadKeys())
  }, [])

  const refresh = () => setKeys(loadKeys())

  const add = (provider: AIProvider, key: string) => {
    addKey(provider, key)
    refresh()
  }

  const remove = (provider: AIProvider) => {
    removeKey(provider)
    refresh()
  }

  return { keys, add, remove, hasAny: keys.length > 0 }
}
