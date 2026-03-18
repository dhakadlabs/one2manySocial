import type { BasePost, PublishResult } from '../_interface/PlatformPlugin'
import { getCredentials, refreshSession } from './auth'
import { transform } from './transform'
import { validate } from './validate'
import { BLUESKY_CONFIG } from './config'

async function sendPost(
    accessJwt: string,
    did: string,
    post: BasePost
): Promise<Response> {
    const record = transform(post)

    return fetch(
        `${BLUESKY_CONFIG.apiBase}/com.atproto.repo.createRecord`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessJwt}`,
            },
            body: JSON.stringify({
                repo: did,
                collection: 'app.bsky.feed.post',
                record,
            }),
        }
    )
}

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
                error: 'Bluesky is not connected. Please connect in Connections.',
                retryable: false,
            }
        }

        let response = await sendPost(
            credentials.accessJwt,
            credentials.did,
            post
        )

        // If token expired — refresh and retry once
        if (response.status === 401) {
            const newAccessJwt = await refreshSession()
            if (!newAccessJwt) {
                return {
                    success: false,
                    error: 'Bluesky session expired. Please reconnect in Connections.',
                    errorCode: 'AUTH_EXPIRED',
                    retryable: false,
                }
            }
            response = await sendPost(newAccessJwt, credentials.did, post)
        }

        if (response.ok) {
            const data = await response.json()
            const postId = data.uri?.split('/').pop() ?? ''
            const handle = credentials.handle.replace('@', '')
            return {
                success: true,
                platformPostId: data.uri,
                platformPostUrl: `https://bsky.app/profile/${handle}/post/${postId}`,
            }
        }

        if (response.status === 429) {
            return {
                success: false,
                error: 'Bluesky rate limit hit. Please wait and try again.',
                errorCode: 'RATE_LIMIT',
                retryable: true,
            }
        }

        const errorData = await response.json().catch(() => null)
        return {
            success: false,
            error: errorData?.message ?? `Bluesky API error: ${response.status}`,
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