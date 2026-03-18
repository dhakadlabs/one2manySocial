import { saveToken, getToken, removeToken, hasToken } from '../../core/tokenStore'
import { MASTODON_CONFIG } from './config'

const PLATFORM_ID = MASTODON_CONFIG.id

// Step 1 — Register app on the instance and start OAuth flow
export async function connect(credentials: Record<string, string>): Promise<void> {
    const { instanceUrl } = credentials

    if (!instanceUrl || instanceUrl.trim().length === 0) {
        throw new Error('Instance URL is required')
    }

    // Clean instance URL
    const instance = instanceUrl.trim().replace(/\/$/, '')

    // Register our app on this instance
    const registerResponse = await fetch(`${instance}/api/v1/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_name: 'one2manySocial',
            redirect_uris: MASTODON_CONFIG.redirectUri,
            scopes: MASTODON_CONFIG.scopes,
            website: window.location.origin,
        }),
    })

    if (!registerResponse.ok) {
        throw new Error(`Could not connect to ${instance}. Please check the URL.`)
    }

    const appData = await registerResponse.json()

    // Save client credentials + instance temporarily
    // so the callback page can complete the flow
    sessionStorage.setItem('mastodon_oauth_pending', JSON.stringify({
        instance,
        clientId: appData.client_id,
        clientSecret: appData.client_secret,
    }))

    // Redirect to instance OAuth page
    const authUrl = new URL(`${instance}/oauth/authorize`)
    authUrl.searchParams.set('client_id', appData.client_id)
    authUrl.searchParams.set('redirect_uri', MASTODON_CONFIG.redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', MASTODON_CONFIG.scopes)

    window.location.href = authUrl.toString()
}

// Step 2 — Called by OAuthCallback page after redirect
export async function handleCallback(code: string): Promise<void> {
    const pending = sessionStorage.getItem('mastodon_oauth_pending')
    if (!pending) throw new Error('OAuth session expired. Please try connecting again.')

    const { instance, clientId, clientSecret } = JSON.parse(pending)

    // Exchange code for access token
    const tokenResponse = await fetch(`${instance}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: MASTODON_CONFIG.redirectUri,
            grant_type: 'authorization_code',
            code,
            scope: MASTODON_CONFIG.scopes,
        }),
    })

    if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token. Please try again.')
    }

    const tokenData = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch(`${instance}/api/v1/accounts/verify_credentials`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const userData = userResponse.ok ? await userResponse.json() : null

    await saveToken(
        PLATFORM_ID,
        {
            accessToken: tokenData.access_token,
            instanceUrl: instance,
        },
        {
            displayName: userData?.username ?? userData?.acct,
            platformUserId: userData?.id,
            extraConfig: JSON.stringify({ instanceUrl: instance }),
        }
    )

    // Clean up
    sessionStorage.removeItem('mastodon_oauth_pending')
}

export async function disconnect(): Promise<void> {
    await removeToken(PLATFORM_ID)
}

export async function isConnected(): Promise<boolean> {
    return hasToken(PLATFORM_ID)
}

export async function getCredentials(): Promise<{
    accessToken: string
    instanceUrl: string
} | null> {
    const token = await getToken(PLATFORM_ID)
    if (!token?.accessToken || !token?.instanceUrl) return null
    return {
        accessToken: token.accessToken,
        instanceUrl: token.instanceUrl,
    }
}