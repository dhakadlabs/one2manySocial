import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { handleCallback as handleMastodonCallback } from '../plugins/mastodon/auth'

export default function OAuthCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
    const [message, setMessage] = useState('Completing connection...')

    useEffect(() => {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
            setStatus('error')
            setMessage('Authorization was denied. Please try again.')
            setTimeout(() => navigate('/app/connections'), 3000)
            return
        }

        // Mastodon OAuth 2.0 callback
        if (code) {
            const pending = sessionStorage.getItem('mastodon_oauth_pending')
            if (pending) {
                handleMastodonCallback(code)
                    .then(() => {
                        setStatus('success')
                        setMessage('Mastodon connected successfully!')
                        setTimeout(() => navigate('/app/connections'), 2000)
                    })
                    .catch(err => {
                        setStatus('error')
                        setMessage(err.message ?? 'Connection failed. Please try again.')
                        setTimeout(() => navigate('/app/connections'), 3000)
                    })
                return
            }
        }

        setStatus('error')
        setMessage('Unknown OAuth flow. Please try again.')
        setTimeout(() => navigate('/app/connections'), 3000)
    }, [])

    return (
        <div style={styles.root}>
            <div style={styles.card}>
                <div style={{
                    ...styles.icon,
                    color: status === 'success'
                        ? 'var(--success)'
                        : status === 'error'
                            ? 'var(--error)'
                            : 'var(--accent)',
                }}>
                    {status === 'processing' ? '◌' : status === 'success' ? '✓' : '✗'}
                </div>
                <div style={styles.title}>
                    {status === 'processing'
                        ? 'Connecting...'
                        : status === 'success'
                            ? 'Connected!'
                            : 'Failed'}
                </div>
                <div style={styles.message}>{message}</div>
                {status !== 'processing' && (
                    <div style={styles.redirect}>Redirecting to Connections...</div>
                )}
            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    root: {
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
    },
    card: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '20px',
        padding: '48px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: 'var(--shadow-glass)',
    },
    icon: {
        fontSize: '48px',
        fontFamily: "'Syne', sans-serif",
    },
    title: {
        fontFamily: "'Syne', sans-serif",
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
    },
    message: {
        fontSize: '14px',
        color: 'var(--text-secondary)',
        textAlign: 'center',
        lineHeight: 1.6,
        fontFamily: "'DM Sans', sans-serif",
    },
    redirect: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        color: 'var(--text-muted)',
        marginTop: '8px',
    },
}