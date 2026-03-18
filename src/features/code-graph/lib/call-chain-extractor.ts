import type { CallEdge, ParsedFile } from '../types'

function buildKnownDeclarations(parsedFiles: ParsedFile[]): Set<string> {
  const known = new Set<string>()

  for (const file of parsedFiles) {
    for (const declaration of file.declarations) {
      known.add(declaration.id)
      known.add(declaration.name)
    }
  }

  return known
}

function normalizeCallTarget(callee: string, knownDeclarations: Set<string>): string | null {
  if (knownDeclarations.has(callee)) {
    return callee
  }

  if (callee.includes('.')) {
    return null
  }

  return knownDeclarations.has(callee) ? callee : null
}

export function extractCallEdges(parsedFiles: ParsedFile[]): CallEdge[] {
  const knownDeclarations = buildKnownDeclarations(parsedFiles)
  const callEdges: CallEdge[] = []

  for (const file of parsedFiles) {
    for (const call of file.calls) {
      if (!knownDeclarations.has(call.caller)) {
        continue
      }

      const target = normalizeCallTarget(call.callee, knownDeclarations)

      if (!target) {
        continue
      }

      callEdges.push({
        source: call.caller,
        target,
        line: call.line,
        path: file.path,
      })
    }
  }

  return callEdges
}
