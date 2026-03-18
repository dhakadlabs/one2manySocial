import { saveToken, getToken, removeToken, hasToken } from '../../core/tokenStore'
import { HASHNODE_CONFIG } from './config'

const PLATFORM_ID = HASHNODE_CONFIG.id

export async function connect(credentials: Record<string, string>): Promise<void> {
    const { accessToken, publicationId } = credentials

    if (!accessToken || accessToken.trim().length === 0) {
        throw new Error('Access token is required')
    }

    if (!publicationId || publicationId.trim().length === 0) {
        throw new Error('Publication ID is required')
    }

    // Verify token by querying current user
    const response = await fetch(HASHNODE_CONFIG.apiBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': accessToken.trim(),
        },
        body: JSON.stringify({
            query: `{ me { id username name } }`,
        }),
    })

    if (!response.ok) {
        throw new Error(`Hashnode API error: ${response.status}. Please try again.`)
    }

    const data = await response.json()

    if (data.errors) {
        throw new Error('Invalid access token. Please check and try again.')
    }

    const user = data.data?.me

    await saveToken(
        PLATFORM_ID,
        {
            accessToken: accessToken.trim(),
            publicationId: publicationId.trim(),
        },
        {
            displayName: user?.username ?? user?.name,
            platformUserId: user?.id,
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
    accessToken: string
    publicationId: string
} | null> {
    const token = await getToken(PLATFORM_ID)
    if (!token?.accessToken || !token?.publicationId) return null
    return {
        accessToken: token.accessToken,
        publicationId: token.publicationId,
    }
}