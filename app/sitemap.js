export const dynamic = 'force-static'

export default function sitemap() {
  const baseUrl = 'https://alwateen.com'
  const now = new Date()

  const routes = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/free-whiteboard', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/grammar-games', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.85 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.75 },
    { path: '/quick-quiz', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/azkar', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/try-live', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/prep-1', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/prep-2', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/prep-3', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/sec-1', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/sec-2', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/sec-3', changeFrequency: 'weekly', priority: 0.95 },
    { path: '/primary-1', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/primary-2', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/primary-3', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/primary-4', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/primary-5', changeFrequency: 'weekly', priority: 0.85 },
    { path: '/primary-6', changeFrequency: 'weekly', priority: 0.85 },
  ]

  return routes.map(r => ({
    url: baseUrl + r.path,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
