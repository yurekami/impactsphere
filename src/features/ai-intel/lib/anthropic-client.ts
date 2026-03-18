import Anthropic from '@anthropic-ai/sdk'

export async function* streamAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string> {
  const client = new Anthropic({
    apiKey,
  })

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      yield event.delta.text
    }
  }
}
