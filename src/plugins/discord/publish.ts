import type { BasePost, PublishResult } from '../_interface/PlatformPlugin'
import { getWebhookUrl } from './auth'
import { transform } from './transform'
import { validate } from './validate'

export async function publish(post: BasePost): Promise<PublishResult> {
    try {
        // Validate first
        const validation = validate(post)
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                retryable: false,
            }
        }

        // Get webhook URL
        const webhookUrl = await getWebhookUrl()
        if (!webhookUrl) {
            return {
                success: false,
                error: 'Discord is not connected. Please add your webhook URL in Connections.',
                retryable: false,
            }
        }

        // Transform and send
        const payload = transform(post)

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        // Discord returns 204 No Content on success
        if (response.ok || response.status === 204) {
            return {
                success: true,
                platformPostUrl: webhookUrl.split('/').slice(0, 7).join('/'),
            }
        }

        // Handle rate limit
        if (response.status === 429) {
            return {
                success: false,
                error: 'Discord rate limit hit. Please wait a moment and try again.',
                errorCode: 'RATE_LIMIT',
                retryable: true,
            }
        }

        const errorText = await response.text()
        return {
            success: false,
            error: `Discord API error ${response.status}: ${errorText}`,
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