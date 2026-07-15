import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const baseUrl = 'https://iqverse.net'

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    'agentscan',
    'chromata',
    'encodelab',
    'headers',
    'json',
    'linkradar',
    'password',
    'qrforge',
    'regex',
    'dnslookup',
  ]

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: `${baseUrl}/${tool}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
