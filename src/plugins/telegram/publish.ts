import type { BasePost, PublishResult } from '../_interface/PlatformPlugin'
import { getCredentials } from './auth'
import { transform } from './transform'
import { validate } from './validate'
import { TELEGRAM_CONFIG } from './config'

export async function publish(post: BasePost): Promise<PublishResult> {
    try {
        const validation = validate(post)
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                retryable: false,
            }
        }

        const credentials = await getCredentials()
        if (!credentials) {
            return {
                success: false,
                error: 'Telegram is not connected. Please add your bot token in Connections.',
                retryable: false,
            }
        }

        const payload = transform(post, credentials.chatId)

        const response = await fetch(
            `${TELEGRAM_CONFIG.apiBase}${credentials.botToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        )

        const data = await response.json()

        if (data.ok) {
            return {
                success: true,
                platformPostId: String(data.result.message_id),
                platformPostUrl: `https://t.me/c/${credentials.chatId}/${data.result.message_id}`,
            }
        }

        if (response.status === 429) {
            return {
                success: false,
                error: 'Telegram rate limit hit. Please wait and try again.',
                errorCode: 'RATE_LIMIT',
                retryable: true,
            }
        }

        return {
            success: false,
            error: data.description ?? `Telegram API error: ${response.status}`,
            retryable: response.status >= 500,
        }

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error occurred',
            retryable: true,
        }
    }
}