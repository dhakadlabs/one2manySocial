import CryptoJS from 'crypto-js'

export interface OAuth1Params {
    method: string
    url: string
    consumerKey: string
    consumerSecret: string
    token?: string
    tokenSecret?: string
    extraParams?: Record<string, string>
}

function generateNonce(): string {
    return Math.random().toString(36).substring(2) +
        Math.random().toString(36).substring(2)
}

function generateTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString()
}

function percentEncode(str: string): string {
    return encodeURIComponent(str)
        .replace(/!/g, '%21')
        .replace(/\*/g, '%2A')
        .replace(/'/g, '%27')
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')
}

export function buildAuthHeader(params: OAuth1Params): string {
    const oauthParams: Record<string, string> = {
        oauth_consumer_key: params.consumerKey,
        oauth_nonce: generateNonce(),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: generateTimestamp(),
        oauth_version: '1.0',
    }

    if (params.token) {
        oauthParams.oauth_token = params.token
    }

    // Combine oauth params + extra params for signature
    const allParams: Record<string, string> = {
        ...oauthParams,
        ...(params.extraParams ?? {}),
    }

    // Sort and encode params for base string
    const sortedParams = Object.keys(allParams)
        .sort()
        .map(key => `${percentEncode(key)}=${percentEncode(allParams[key])}`)
        .join('&')

    // Build signature base string
    const baseString = [
        params.method.toUpperCase(),
        percentEncode(params.url),
        percentEncode(sortedParams),
    ].join('&')

    // Build signing key
    const signingKey = `${percentEncode(params.consumerSecret)}&${percentEncode(params.tokenSecret ?? '')}`

    // Generate HMAC-SHA1 signature
    const signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64)

    oauthParams.oauth_signature = signature

    // Build Authorization header
    const headerParams = Object.keys(oauthParams)
        .sort()
        .map(key => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
        .join(', ')

    return `OAuth ${headerParams}`
}