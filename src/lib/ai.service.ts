import type { AIProvider } from '../store/ai.store'
import { getKeyForProvider } from '../store/ai.store'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIResponse {
  content: string
  error?: string
}

// ── Call OpenAI (gpt-4o-mini for cost, gpt-4o for quality) ──────────

async function callOpenAI(key: string, messages: AIMessage[]): Promise<AIResponse> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `OpenAI error ${res.status}`)
  }
  const data = await res.json()
  return { content: data.choices[0].message.content }
}

// ── Call Anthropic Claude ────────────────────────────────────────────

async function callAnthropic(key: string, messages: AIMessage[]): Promise<AIResponse> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? ''
  const userMsgs = messages.filter((m) => m.role !== 'system')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      system: systemMsg,
      messages: userMsgs,
      max_tokens: 4096,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Anthropic error ${res.status}`)
  }
  const data = await res.json()
  return { content: data.content[0].text }
}

// ── Call Google Gemini ───────────────────────────────────────────────

async function callGemini(key: string, messages: AIMessage[]): Promise<AIResponse> {
  const systemMsg = messages.find((m) => m.role === 'system')?.content ?? ''
  const userMsgs = messages.filter((m) => m.role !== 'system')

  const parts = userMsgs.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemMsg }] },
        contents: parts,
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `Gemini error ${res.status}`)
  }
  const data = await res.json()
  return { content: data.candidates[0].content.parts[0].text }
}

// ── Main dispatcher ───────────────────────────────────────────────────

export async function callAI(
  provider: AIProvider,
  messages: AIMessage[]
): Promise<AIResponse> {
  const keyRecord = getKeyForProvider(provider)
  if (!keyRecord) throw new Error(`No API key configured for ${provider}`)

  switch (provider) {
    case 'openai':
      return callOpenAI(keyRecord.key, messages)
    case 'anthropic':
      return callAnthropic(keyRecord.key, messages)
    case 'google':
      return callGemini(keyRecord.key, messages)
  }
}
