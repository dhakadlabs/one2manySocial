export const TUMBLR_CONFIG = {
    id: 'tumblr',
    name: 'Tumblr',
    description: 'Post to Tumblr via OAuth 1.0',
    color: '#35465c',
    apiBase: 'https://api.tumblr.com/v2',
    requestTokenUrl: 'https://www.tumblr.com/oauth/request_token',
    authorizeUrl: 'https://www.tumblr.com/oauth/authorize',
    accessTokenUrl: 'https://www.tumblr.com/oauth/access_token',
    redirectUri: `${window.location.origin}/oauth/callback`,
}