import Dexie, { type EntityTable } from 'dexie'

export interface RepoRecord {
  id: string
  name: string
  owner: string
  url: string
  stars: number
  language: string | null
  lastAnalyzedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EventRecord {
  id: string
  repoId: string
  source: string
  title: string
  payload: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  happenedAt: string
  createdAt: string
}

export interface FeedRecord {
  id: string
  repoId: string
  provider: string
  status: 'idle' | 'syncing' | 'error'
  lastSyncedAt: string | null
  cursor: string | null
  createdAt: string
  updatedAt: string
}

export interface ImpactRecord {
  id: string
  repoId: string
  score: number
  confidence: number
  summary: string
  computedAt: string
}

export interface BriefRecord {
  id: string
  repoId: string
  title: string
  body: string
  tags: string[]
  publishedAt: string
  createdAt: string
}

export interface AlertRecord {
  id: string
  repoId: string
  level: 'info' | 'warning' | 'critical'
  message: string
  acknowledged: 0 | 1
  createdAt: string
}

class ImpactSphereDatabase extends Dexie {
  repos!: EntityTable<RepoRecord, 'id'>
  events!: EntityTable<EventRecord, 'id'>
  feeds!: EntityTable<FeedRecord, 'id'>
  impacts!: EntityTable<ImpactRecord, 'id'>
  briefs!: EntityTable<BriefRecord, 'id'>
  alerts!: EntityTable<AlertRecord, 'id'>

  constructor() {
    super('impactsphere')

    this.version(1).stores({
      repos: '&id, owner, name, stars, updatedAt',
      events: '&id, repoId, severity, happenedAt, createdAt',
      feeds: '&id, repoId, provider, status, updatedAt',
      impacts: '&id, repoId, score, computedAt',
      briefs: '&id, repoId, publishedAt, createdAt',
      alerts: '&id, repoId, level, acknowledged, createdAt',
    })
  }
}

export const db = new ImpactSphereDatabase()
