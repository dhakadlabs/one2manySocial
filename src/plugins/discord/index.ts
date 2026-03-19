import type {
    PlatformPlugin,
    BasePost,
    ValidationResult,
    PublishResult,
} from '../_interface/PlatformPlugin'
import { DISCORD_CONFIG } from './config'
import { connect, disconnect, isConnected } from './auth'
import { publish as publishPost } from './publish'
import { validate } from './validate'
import { transform } from './transform'

export class DiscordPlugin implements PlatformPlugin {
    readonly id = DISCORD_CONFIG.id
    readonly name = DISCORD_CONFIG.name
    readonly description = DISCORD_CONFIG.description
    readonly authType = 'webhook' as const
    readonly color = DISCORD_CONFIG.color
    readonly limits = {
        maxBodyLength: DISCORD_CONFIG.maxBodyLength,
        requiresTitle: false,
        requiresImage: false,
        supportsMarkdown: true,
        supportsTags: false,
    }

    async connect(credentials?: Record<string, string>): Promise<void> {
        if (!credentials) throw new Error('Webhook URL is required')
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
        return transform(post) as unknown as Record<string, unknown>
    }

    async publish(post: BasePost): Promise<PublishResult> {
        return publishPost(post)
    }

    getPostUrl(platformPostId: string): string {
        return platformPostId
    }
}