import type {
    PlatformPlugin,
    BasePost,
    ValidationResult,
    PublishResult,
} from '../_interface/PlatformPlugin'
import { TUMBLR_CONFIG } from './config'
import { connect, disconnect, isConnected } from './auth'
import { publish as publishPost } from './publish'
import { validate } from './validate'
import { transform } from './transform'

export class TumblrPlugin implements PlatformPlugin {
    readonly id = TUMBLR_CONFIG.id
    readonly name = TUMBLR_CONFIG.name
    readonly description = TUMBLR_CONFIG.description
    readonly authType = 'oauth1' as const
    readonly color = TUMBLR_CONFIG.color
    readonly limits = {
        maxBodyLength: undefined,
        requiresTitle: false,
        requiresImage: false,
        supportsMarkdown: false,
        supportsTags: true,
    }

    async connect(credentials?: Record<string, string>): Promise<void> {
        if (!credentials) throw new Error('Consumer key and secret are required')
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
        return `https://tumblr.com/post/${platformPostId}`
    }
}