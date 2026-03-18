export const MASTODON_CONFIG = {
    id: 'mastodon',
    name: 'Mastodon',
    description: 'Post to Mastodon via OAuth 2.0',
    color: '#6364ff',
    maxPostLength: 500,
    scopes: 'read write',
    redirectUri: `${window.location.origin}/oauth/callback`,
}