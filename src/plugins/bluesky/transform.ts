import type { BasePost } from '../_interface/PlatformPlugin'
import { BLUESKY_CONFIG } from './config'

export interface BlueskyPost {
    $type: 'app.bsky.feed.post'
    text: string
    createdAt: string
    langs: string[]
}

export function transform(post: BasePost): BlueskyPost {
    let text = post.body.trim()

    // Append tags as hashtags if present
    if (post.tags && post.tags.length > 0) {
        const hashtags = post.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ')
        const combined = `${text}\n\n${hashtags}`
        text = combined.length <= BLUESKY_CONFIG.maxPostLength
            ? combined
            : text
    }

    // Trim to max length
    if (text.length > BLUESKY_CONFIG.maxPostLength) {
        text = text.slice(0, BLUESKY_CONFIG.maxPostLength - 3) + '...'
    }

    return {
        $type: 'app.bsky.feed.post',
        text,
        createdAt: new Date().toISOString(),
        langs: ['en'],
    }
}