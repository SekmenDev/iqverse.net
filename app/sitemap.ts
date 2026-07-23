import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const baseUrl = 'https://iqverse.net'

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    'agentscan',
    'qrforge',
    'linkradar',
    'favicongen',
    'json',
    'encodelab',
    'regex',
    'password',
    'headers',
    'chromata',
    'dnslookup',
    'hashing',
    'compression',
    'dataconverter',
    'cssunits',
    'csvviewer',
    'imageoptimizer',
    'url',
    'goo',
    'ges',
    'gyp',
    'gst',
  ]

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...tools.map((tool) => ({
      url: `${baseUrl}/${tool}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
