import type { RawEvent } from '../types'

function textContentFromElement(parent: Element, selector: string): string {
  const element = parent.querySelector(selector)
  return element?.textContent?.trim() ?? ''
}

function normalizeDate(rawDate: string): string {
  if (!rawDate) {
    return new Date().toISOString()
  }

  const parsed = new Date(rawDate)
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString()
  }

  return parsed.toISOString()
}

function fallbackGuid(parts: Array<string | undefined>): string {
  const value = parts.filter(Boolean).join('|').trim()
  return value.length > 0 ? value : crypto.randomUUID()
}

function cleanDescription(value: string): string {
  return value
    .replace(/<!\[CDATA\[|\]\]>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRssItem(item: Element, feedId: string): RawEvent {
  const title = textContentFromElement(item, 'title')
  const link = textContentFromElement(item, 'link')
  const description =
    textContentFromElement(item, 'description') ||
    textContentFromElement(item, 'content\\:encoded')
  const pubDate = normalizeDate(textContentFromElement(item, 'pubDate'))
  const author =
    textContentFromElement(item, 'author') || textContentFromElement(item, 'dc\\:creator')
  const categories = Array.from(item.querySelectorAll('category'))
    .map((category) => category.textContent?.trim() ?? '')
    .filter(Boolean)
  const guid =
    textContentFromElement(item, 'guid') || fallbackGuid([title, link, pubDate, feedId])

  return {
    title,
    link,
    description: cleanDescription(description),
    pubDate,
    author,
    categories,
    guid,
    feedId,
  }
}

function atomLink(entry: Element): string {
  const linkNode =
    Array.from(entry.querySelectorAll('link')).find((node) => {
      const rel = node.getAttribute('rel')
      return !rel || rel === 'alternate'
    }) ?? entry.querySelector('link')

  const href = linkNode?.getAttribute('href')
  return href?.trim() ?? ''
}

function atomAuthor(entry: Element): string {
  const authorNode = entry.querySelector('author')

  if (!authorNode) {
    return ''
  }

  return (
    authorNode.querySelector('name')?.textContent?.trim() ??
    authorNode.textContent?.trim() ??
    ''
  )
}

function parseAtomEntry(entry: Element, feedId: string): RawEvent {
  const title = textContentFromElement(entry, 'title')
  const link = atomLink(entry)
  const description =
    textContentFromElement(entry, 'summary') ||
    textContentFromElement(entry, 'content') ||
    textContentFromElement(entry, 'subtitle')
  const dateValue =
    textContentFromElement(entry, 'updated') || textContentFromElement(entry, 'published')
  const pubDate = normalizeDate(dateValue)
  const author = atomAuthor(entry)
  const categories = Array.from(entry.querySelectorAll('category'))
    .map((category) => category.getAttribute('term') ?? category.textContent?.trim() ?? '')
    .filter(Boolean)
  const guid =
    textContentFromElement(entry, 'id') || fallbackGuid([title, link, pubDate, feedId])

  return {
    title,
    link,
    description: cleanDescription(description),
    pubDate,
    author,
    categories,
    guid,
    feedId,
  }
}

export function parseFeedXml(xml: string, feedId: string): RawEvent[] {
  const parser = new DOMParser()
  const documentNode = parser.parseFromString(xml, 'application/xml')
  const parserError = documentNode.querySelector('parsererror')

  if (parserError) {
    throw new Error(parserError.textContent?.trim() || 'Invalid feed XML')
  }

  const rssItems = Array.from(documentNode.querySelectorAll('rss > channel > item'))
  if (rssItems.length > 0) {
    return rssItems.map((item) => parseRssItem(item, feedId))
  }

  const atomEntries = Array.from(documentNode.querySelectorAll('feed > entry'))
  if (atomEntries.length > 0) {
    return atomEntries.map((entry) => parseAtomEntry(entry, feedId))
  }

  return []
}
