export const TUMBLR_CONFIG = {
    id: 'tumblr',
    name: 'Tumblr',
    description: 'Post to Tumblr via OAuth 1.0',
    color: '#35465c',
    apiBase: '/tumblr-api-proxy/v2',
    requestTokenUrl: '/tumblr-proxy/oauth/request_token',
    authorizeUrl: 'https://www.tumblr.com/oauth/authorize',
    accessTokenUrl: '/tumblr-proxy/oauth/access_token',
    redirectUri: `${window.location.origin}/oauth/callback`,
}