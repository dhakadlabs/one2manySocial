import type { BasePost, PublishResult } from '../_interface/PlatformPlugin'
import { getApiKey } from './auth'
import { transform } from './transform'
import { validate } from './validate'
import { DEVTO_CONFIG } from './config'

const isDev = window.location.hostname === 'localhost'

function apiUrl(path: string): string {
  if (isDev) {
    return `/devto-proxy/api${path}`
  }
  return `/api/devto?path=${encodeURIComponent(path)}`
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

    const apiKey = await getApiKey()
    if (!apiKey) {
      return {
        success: false,
        error: 'Dev.to is not connected. Please add your API key in Connections.',
        retryable: false,
      }
    }

    const payload = transform(post)

    const response = await fetch(apiUrl('/articles'), {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        platformPostId: String(data.id),
        platformPostUrl: data.url,
      }
    }

    if (response.status === 401) {
      return {
        success: false,
        error: 'Dev.to API key is invalid. Please reconnect.',
        errorCode: 'AUTH_INVALID',
        retryable: false,
      }
    }

    if (response.status === 429) {
      return {
        success: false,
        error: 'Dev.to rate limit hit. Please wait and try again.',
        errorCode: 'RATE_LIMIT',
        retryable: true,
      }
    }

    const errorData = await response.json().catch(() => null)
    return {
      success: false,
      error: errorData?.error ?? `Dev.to API error: ${response.status}`,
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