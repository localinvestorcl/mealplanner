import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const SONNET = 'claude-sonnet-4-6'
export const HAIKU = 'claude-haiku-4-5-20251001'

export async function callClaudeJSON<T>(prompt: string, maxTokens = 4096, temperature = 1, model = SONNET): Promise<T> {
  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  // Strip markdown code fences if present
  const clean = text
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  try {
    return JSON.parse(clean) as T
  } catch {
    // Retry with stricter instructions on the same prompt
    const retry = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'user', content: prompt + '\n\nIMPORTANT: Respond with valid JSON only. No markdown fences, no explanation.' },
      ],
    })
    const retryText = retry.content[0].type === 'text' ? retry.content[0].text : ''
    const retryClean = retryText
      .replace(/^```(?:json)?\s*/m, '')
      .replace(/\s*```\s*$/m, '')
      .trim()
    return JSON.parse(retryClean) as T
  }
}
