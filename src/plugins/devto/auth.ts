import { saveToken, getToken, removeToken, hasToken } from '../../core/tokenStore'
import { DEVTO_CONFIG } from './config'

const PLATFORM_ID = DEVTO_CONFIG.id

// CORS proxy for development — Dev.to blocks direct browser requests from localhost
// In production this won't be needed if hosted on a real domain
const CORS_PROXY = 'https://corsproxy.io/?'

export async function connect(credentials: Record<string, string>): Promise<void> {
    const { apiKey } = credentials

    if (!apiKey || apiKey.trim().length === 0) {
        throw new Error('API key is required')
    }

    // Verify the API key works
    const url = `${CORS_PROXY}${encodeURIComponent(`${DEVTO_CONFIG.apiBase}/users/me`)}`

    const response = await fetch(url, {
        headers: {
            'api-key': apiKey.trim(),
            'Content-Type': 'application/json',
        },
    })

    if (response.status === 401) {
        throw new Error('Invalid API key. Please check and try again.')
    }

    if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.status}. Please try again.`)
    }

    const user = await response.json()

    await saveToken(
        PLATFORM_ID,
        { apiKey: apiKey.trim() },
        {
            displayName: user.username ?? user.name,
            platformUserId: String(user.id),
        }
    )
}

export async function disconnect(): Promise<void> {
    await removeToken(PLATFORM_ID)
}

export async function isConnected(): Promise<boolean> {
    return hasToken(PLATFORM_ID)
}

export async function getApiKey(): Promise<string | null> {
    const token = await getToken(PLATFORM_ID)
    return token?.apiKey ?? null
}