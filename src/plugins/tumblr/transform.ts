import type { BasePost } from '../_interface/PlatformPlugin'

export interface TumblrPayload {
    type: 'text'
    title?: string
    body: string
    tags?: string
    native_inline_images: boolean
}

export function transform(post: BasePost): TumblrPayload {
    return {
        type: 'text',
        title: post.title?.trim() || undefined,
        body: post.body.trim(),
        tags: post.tags?.join(',') ?? undefined,
        native_inline_images: true,
    }
}