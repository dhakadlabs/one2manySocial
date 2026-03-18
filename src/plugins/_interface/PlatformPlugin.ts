export type AuthType =
    | 'oauth2'
    | 'oauth1'
    | 'api_token'
    | 'graphql_token'
    | 'app_password'
    | 'bot_token'
    | 'webhook'

export interface BasePost {
    id: string
    title?: string
    body: string
    tags?: string[]
    imagePath?: string
}

export interface ValidationResult {
    valid: boolean
    errors: string[]
    warnings: string[]
}

export interface PublishResult {
    success: boolean
    platformPostId?: string
    platformPostUrl?: string
    error?: string
    errorCode?: string
    retryable?: boolean
}

export interface PlatformPlugin {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly authType: AuthType
    readonly color: string
    readonly limits: {
        maxBodyLength?: number
        requiresTitle?: boolean
        requiresImage?: boolean
        supportsMarkdown?: boolean
        supportsTags?: boolean
        maxTags?: number
    }

    connect(credentials?: Record<string, string>): Promise<void>
    disconnect(): Promise<void>
    isConnected(): Promise<boolean>
    refreshToken?(): Promise<void>

    validate(post: BasePost): ValidationResult
    transform(post: BasePost): Record<string, unknown>
    publish(post: BasePost): Promise<PublishResult>

    deletePost?(platformPostId: string): Promise<void>
    getPostUrl?(platformPostId: string): string
}