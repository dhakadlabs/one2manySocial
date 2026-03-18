import type { BasePost } from '../_interface/PlatformPlugin'
import { MASTODON_CONFIG } from './config'

export interface MastodonPayload {
    status: string
    visibility: 'public'
}

export function transform(post: BasePost): MastodonPayload {
    let text = post.body.trim()

    // Append hashtags from tags
    if (post.tags && post.tags.length > 0) {
        const hashtags = post.tags
            .map(t => `#${t.replace(/\s+/g, '')}`)
            .join(' ')
        const combined = `${text}\n\n${hashtags}`
        text = combined.length <= MASTODON_CONFIG.maxPostLength
            ? combined
            : text
    }

    // Trim to max length
    if (text.length > MASTODON_CONFIG.maxPostLength) {
        text = text.slice(0, MASTODON_CONFIG.maxPostLength - 3) + '...'
    }

    return {
        status: text,
        visibility: 'public',
    }
}