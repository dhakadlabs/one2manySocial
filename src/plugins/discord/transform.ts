import type { BasePost } from '../_interface/PlatformPlugin'

export interface DiscordPayload {
    content?: string
    embeds?: DiscordEmbed[]
}

export interface DiscordEmbed {
    title?: string
    description: string
    color: number
    timestamp: string
}

export function transform(post: BasePost): DiscordPayload {
    const color = 0x5865f2 // Discord brand color as integer

    // If title exists — use rich embed format
    if (post.title && post.title.trim().length > 0) {
        return {
            embeds: [
                {
                    title: post.title.slice(0, 256),
                    description: post.body.slice(0, 4096),
                    color,
                    timestamp: new Date().toISOString(),
                },
            ],
        }
    }

    // No title — use plain content if short enough, embed if longer
    if (post.body.length <= 2000) {
        return { content: post.body }
    }

    return {
        embeds: [
            {
                description: post.body.slice(0, 4096),
                color,
                timestamp: new Date().toISOString(),
            },
        ],
    }
}