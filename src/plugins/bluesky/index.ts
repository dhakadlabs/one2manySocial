import type {
    PlatformPlugin,
    BasePost,
    ValidationResult,
    PublishResult,
} from '../_interface/PlatformPlugin'
import { BLUESKY_CONFIG } from './config'
import { connect, disconnect, isConnected } from './auth'
import { publish as publishPost } from './publish'
import { validate } from './validate'
import { transform } from './transform'

export class BlueskyPlugin implements PlatformPlugin {
    readonly id = BLUESKY_CONFIG.id
    readonly name = BLUESKY_CONFIG.name
    readonly description = BLUESKY_CONFIG.description
    readonly authType = 'api_token' as const
    readonly color = BLUESKY_CONFIG.color
    readonly limits = {
        maxBodyLength: BLUESKY_CONFIG.maxPostLength,
        requiresTitle: false,
        requiresImage: false,
        supportsMarkdown: false,
        supportsTags: true,
    }

    async connect(credentials?: Record<string, string>): Promise<void> {
        if (!credentials) throw new Error('Handle and app password are required')
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
        return `https://bsky.app/profile/${platformPostId}`
    }
}