import type { Scenario } from '../types'

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'aws-us-east-1',
    name: 'AWS us-east-1 Outage',
    description:
      'Simulates a full availability-zone failure in AWS us-east-1, affecting S3, Lambda, EC2 and dependent services.',
    affectedVendors: ['aws', 'amazon', 's3', 'lambda', 'ec2', 'dynamodb', 'cloudfront'],
    affectedRegions: ['us-east-1'],
    severity: 'critical',
  },
  {
    id: 'npm-unavailable',
    name: 'npm Registry Unavailable',
    description:
      'The npm registry is completely unreachable. All package installs, CI builds, and lockfile resolutions fail.',
    affectedVendors: ['npm', 'npmjs', 'registry.npmjs'],
    affectedRegions: [],
    severity: 'critical',
  },
  {
    id: 'stripe-offline',
    name: 'Stripe API Offline',
    description:
      'Stripe payment processing is down. Checkout flows, subscriptions, and webhook deliveries are interrupted.',
    affectedVendors: ['stripe', 'stripe-js', 'stripe-node'],
    affectedRegions: [],
    severity: 'high',
  },
  {
    id: 'github-down',
    name: 'GitHub Services Down',
    description:
      'GitHub.com, API, Actions, and Packages are unreachable. CI/CD pipelines and source control halt.',
    affectedVendors: ['github', 'octokit', 'actions', 'github-api'],
    affectedRegions: [],
    severity: 'critical',
  },
  {
    id: 'google-services',
    name: 'Google Cloud / Services Failure',
    description:
      'GCP, Firebase, Google Auth, and Google Maps are simultaneously unavailable.',
    affectedVendors: ['google', 'gcp', 'firebase', 'googleapis', 'google-auth', 'google-cloud'],
    affectedRegions: [],
    severity: 'critical',
  },
  {
    id: 'postgresql-cve',
    name: 'Critical PostgreSQL CVE',
    description:
      'A zero-day CVE forces immediate isolation of all PostgreSQL instances. Database access is severed.',
    affectedVendors: ['postgres', 'postgresql', 'pg', 'pgpool', 'psql'],
    affectedRegions: [],
    severity: 'high',
  },
  {
    id: 'redis-compromise',
    name: 'Redis Supply-Chain Compromise',
    description:
      'A malicious package is discovered in the Redis client ecosystem. All Redis-dependent caching and pub/sub stops.',
    affectedVendors: ['redis', 'ioredis', 'redis-client', 'bull', 'bullmq'],
    affectedRegions: [],
    severity: 'high',
  },
  {
    id: 'dns-failure',
    name: 'DNS Infrastructure Failure',
    description:
      'Major DNS resolvers (Cloudflare, Route53, Google DNS) are failing. External hostname resolution is broken.',
    affectedVendors: ['dns', 'route53', 'cloudflare-dns', 'resolver'],
    affectedRegions: [],
    severity: 'critical',
  },
  {
    id: 'cdn-outage',
    name: 'CDN Provider Outage',
    description:
      'Primary CDN (Cloudflare / Fastly / Akamai) is offline. Static assets, edge caching, and WAF rules are gone.',
    affectedVendors: ['cdn', 'cloudflare', 'fastly', 'akamai', 'cloudfront'],
    affectedRegions: [],
    severity: 'high',
  },
  {
    id: 'auth0-breach',
    name: 'Auth0 Security Breach',
    description:
      'Auth0 tenant keys are potentially compromised. All Auth0-based authentication must be disabled immediately.',
    affectedVendors: ['auth0', 'auth0-js', 'auth0-react', 'auth0-spa'],
    affectedRegions: [],
    severity: 'medium',
  },
]
