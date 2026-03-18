import type { BasePost } from '../_interface/PlatformPlugin'

export interface TelegramPayload {
    chat_id: string
    text: string
    parse_mode: 'MarkdownV2'
}

// MarkdownV2 requires escaping these special characters
function escapeMarkdownV2(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&')
}

export function transform(post: BasePost, chatId: string): TelegramPayload {
    let text = ''

    // Add title as bold if present
    if (post.title && post.title.trim().length > 0) {
        text += `*${escapeMarkdownV2(post.title.trim())}*\n\n`
    }

    text += escapeMarkdownV2(post.body.trim())

    // Add tags as hashtags if present
    if (post.tags && post.tags.length > 0) {
        const hashtags = post.tags
            .map(tag => `#${tag.replace(/\s+/g, '_')}`)
            .join(' ')
        text += `\n\n${escapeMarkdownV2(hashtags)}`
    }

    // Trim to max length
    if (text.length > 4096) {
        text = text.slice(0, 4093) + '\\.\\.\\.'
    }

    return {
        chat_id: chatId,
        text,
        parse_mode: 'MarkdownV2',
    }
}