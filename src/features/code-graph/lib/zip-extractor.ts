import { strFromU8, unzipSync } from 'fflate'

export interface ExtractedZipMetadata {
  totalEntries: number
  includedFiles: number
  skippedDirectories: number
  skippedBinary: number
}

export interface ExtractedZipResult {
  files: Map<string, string>
  metadata: ExtractedZipMetadata
}

const IGNORED_DIRECTORY_SEGMENTS = new Set(['node_modules', '.git'])
const BINARY_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'ico',
  'bmp',
  'pdf',
  'zip',
  'gz',
  'tar',
  'woff',
  'woff2',
  'ttf',
  'eot',
  'mp3',
  'mp4',
  'mov',
  'avi',
  'webm',
  'wasm',
  'exe',
  'dll',
  'so',
  'dylib',
])

function normalizeEntryPath(path: string): string {
  return path.replaceAll('\\', '/').replace(/^\/+/, '')
}

function trimArchiveRoot(path: string): string {
  const segments = path.split('/').filter(Boolean)

  if (segments.length <= 1) {
    return ''
  }

  return segments.slice(1).join('/')
}

function shouldIgnorePath(path: string): boolean {
  const segments = path.split('/').filter(Boolean)
  return segments.some((segment) => IGNORED_DIRECTORY_SEGMENTS.has(segment))
}

function extensionOf(path: string): string {
  const dotIndex = path.lastIndexOf('.')
  if (dotIndex < 0 || dotIndex === path.length - 1) {
    return ''
  }
  return path.slice(dotIndex + 1).toLowerCase()
}

function hasBinaryContent(data: Uint8Array): boolean {
  const sampleSize = Math.min(data.length, 1024)

  for (let index = 0; index < sampleSize; index += 1) {
    if (data[index] === 0) {
      return true
    }
  }

  return false
}

function isBinaryFile(path: string, data: Uint8Array): boolean {
  const extension = extensionOf(path)

  if (extension && BINARY_EXTENSIONS.has(extension)) {
    return true
  }

  return hasBinaryContent(data)
}

export function extractZipArchive(archive: ArrayBuffer): ExtractedZipResult {
  const entries = unzipSync(new Uint8Array(archive))
  const files = new Map<string, string>()

  const metadata: ExtractedZipMetadata = {
    totalEntries: 0,
    includedFiles: 0,
    skippedDirectories: 0,
    skippedBinary: 0,
  }

  for (const [rawPath, data] of Object.entries(entries)) {
    metadata.totalEntries += 1

    const normalized = normalizeEntryPath(rawPath)
    const path = trimArchiveRoot(normalized)

    if (!path || normalized.endsWith('/')) {
      metadata.skippedDirectories += 1
      continue
    }

    if (shouldIgnorePath(path)) {
      metadata.skippedDirectories += 1
      continue
    }

    if (isBinaryFile(path, data)) {
      metadata.skippedBinary += 1
      continue
    }

    files.set(path, strFromU8(data))
    metadata.includedFiles += 1
  }

  return { files, metadata }
}
