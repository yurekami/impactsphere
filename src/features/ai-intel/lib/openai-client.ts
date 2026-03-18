import OpenAI from 'openai'

export async function* streamOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string> {
  const client = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  const stream = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content
    if (delta) {
      yield delta
    }
  }
}
