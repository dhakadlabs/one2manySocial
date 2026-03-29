import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = (req.query.path as string) || ''
  const apiKey = req.headers['x-api-key'] as string

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' })
  }

  const url = `https://dev.to/api${path}`

  const response = await fetch(url, {
    method: req.method,
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
  })

  const data = await response.json()

  res.status(response.status).json(data)
}