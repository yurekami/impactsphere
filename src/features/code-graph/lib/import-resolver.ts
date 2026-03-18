import type { ParsedFile, ResolvedImport } from '../types'

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.cts', '.d.ts']

interface TsConfigPaths {
  baseUrl?: string
  paths: Record<string, string[]>
}

function toPosix(value: string): string {
  return value.replaceAll('\\', '/')
}

function splitPath(pathValue: string): string[] {
  return toPosix(pathValue).split('/').filter(Boolean)
}

function normalizePosix(pathValue: string): string {
  const isAbsolute = toPosix(pathValue).startsWith('/')
  const output: string[] = []

  for (const part of splitPath(pathValue)) {
    if (part === '.') {
      continue
    }

    if (part === '..') {
      output.pop()
      continue
    }

    output.push(part)
  }

  const normalized = output.join('/')
  return isAbsolute ? `/${normalized}` : normalized
}

function dirnamePosix(pathValue: string): string {
  const normalized = normalizePosix(pathValue)
  const index = normalized.lastIndexOf('/')

  if (index <= 0) {
    return '.'
  }

  return normalized.slice(0, index)
}

function joinPosix(...parts: string[]): string {
  return normalizePosix(parts.join('/'))
}

function extnamePosix(pathValue: string): string {
  const normalized = normalizePosix(pathValue)
  const basename = normalized.slice(normalized.lastIndexOf('/') + 1)
  const dotIndex = basename.lastIndexOf('.')

  if (dotIndex <= 0) {
    return ''
  }

  return basename.slice(dotIndex)
}

function hasExtension(specifier: string): boolean {
  return extnamePosix(specifier).length > 0
}

function fileExists(files: Map<string, string>, candidate: string): boolean {
  return files.has(toPosix(candidate))
}

function expandCandidateFiles(baseCandidate: string): string[] {
  if (hasExtension(baseCandidate)) {
    return [baseCandidate]
  }

  const withExtensions = SOURCE_EXTENSIONS.map((extension) => `${baseCandidate}${extension}`)
  const asIndex = SOURCE_EXTENSIONS.map((extension) => `${baseCandidate}/index${extension}`)
  return [baseCandidate, ...withExtensions, ...asIndex]
}

function resolveRelativeImport(
  sourcePath: string,
  specifier: string,
  files: Map<string, string>,
): string | null {
  const baseDirectory = dirnamePosix(sourcePath)
  const normalizedBase = joinPosix(baseDirectory, specifier)

  for (const candidate of expandCandidateFiles(normalizedBase)) {
    if (fileExists(files, candidate)) {
      return candidate
    }
  }

  return null
}

function pathPatternToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replaceAll('*', '(.+)')
  return new RegExp(`^${escaped}$`)
}

function resolveFromTsPaths(
  sourcePath: string,
  specifier: string,
  files: Map<string, string>,
  tsConfigPaths: TsConfigPaths,
): string | null {
  const baseUrl = tsConfigPaths.baseUrl ? toPosix(tsConfigPaths.baseUrl) : ''

  for (const [alias, mappings] of Object.entries(tsConfigPaths.paths)) {
    const pattern = pathPatternToRegExp(alias)
    const match = specifier.match(pattern)

    if (!match) {
      continue
    }

    const wildcard = match[1] ?? ''

    for (const mapping of mappings) {
      const mapped = toPosix(mapping.replaceAll('*', wildcard))
      const candidateBase = baseUrl
        ? joinPosix(baseUrl, mapped)
        : mapped

      const resolved = resolveRelativeImport(sourcePath, candidateBase.startsWith('.') ? candidateBase : `./${candidateBase}`, files)

      if (resolved) {
        return resolved
      }

      for (const candidate of expandCandidateFiles(candidateBase)) {
        if (fileExists(files, candidate)) {
          return candidate
        }
      }
    }
  }

  return null
}

interface ResolveImportOptions {
  fileMap: Map<string, string>
  tsConfigPaths?: TsConfigPaths
}

export function resolveImports(
  parsedFiles: ParsedFile[],
  options: ResolveImportOptions,
): ResolvedImport[] {
  const resolved: ResolvedImport[] = []

  for (const parsedFile of parsedFiles) {
    for (const imported of parsedFile.imports) {
      const specifier = imported.specifier

      if (specifier.startsWith('.') || specifier.startsWith('/')) {
        const targetPath = resolveRelativeImport(parsedFile.path, specifier, options.fileMap)

        resolved.push({
          ...imported,
          sourcePath: parsedFile.path,
          targetPath,
          resolved: targetPath,
          isExternal: false,
        })
        continue
      }

      const tsResolved = options.tsConfigPaths
        ? resolveFromTsPaths(parsedFile.path, specifier, options.fileMap, options.tsConfigPaths)
        : null

      if (tsResolved) {
        resolved.push({
          ...imported,
          sourcePath: parsedFile.path,
          targetPath: tsResolved,
          resolved: tsResolved,
          isExternal: false,
        })
        continue
      }

      resolved.push({
        ...imported,
        sourcePath: parsedFile.path,
        targetPath: null,
        resolved: null,
        isExternal: true,
      })
    }
  }

  return resolved
}

export function parseTsConfigPaths(fileMap: Map<string, string>): TsConfigPaths {
  const defaultPaths: TsConfigPaths = { paths: {} }
  const tsConfig = fileMap.get('tsconfig.json')

  if (!tsConfig) {
    return defaultPaths
  }

  try {
    const parsed = JSON.parse(tsConfig) as {
      compilerOptions?: { baseUrl?: string; paths?: Record<string, string[]> }
    }

    return {
      baseUrl: parsed.compilerOptions?.baseUrl,
      paths: parsed.compilerOptions?.paths ?? {},
    }
  } catch {
    return defaultPaths
  }
}
