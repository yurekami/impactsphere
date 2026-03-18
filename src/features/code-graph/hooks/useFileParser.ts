import { useCallback } from 'react'
import { useCodeGraphStore } from '../stores/code-graph.store'

export function useFileParser() {
  const parseRepo = useCodeGraphStore((state) => state.parseRepo)

  const parseGitHub = useCallback(
    async (repository: string, token?: string) => {
      await parseRepo({
        type: 'github',
        value: repository,
        token,
      })
    },
    [parseRepo],
  )

  const parseZip = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase().endsWith('.zip')
        ? file.name.slice(0, -4)
        : file.name

      await parseRepo({
        type: 'zip',
        file,
        name,
      })
    },
    [parseRepo],
  )

  return {
    parseGitHub,
    parseZip,
  }
}
