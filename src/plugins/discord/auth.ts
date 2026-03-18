import { saveToken, getToken, removeToken, hasToken } from '../../core/tokenStore'

const PLATFORM_ID = 'discord'

export async function connect(credentials: Record<string, string>): Promise<void> {
    const { webhookUrl } = credentials

    if (!webhookUrl || !webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
        throw new Error('Invalid Discord webhook URL. It must start with https://discord.com/api/webhooks/')
    }

    // Test the webhook before saving
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: '✅ one2manySocial connected successfully!',
        }),
    })

    if (!response.ok && response.status !== 204) {
        throw new Error(`Webhook test failed. Status: ${response.status}. Please check your webhook URL.`)
    }

    await saveToken(PLATFORM_ID, { webhookUrl })
}

export async function disconnect(): Promise<void> {
    await removeToken(PLATFORM_ID)
}

export async function isConnected(): Promise<boolean> {
    return hasToken(PLATFORM_ID)
}

export async function getWebhookUrl(): Promise<string | null> {
    const token = await getToken(PLATFORM_ID)
    return token?.webhookUrl ?? null
}