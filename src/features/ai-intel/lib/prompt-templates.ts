import type { BriefType } from '../types'

interface PromptPair {
  system: string
  user: string
}

const TEMPLATES: Record<BriefType, { system: string; userPrefix: string }> = {
  'impact-summary': {
    system:
      'You are an intelligence analyst for a software supply-chain security operations center. ' +
      'Produce concise, executive-level impact summaries. Use bullet points and severity ratings. ' +
      'Focus on what matters most to engineering leadership.',
    userPrefix:
      'Produce a brief impact summary for the following operational data. ' +
      'Highlight the top risks, affected systems, and recommended attention areas.\n\n',
  },
  'event-analysis': {
    system:
      'You are a senior security analyst specializing in supply-chain threat intelligence. ' +
      'Provide deep-dive analysis of events with technical precision. ' +
      'Identify patterns, correlations, and potential threat chains.',
    userPrefix:
      'Perform a detailed analysis of the following events. ' +
      'Identify root causes, attack vectors, affected dependency chains, and cross-event patterns.\n\n',
  },
  'risk-assessment': {
    system:
      'You are a risk assessment specialist for software infrastructure. ' +
      'Provide forward-looking risk evaluations with probability estimates. ' +
      'Consider cascading failures and supply-chain dependencies.',
    userPrefix:
      'Conduct a forward-looking risk assessment based on the current operational landscape below. ' +
      'Estimate likelihood and potential blast radius for each identified risk.\n\n',
  },
  'remediation-plan': {
    system:
      'You are an incident response planner for a software security operations team. ' +
      'Produce actionable remediation plans with clear priority ordering, ownership suggestions, and timelines. ' +
      'Be specific about patches, configurations, and mitigations.',
    userPrefix:
      'Create a prioritized remediation plan based on the data below. ' +
      'Include immediate actions, short-term fixes, and long-term hardening recommendations.\n\n',
  },
}

export function getPrompt(type: BriefType, context: string): PromptPair {
  const template = TEMPLATES[type]

  return {
    system: template.system,
    user: template.userPrefix + context,
  }
}
