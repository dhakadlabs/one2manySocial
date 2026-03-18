import Dexie, { type Table } from 'dexie'

export interface PlatformAccount {
    id: string
    platformId: string
    displayName?: string
    platformUserId?: string
    encryptedToken: string
    tokenExpiresAt?: number
    extraConfig?: string
    isActive: number
    connectedAt: number
    lastUsedAt?: number
}

export interface Post {
    id: string
    title?: string
    body: string
    tags?: string
    imagePath?: string
    status: 'draft' | 'published' | 'scheduled' | 'partial'
    createdAt: number
    updatedAt: number
}

export interface PostPlatform {
    id: string
    postId: string
    platformId: string
    accountId: string
    status: 'pending' | 'success' | 'failed' | 'skipped'
    platformPostId?: string
    platformPostUrl?: string
    errorMessage?: string
    publishedAt?: number
}

export interface ScheduledPost {
    id: string
    postId: string
    scheduledFor: number
    platformIds: string
    status: 'waiting' | 'processing' | 'done' | 'failed'
    createdAt: number
}

export interface AppSetting {
    key: string
    value: string
    updatedAt: number
}

class AppDatabase extends Dexie {
    platformAccounts!: Table<PlatformAccount>
    posts!: Table<Post>
    postPlatforms!: Table<PostPlatform>
    scheduledPosts!: Table<ScheduledPost>
    appSettings!: Table<AppSetting>

    constructor() {
        super('one2manySocial')

        this.version(1).stores({
            platformAccounts: 'id, platformId, isActive',
            posts: 'id, status, createdAt',
            postPlatforms: 'id, postId, platformId, status',
            scheduledPosts: 'id, postId, scheduledFor, status',
            appSettings: 'key',
        })
    }
}

export const db = new AppDatabase()