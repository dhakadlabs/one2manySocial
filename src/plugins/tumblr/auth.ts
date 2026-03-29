import { saveToken, getToken, removeToken, hasToken } from '../../core/tokenStore'
import { TUMBLR_CONFIG } from './config'
import { buildAuthHeader } from './oauth1'

const PLATFORM_ID = TUMBLR_CONFIG.id

export async function connect(credentials: Record<string, string>): Promise<void> {
    const { consumerKey, consumerSecret } = credentials

    if (!consumerKey || consumerKey.trim().length === 0) {
        throw new Error('Consumer key is required')
    }

    if (!consumerSecret || consumerSecret.trim().length === 0) {
        throw new Error('Consumer secret is required')
    }

    const authHeader = buildAuthHeader({
        method: 'POST',
        url: TUMBLR_CONFIG.requestTokenUrl,
        consumerKey: consumerKey.trim(),
        consumerSecret: consumerSecret.trim(),
        extraParams: {
            oauth_callback: TUMBLR_CONFIG.redirectUri,
        },
    })

    const response = await fetch(TUMBLR_CONFIG.requestTokenUrl, {
        method: 'POST',
        headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to get request token: ${response.status} — ${text}`)
    }

    const responseText = await response.text()
    const params = new URLSearchParams(responseText)
    const requestToken = params.get('oauth_token')
    const requestTokenSecret = params.get('oauth_token_secret')

    if (!requestToken || !requestTokenSecret) {
        throw new Error('Invalid response from Tumblr. Please try again.')
    }

    sessionStorage.setItem('tumblr_oauth_pending', JSON.stringify({
        consumerKey: consumerKey.trim(),
        consumerSecret: consumerSecret.trim(),
        requestToken,
        requestTokenSecret,
    }))

    window.location.href = `${TUMBLR_CONFIG.authorizeUrl}?oauth_token=${requestToken}`
}

export async function handleCallback(
    oauthToken: string,
    oauthVerifier: string
): Promise<void> {
    const pending = sessionStorage.getItem('tumblr_oauth_pending')
    if (!pending) throw new Error('OAuth session expired. Please try connecting again.')

    const { consumerKey, consumerSecret, requestTokenSecret } = JSON.parse(pending)

    const authHeader = buildAuthHeader({
        method: 'POST',
        url: TUMBLR_CONFIG.accessTokenUrl,
        consumerKey,
        consumerSecret,
        token: oauthToken,
        tokenSecret: requestTokenSecret,
        extraParams: { oauth_verifier: oauthVerifier },
    })

    const response = await fetch(TUMBLR_CONFIG.accessTokenUrl, {
        method: 'POST',
        headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    if (!response.ok) {
        throw new Error('Failed to get access token. Please try again.')
    }

    const responseText = await response.text()
    const params = new URLSearchParams(responseText)
    const accessToken = params.get('oauth_token')
    const accessTokenSecret = params.get('oauth_token_secret')

    if (!accessToken || !accessTokenSecret) {
        throw new Error('Invalid access token response. Please try again.')
    }

    const userAuthHeader = buildAuthHeader({
        method: 'GET',
        url: `${TUMBLR_CONFIG.apiBase}/user/info`,
        consumerKey,
        consumerSecret,
        token: accessToken,
        tokenSecret: accessTokenSecret,
    })

    const userResponse = await fetch(`${TUMBLR_CONFIG.apiBase}/user/info`, {
        headers: { Authorization: userAuthHeader },
    })

    let blogName = ''
    if (userResponse.ok) {
        const userData = await userResponse.json()
        blogName = userData?.response?.user?.blogs?.[0]?.name ?? ''
    }

    await saveToken(
        PLATFORM_ID,
        {
            consumerKey,
            consumerSecret,
            accessToken,
            accessTokenSecret,
            blogName,
        },
        { displayName: blogName }
    )

    sessionStorage.removeItem('tumblr_oauth_pending')
}

export async function disconnect(): Promise<void> {
    await removeToken(PLATFORM_ID)
}

export async function isConnected(): Promise<boolean> {
    return hasToken(PLATFORM_ID)
}

export async function getCredentials(): Promise<{
    consumerKey: string
    consumerSecret: string
    accessToken: string
    accessTokenSecret: string
    blogName: string
} | null> {
    const token = await getToken(PLATFORM_ID)
    if (!token?.accessToken || !token?.consumerKey) return null
    return {
        consumerKey: token.consumerKey,
        consumerSecret: token.consumerSecret,
        accessToken: token.accessToken,
        accessTokenSecret: token.accessTokenSecret,
        blogName: token.blogName,
    }
}