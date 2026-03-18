import type {
    PlatformPlugin,
    BasePost,
    ValidationResult,
    PublishResult,
} from '../_interface/PlatformPlugin'
import { DEVTO_CONFIG } from './config'
import { connect, disconnect, isConnected } from './auth'
import { publish as publishPost } from './publish'
import { validate } from './validate'
import { transform } from './transform'

export class DevToPlugin implements PlatformPlugin {
    readonly id = DEVTO_CONFIG.id
    readonly name = DEVTO_CONFIG.name
    readonly description = DEVTO_CONFIG.description
    readonly authType = 'api_token' as const
    readonly color = DEVTO_CONFIG.color
    readonly limits = {
        maxBodyLength: undefined,
        requiresTitle: true,
        requiresImage: false,
        supportsMarkdown: true,
        supportsTags: true,
        maxTags: DEVTO_CONFIG.maxTags,
    }

    async connect(credentials?: Record<string, string>): Promise<void> {
        if (!credentials) throw new Error('API key is required')
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
        return transform(post) as Record<string, unknown>
    }

    async publish(post: BasePost): Promise<PublishResult> {
        return publishPost(post)
    }

    getPostUrl(platformPostId: string): string {
        return `https://dev.to/api/articles/${platformPostId}`
    }
}