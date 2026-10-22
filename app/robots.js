export const dynamic = 'force-static'

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin-dashboard/'],
    },
    sitemap: 'https://alwateen.com/sitemap.xml',
  }
}
