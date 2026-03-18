import type {
    PlatformPlugin,
    BasePost,
    ValidationResult,
    PublishResult,
} from '../_interface/PlatformPlugin'
import { TELEGRAM_CONFIG } from './config'
import { connect, disconnect, isConnected } from './auth'
import { publish as publishPost } from './publish'
import { validate } from './validate'
import { transform } from './transform'

export class TelegramPlugin implements PlatformPlugin {
    readonly id = TELEGRAM_CONFIG.id
    readonly name = TELEGRAM_CONFIG.name
    readonly description = TELEGRAM_CONFIG.description
    readonly authType = 'bot_token' as const
    readonly color = TELEGRAM_CONFIG.color
    readonly limits = {
        maxBodyLength: TELEGRAM_CONFIG.maxMessageLength,
        requiresTitle: false,
        requiresImage: false,
        supportsMarkdown: true,
        supportsTags: true,
    }

    async connect(credentials?: Record<string, string>): Promise<void> {
        if (!credentials) throw new Error('Bot token and chat ID are required')
        await connect(credentials)
    }

    async disconnect(): Promise<void> {
        await disconnect()
    }

    async isConnected(): Promise<boolean> {
        return isConnected()
    }

    validate(post: BasePost): ValidationResult {
        return validate(post)
    }

    transform(post: BasePost): Record<string, unknown> {
        return transform(post, '') as Record<string, unknown>
    }

    async publish(post: BasePost): Promise<PublishResult> {
        return publishPost(post)
    }
}