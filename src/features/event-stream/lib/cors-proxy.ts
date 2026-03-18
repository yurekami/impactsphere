const DEFAULT_PROXY_ROOT = 'https://api.allorigins.win/raw?url='

function buildCustomProxyUrl(customProxy: string, feedUrl: string): string {
  if (customProxy.includes('{url}')) {
    return customProxy.replace('{url}', encodeURIComponent(feedUrl))
  }

  const separator = customProxy.includes('?') ? '&' : '?'
  return `${customProxy}${separator}url=${encodeURIComponent(feedUrl)}`
}

export function proxyUrl(feedUrl: string, customProxy = ''): string {
  const cleanedProxy = customProxy.trim()

  if (cleanedProxy.length > 0) {
    return buildCustomProxyUrl(cleanedProxy, feedUrl)
  }

  return `${DEFAULT_PROXY_ROOT}${encodeURIComponent(feedUrl)}`
}
