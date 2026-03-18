interface GitHubRepoRef {
  owner: string
  repo: string
}

export interface GitHubFetchOptions {
  token?: string
  signal?: AbortSignal
  corsProxy?: string
}

export interface GitHubFetchResult {
  repoName: string
  repoUrl: string
  defaultBranch: string
  zipUrl: string
  archive: ArrayBuffer
}

export class GitHubRateLimitError extends Error {
  readonly resetAt: Date

  constructor(resetUnixSeconds: number) {
    const resetAt = new Date(resetUnixSeconds * 1000)
    super(`GitHub API rate limit exceeded. Retry after ${resetAt.toISOString()}.`)
    this.name = 'GitHubRateLimitError'
    this.resetAt = resetAt
  }
}

const GITHUB_URL_REGEX = /^https?:\/\/github\.com\/([^/\s]+)\/([^/\s#?]+)(?:\/.*)?$/i
const GITHUB_SLUG_REGEX = /^([^/\s]+)\/([^/\s#?]+)$/

function sanitizeRepoName(repo: string): string {
  return repo.endsWith('.git') ? repo.slice(0, -4) : repo
}

export function parseGitHubRepository(input: string): GitHubRepoRef {
  const trimmed = input.trim()

  if (!trimmed) {
    throw new Error('Repository input is empty.')
  }

  const urlMatch = trimmed.match(GITHUB_URL_REGEX)

  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: sanitizeRepoName(urlMatch[2]),
    }
  }

  const slugMatch = trimmed.match(GITHUB_SLUG_REGEX)

  if (slugMatch) {
    return {
      owner: slugMatch[1],
      repo: sanitizeRepoName(slugMatch[2]),
    }
  }

  throw new Error(`Unsupported GitHub repository format: ${input}`)
}

function buildGitHubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

async function getDefaultBranch(
  repoRef: GitHubRepoRef,
  options: GitHubFetchOptions,
): Promise<string> {
  const repoApiUrl = `https://api.github.com/repos/${repoRef.owner}/${repoRef.repo}`
  const response = await fetch(repoApiUrl, {
    headers: buildGitHubHeaders(options.token),
    signal: options.signal,
  })

  const remaining = response.headers.get('x-ratelimit-remaining')
  const resetHeader = response.headers.get('x-ratelimit-reset')

  if (response.status === 403 && remaining === '0' && resetHeader) {
    throw new GitHubRateLimitError(Number(resetHeader))
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch repository metadata (${response.status}).`)
  }

  const payload = (await response.json()) as { default_branch?: string }

  if (!payload.default_branch) {
    throw new Error('Repository metadata did not include a default branch.')
  }

  return payload.default_branch
}

export async function fetchGitHubRepositoryArchive(
  input: string,
  options: GitHubFetchOptions = {},
): Promise<GitHubFetchResult> {
  const repoRef = parseGitHubRepository(input)
  const defaultBranch = await getDefaultBranch(repoRef, options)

  // GitHub's ZIP download redirects to codeload.github.com which blocks CORS.
  // In dev: use Vite's built-in proxy (/api/github-zip → github.com).
  // In prod: use a CORS proxy or user-provided proxy from settings.
  const archivePath = `/${repoRef.owner}/${repoRef.repo}/archive/refs/heads/${defaultBranch}.zip`
  const customProxy = options.corsProxy?.trim()

  let proxiedUrl: string
  if (customProxy) {
    proxiedUrl = `${customProxy}${encodeURIComponent(`https://github.com${archivePath}`)}`
  } else if (import.meta.env.DEV) {
    proxiedUrl = `/api/github-zip${archivePath}`
  } else {
    proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(`https://github.com${archivePath}`)}`
  }

  const response = await fetch(proxiedUrl, {
    signal: options.signal,
  })

  if (!response.ok) {
    throw new Error(`Failed to download repository archive (${response.status}).`)
  }

  return {
    repoName: `${repoRef.owner}/${repoRef.repo}`,
    repoUrl: `https://github.com/${repoRef.owner}/${repoRef.repo}`,
    defaultBranch,
    zipUrl: `https://github.com${archivePath}`,
    archive: await response.arrayBuffer(),
  }
}
