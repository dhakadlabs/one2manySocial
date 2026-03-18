import type { BasePost } from '../_interface/PlatformPlugin'
import { DEVTO_CONFIG } from './config'

export interface DevToPayload {
    article: {
        title: string
        body_markdown: string
        published: boolean
        tags: string[]
    }
}

export function transform(post: BasePost): DevToPayload {
    // Dev.to tags must be lowercase, no spaces, no special chars
    const cleanTags = (post.tags ?? [])
        .slice(0, DEVTO_CONFIG.maxTags)
        .map(tag =>
            tag
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
        )
        .filter(tag => tag.length > 0)

    return {
        article: {
            title: (post.title ?? '').trim(),
            body_markdown: post.body.trim(),
            published: true,
            tags: cleanTags,
        },
    }
}