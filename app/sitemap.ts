import type { MetadataRoute } from 'next'
import { tools } from '@/lib/tools'
export const dynamic = 'force-static'

const baseUrl = 'https://iqverse.net'

export default function sitemap(): MetadataRoute.Sitemap {
  const internalTools = tools.filter((tool) => tool.type !== "coming")

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...internalTools.map((tool) => ({
      url: tool.url.startsWith('/') ? `${baseUrl}${tool.url}` : `${baseUrl}/${tool.url}/`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}

