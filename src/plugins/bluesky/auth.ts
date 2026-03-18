import { saveToken, getToken, removeToken, hasToken } from '../../core/tokenStore'
import { BLUESKY_CONFIG } from './config'

const PLATFORM_ID = BLUESKY_CONFIG.id

export async function connect(credentials: Record<string, string>): Promise<void> {
    const { handle, appPassword } = credentials

    if (!handle || handle.trim().length === 0) {
        throw new Error('Bluesky handle is required')
    }

    if (!appPassword || appPassword.trim().length === 0) {
        throw new Error('App password is required')
    }

    // Create a session to verify credentials
    const response = await fetch(
        `${BLUESKY_CONFIG.apiBase}/com.atproto.server.createSession`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: handle.trim(),
                password: appPassword.trim(),
            }),
        }
    )

    if (response.status === 401) {
        throw new Error('Invalid handle or app password. Please check and try again.')
    }

    if (!response.ok) {
        throw new Error(`Bluesky API error: ${response.status}. Please try again.`)
    }

    const data = await response.json()

    await saveToken(
        PLATFORM_ID,
        {
            handle: handle.trim(),
            appPassword: appPassword.trim(),
            did: data.did,
            accessJwt: data.accessJwt,
            refreshJwt: data.refreshJwt,
        },
        {
            displayName: data.handle,
            platformUserId: data.did,
        }
    )
}

export async function disconnect(): Promise<void> {
    await removeToken(PLATFORM_ID)
}

export async function isConnected(): Promise<boolean> {
    return hasToken(PLATFORM_ID)
}

export async function getCredentials(): Promise<{
    handle: string
    appPassword: string
    did: string
    accessJwt: string
    refreshJwt: string
} | null> {
    const token = await getToken(PLATFORM_ID)
    if (!token?.handle || !token?.appPassword || !token?.did) return null
    return {
        handle: token.handle,
        appPassword: token.appPassword,
        did: token.did,
        accessJwt: token.accessJwt,
        refreshJwt: token.refreshJwt,
    }
}

// Refresh session and return new accessJwt
export async function refreshSession(): Promise<string | null> {
    const credentials = await getCredentials()
    if (!credentials) return null

    const response = await fetch(
        `${BLUESKY_CONFIG.apiBase}/com.atproto.server.createSession`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: credentials.handle,
                password: credentials.appPassword,
            }),
        }
    )

    if (!response.ok) return null

    const data = await response.json()

    await saveToken(
        PLATFORM_ID,
        {
            handle: credentials.handle,
            appPassword: credentials.appPassword,
            did: data.did,
            accessJwt: data.accessJwt,
            refreshJwt: data.refreshJwt,
        },
        {
            displayName: data.handle,
            platformUserId: data.did,
        }
    )

    return data.accessJwt
}