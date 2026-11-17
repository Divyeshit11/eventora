import serverModule from '../server/server.js'

const { app, initializeApp } = serverModule

/**
 * Vercel's rewrite sends all API paths to this one function. Restore the
 * original path before giving the request to Express so its existing `/api/*`
 * routes work unchanged.
 */
export default async function handler(req, res) {
    const requestUrl = new URL(req.url, 'http://localhost')
    const path = requestUrl.searchParams.get('path')

    if (path) {
        requestUrl.searchParams.delete('path')
        const query = requestUrl.searchParams.toString()
        req.url = `/api/${path}${query ? `?${query}` : ''}`
    }

    await initializeApp()
    return app(req, res)
}
