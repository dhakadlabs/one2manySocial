import { v4 as uuidv4 } from 'uuid'
import type { BasePost, PublishResult } from '../plugins/_interface/PlatformPlugin'
import { getPlugin } from './registry'
import { db } from '../db/client'

export interface PublishJob {
    post: BasePost
    platformIds: string[]
}

export interface PlatformPublishResult {
    platformId: string
    result: PublishResult
}

export interface PublishBatchResult {
    postId: string
    results: Record<string, PublishResult>
    startedAt: number
    completedAt: number
    successCount: number
    failureCount: number
}

export async function publishToAll(job: PublishJob): Promise<PublishBatchResult> {
    const startedAt = Date.now()
    const { post, platformIds } = job

    // Save post to database first
    await db.posts.put({
        id: post.id,
        title: post.title,
        body: post.body,
        tags: post.tags ? JSON.stringify(post.tags) : undefined,
        imagePath: post.imagePath,
        status: 'published',
        createdAt: startedAt,
        updatedAt: startedAt,
    })

    // Create one independent task per platform
    // CRITICAL: Promise.allSettled — never Promise.all
    // One failure must never cancel or affect other platforms
    const tasks = platformIds.map(platformId => {
        const plugin = getPlugin(platformId)

        if (!plugin) {
            return Promise.resolve({
                platformId,
                result: {
                    success: false,
                    error: `No plugin found for platform: ${platformId}`,
                    retryable: false,
                } as PublishResult,
            })
        }

        return plugin
            .publish(post)
            .then(result => ({ platformId, result }))
            .catch(err => ({
                platformId,
                result: {
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown error',
                    retryable: true,
                } as PublishResult,
            }))
    })

    // Wait for ALL tasks regardless of individual success or failure
    const settled = await Promise.allSettled(tasks)

    // Collect results
    const results: Record<string, PublishResult> = {}

    for (const outcome of settled) {
        if (outcome.status === 'fulfilled') {
            results[outcome.value.platformId] = outcome.value.result
        }
    }

    const successCount = Object.values(results).filter(r => r.success).length
    const failureCount = Object.values(results).filter(r => !r.success).length
    const completedAt = Date.now()

    // Save per-platform results to database
    const postPlatformRecords = Object.entries(results).map(([platformId, result]) => ({
        id: uuidv4(),
        postId: post.id,
        platformId,
        accountId: platformId,
        status: (result.success ? 'success' : 'failed') as 'success' | 'failed',
        platformPostId: result.platformPostId,
        platformPostUrl: result.platformPostUrl,
        errorMessage: result.error,
        publishedAt: result.success ? completedAt : undefined,
    }))

    await db.postPlatforms.bulkAdd(postPlatformRecords)

    // Update post status
    const finalStatus = failureCount === 0
        ? 'published'
        : successCount === 0
            ? 'draft'
            : 'partial'

    await db.posts.update(post.id, {
        status: finalStatus,
        updatedAt: completedAt,
    })

    return {
        postId: post.id,
        results,
        startedAt,
        completedAt,
        successCount,
        failureCount,
    }
}