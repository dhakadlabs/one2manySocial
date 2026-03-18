import type { BasePost, PublishResult } from '../_interface/PlatformPlugin'
import { getCredentials } from './auth'
import { transform } from './transform'
import { validate } from './validate'

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
                error: 'Mastodon is not connected. Please connect in Connections.',
                retryable: false,
            }
        }

        const payload = transform(post)

        const response = await fetch(
            `${credentials.instanceUrl}/api/v1/statuses`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${credentials.accessToken}`,
                },
                body: JSON.stringify(payload),
            }
        )

        if (response.ok) {
            const data = await response.json()
            return {
                success: true,
                platformPostId: data.id,
                platformPostUrl: data.url,
            }
        }

        if (response.status === 401) {
            return {
                success: false,
                error: 'Mastodon token expired. Please reconnect in Connections.',
                errorCode: 'AUTH_EXPIRED',
                retryable: false,
            }
        }

        if (response.status === 429) {
            return {
                success: false,
                error: 'Mastodon rate limit hit. Please wait and try again.',
                errorCode: 'RATE_LIMIT',
                retryable: true,
            }
        }

        const errorData = await response.json().catch(() => null)
        return {
            success: false,
            error: errorData?.error ?? `Mastodon API error: ${response.status}`,
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