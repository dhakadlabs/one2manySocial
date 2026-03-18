import { saveToken, getToken, removeToken, hasToken } from '../../core/tokenStore'
import { TELEGRAM_CONFIG } from './config'

const PLATFORM_ID = TELEGRAM_CONFIG.id

export async function connect(credentials: Record<string, string>): Promise<void> {
    const { botToken, chatId } = credentials

    if (!botToken || botToken.trim().length === 0) {
        throw new Error('Bot token is required')
    }

    if (!chatId || chatId.trim().length === 0) {
        throw new Error('Chat ID is required')
    }

    // Verify bot token by calling getMe
    const response = await fetch(
        `${TELEGRAM_CONFIG.apiBase}${botToken.trim()}/getMe`
    )

    if (!response.ok) {
        throw new Error('Invalid bot token. Please check and try again.')
    }

    const data = await response.json()

    if (!data.ok) {
        throw new Error('Invalid bot token. Please check and try again.')
    }

    await saveToken(
        PLATFORM_ID,
        {
            botToken: botToken.trim(),
            chatId: chatId.trim(),
        },
        {
            displayName: data.result.username,
            platformUserId: String(data.result.id),
        }
    )
}

export async function disconnect(): Promise<void> {
    await removeToken(PLATFORM_ID)
}

export async function isConnected(): Promise<boolean> {
    return hasToken(PLATFORM_ID)
}

export async function getCredentials(): Promise<{ botToken: string; chatId: string } | null> {
    const token = await getToken(PLATFORM_ID)
    if (!token?.botToken || !token?.chatId) return null
    return {
        botToken: token.botToken,
        chatId: token.chatId,
    }
}