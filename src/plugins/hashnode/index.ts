import type {
    PlatformPlugin,
    BasePost,
    ValidationResult,
    PublishResult,
} from '../_interface/PlatformPlugin'
import { HASHNODE_CONFIG } from './config'
import { connect, disconnect, isConnected } from './auth'
import { publish as publishPost } from './publish'
import { validate } from './validate'
import { transform } from './transform'

export class HashnodePlugin implements PlatformPlugin {
    readonly id = HASHNODE_CONFIG.id
    readonly name = HASHNODE_CONFIG.name
    readonly description = HASHNODE_CONFIG.description
    readonly authType = 'graphql_token' as const
    readonly color = HASHNODE_CONFIG.color
    readonly limits = {
        maxBodyLength: undefined,
        requiresTitle: true,
        requiresImage: false,
        supportsMarkdown: true,
        supportsTags: true,
        maxTags: HASHNODE_CONFIG.maxTags,
    }

    async connect(credentials?: Record<string, string>): Promise<void> {
        if (!credentials) throw new Error('Access token and publication ID are required')
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
        return transform(post, '') as unknown as Record<string, unknown>
    }

    async publish(post: BasePost): Promise<PublishResult> {
        return publishPost(post)
    }

    getPostUrl(platformPostId: string): string {
        return `https://hashnode.com/post/${platformPostId}`
    }
}