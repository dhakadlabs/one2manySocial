import type { BasePost, PublishResult } from '../_interface/PlatformPlugin'
import { getCredentials } from './auth'
import { transform } from './transform'
import { validate } from './validate'
import { HASHNODE_CONFIG } from './config'

const PUBLISH_MUTATION = `
  mutation PublishPost($input: PublishPostInput!) {
    publishPost(input: $input) {
      post {
        id
        url
        slug
        title
      }
    }
  }
`

export async function publish(post: BasePost): Promise<PublishResult> {
    try {
        const validation = validate(post)
        if (!validation.valid) {
            return {
                success: false,
                error: validation.errors.join(', '),
                retryable: false,
            }
        }

        const credentials = await getCredentials()
        if (!credentials) {
            return {
                success: false,
                error: 'Hashnode is not connected. Please connect in Connections.',
                retryable: false,
            }
        }

        const payload = transform(post, credentials.publicationId)

        const response = await fetch(HASHNODE_CONFIG.apiBase, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': credentials.accessToken,
            },
            body: JSON.stringify({
                query: PUBLISH_MUTATION,
                variables: {
                    input: {
                        title: payload.title,
                        contentMarkdown: payload.contentMarkdown,
                        tags: payload.tags,
                        publicationId: payload.publicationId,
                    },
                },
            }),
        })

        if (!response.ok) {
            return {
                success: false,
                error: `Hashnode API error: ${response.status}`,
                retryable: response.status >= 500,
            }
        }

        const data = await response.json()

        if (data.errors) {
            return {
                success: false,
                error: data.errors[0]?.message ?? 'Hashnode GraphQL error',
                retryable: false,
            }
        }

        const publishedPost = data.data?.publishPost?.post
        return {
            success: true,
            platformPostId: publishedPost?.id,
            platformPostUrl: publishedPost?.url,
        }

    } catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Unknown error occurred',
            retryable: true,
        }
    }
}