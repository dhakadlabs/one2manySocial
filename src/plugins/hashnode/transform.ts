import type { BasePost } from '../_interface/PlatformPlugin'
import { HASHNODE_CONFIG } from './config'

export interface HashnodePayload {
    title: string
    contentMarkdown: string
    tags: { name: string; slug: string }[]
    publicationId: string
}

export function transform(post: BasePost, publicationId: string): HashnodePayload {
    const tags = (post.tags ?? [])
        .slice(0, HASHNODE_CONFIG.maxTags)
        .map(tag => ({
            name: tag,
            slug: tag.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        }))

    return {
        title: (post.title ?? '').trim(),
        contentMarkdown: post.body.trim(),
        tags,
        publicationId,
    }
}