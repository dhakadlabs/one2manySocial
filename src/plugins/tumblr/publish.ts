import type { BasePost, PublishResult } from '../_interface/PlatformPlugin'
import { getCredentials } from './auth'
import { transform } from './transform'
import { validate } from './validate'
import { buildAuthHeader } from './oauth1'

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
                error: 'Tumblr is not connected. Please connect in Connections.',
                retryable: false,
            }
        }

        const payload = transform(post)

        const realUrl = `https://api.tumblr.com/v2/blog/${credentials.blogName}/posts`

        const authHeader = buildAuthHeader({
            method: 'POST',
            url: realUrl,
            consumerKey: credentials.consumerKey,
            consumerSecret: credentials.consumerSecret,
            token: credentials.accessToken,
            tokenSecret: credentials.accessTokenSecret,
        })

        const response = await fetch(realUrl, {
            method: 'POST',
            headers: {
                Authorization: authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (response.ok) {
            const data = await response.json()
            const postId = data?.response?.id_string ?? data?.response?.id
            return {
                success: true,
                platformPostId: String(postId),
                platformPostUrl: `https://${credentials.blogName}.tumblr.com/post/${postId}`,
            }
        }

        if (response.status === 401) {
            return {
                success: false,
                error: 'Tumblr token expired. Please reconnect.',
                errorCode: 'AUTH_EXPIRED',
                retryable: false,
            }
        }

        if (response.status === 429) {
            return {
                success: false,
                error: 'Tumblr rate limit hit. Please wait and try again.',
                errorCode: 'RATE_LIMIT',
                retryable: true,
            }
        }

        const errorData = await response.json().catch(() => null)
        return {
            success: false,
            error: errorData?.meta?.msg ?? `Tumblr API error: ${response.status}`,
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