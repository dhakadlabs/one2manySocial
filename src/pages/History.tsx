import { useState, useEffect } from 'react'
import { db } from '../db/client'
import type { Post, PostPlatform } from '../db/client'
import { getAllPlugins } from '../core/registry'

interface PostWithResults extends Post {
  platforms: PostPlatform[]
}

export default function History() {
  const [posts, setPosts] = useState<PostWithResults[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const allPosts = await db.posts
        .orderBy('createdAt')
        .reverse()
        .toArray()

      const postsWithResults = await Promise.all(
        allPosts.map(async post => {
          const platforms = await db.postPlatforms
            .where('postId')
            .equals(post.id)
            .toArray()
          return { ...post, platforms }
        })
      )

      setPosts(postsWithResults)
    } catch (err) {
      console.error('Failed to load history:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPlugin = (platformId: string) => {
    return getAllPlugins().find(p => p.id === platformId)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'var(--success)'
      case 'partial': return 'var(--warning)'
      case 'draft': return 'var(--error)'
      default: return 'var(--text-muted)'
    }
  }

  const getStatusLabel = (post: PostWithResults) => {
    const success = post.platforms.filter(p => p.status === 'success').length
    const total = post.platforms.length
    if (total === 0) return 'No platforms'
    if (success === total) return `${success}/${total} published`
    if (success === 0) return 'All failed'
    return `${success}/${total} succeeded`
  }

  if (loading) {
    return (
      <div style={styles.root}>
        <div style={styles.loadingText}>Loading history...</div>
      </div>
    )
  }

  return (
    <div style={styles.root}>

      <div style={styles.header}>
        <h1 style={styles.title}>History</h1>
        <p style={styles.subtitle}>
          All your past published posts and their results per platform.
        </p>
      </div>

      {posts.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>◎</div>
          <div style={styles.emptyTitle}>No posts yet</div>
          <div style={styles.emptyDesc}>
            Your published posts will appear here. Go to the Composer to write your first post.
          </div>
        </div>
      )}

      <div style={styles.list}>
        {posts.map(post => {
          const isExpanded = expandedId === post.id
          const successCount = post.platforms.filter(p => p.status === 'success').length
          const failCount = post.platforms.filter(p => p.status === 'failed').length

          return (
            <div key={post.id} style={styles.card}>

              <div
                style={styles.cardHeader}
                onClick={() => setExpandedId(isExpanded ? null : post.id)}
              >
                <div style={styles.cardLeft}>
                  <div style={{
                    ...styles.statusIndicator,
                    background: getStatusColor(post.status),
                    boxShadow: `0 0 8px ${getStatusColor(post.status)}`,
                  }} />

                  <div style={styles.cardInfo}>
                    <div style={styles.cardTitle}>
                      {post.title
                        ? post.title
                        : post.body.slice(0, 80) + (post.body.length > 80 ? '...' : '')
                      }
                    </div>

                    <div style={styles.cardMeta}>
                      <span style={styles.cardTime}>
                        {formatDate(post.createdAt)}
                      </span>
                      <span style={styles.cardDot}>·</span>
                      <span style={{
                        color: getStatusColor(post.status),
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '11px',
                      }}>
                        {getStatusLabel(post)}
                      </span>
                    </div>

                    <div style={styles.platformDots}>
                      {post.platforms.map(pp => {
                        const plugin = getPlugin(pp.platformId)
                        return (
                          <div
                            key={pp.id}
                            title={`${pp.platformId}: ${pp.status}`}
                            style={{
                              ...styles.dot,
                              background: pp.status === 'success'
                                ? plugin?.color ?? 'var(--success)'
                                : 'var(--error)',
                              boxShadow: pp.status === 'success'
                                ? `0 0 4px ${plugin?.color ?? 'var(--success)'}80`
                                : '0 0 4px var(--error)',
                              opacity: pp.status === 'success' ? 1 : 0.7,
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div style={styles.cardRight}>
                  {successCount > 0 && (
                    <div style={styles.countBadge}>
                      <span style={{ color: 'var(--success)' }}>✓ {successCount}</span>
                    </div>
                  )}
                  {failCount > 0 && (
                    <div style={styles.countBadge}>
                      <span style={{ color: 'var(--error)' }}>✗ {failCount}</span>
                    </div>
                  )}
                  <div style={{
                    ...styles.expandIcon,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▾
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div style={styles.expandedSection}>
                  <div style={styles.expandedDivider} />

                  <div style={styles.contentPreview}>
                    {post.title && (
                      <div style={styles.previewTitle}>{post.title}</div>
                    )}
                    <div style={styles.previewBody}>{post.body}</div>
                  </div>

                  {post.platforms.length > 0 && (
                    <div style={styles.platformResults}>
                      <div style={styles.resultsLabel}>Platform Results</div>
                      {post.platforms.map(pp => {
                        const plugin = getPlugin(pp.platformId)
                        return (
                          <div key={pp.id} style={styles.resultRow}>
                            <div style={{
                              ...styles.resultDot,
                              background: pp.status === 'success'
                                ? plugin?.color ?? 'var(--success)'
                                : 'var(--error)',
                            }} />
                            <div style={{
                              ...styles.resultPlatform,
                              color: plugin?.color ?? 'var(--text-primary)',
                            }}>
                              {plugin?.name ?? pp.platformId}
                            </div>
                            <div style={styles.resultStatus}>
                              {pp.status === 'success' ? (
                                <span style={{ color: 'var(--success)' }}>
                                  {'✓ Published'}
                                  {pp.platformPostUrl && (
                                    
                                      <a href={pp.platformPostUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={styles.viewLink}
                                    >
                                      View
                                    </a>
                                  )}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--error)' }}>
                                  {'✗ '}{pp.errorMessage ?? 'Failed'}
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          )
        })}
      </div>

    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    padding: '32px',
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  loadingText: {
    color: 'var(--text-muted)',
    fontFamily: "'DM Mono', monospace",
    fontSize: '13px',
    padding: '32px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  title: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '24px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 300,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '64px 32px',
    background: 'var(--glass-1)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '16px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '40px',
    color: 'var(--text-muted)',
    fontFamily: "'Syne', sans-serif",
  },
  emptyTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '18px',
    fontWeight: 700,
    color: 'var(--text-secondary)',
  },
  emptyDesc: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    fontWeight: 300,
    maxWidth: '400px',
    lineHeight: 1.6,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  card: {
    background: 'var(--glass-2)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-default)',
    borderRadius: '14px',
    overflow: 'hidden',
    transition: 'border-color 0.15s ease',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    cursor: 'pointer',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    flex: 1,
    minWidth: 0,
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '6px',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
  },
  cardTime: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  cardDot: {
    color: 'var(--text-muted)',
  },
  platformDots: {
    display: 'flex',
    gap: '4px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  cardRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
    marginLeft: '16px',
  },
  countBadge: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'var(--glass-2)',
    border: '1px solid var(--border-subtle)',
  },
  expandIcon: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    transition: 'transform 0.2s ease',
  },
  expandedSection: {
    padding: '0 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  expandedDivider: {
    height: '1px',
    background: 'var(--border-subtle)',
    marginBottom: '4px',
  },
  contentPreview: {
    background: 'var(--glass-1)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  previewTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text-primary)',
  },
  previewBody: {
    fontSize: '13px',
    fontWeight: 300,
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  platformResults: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  resultsLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  resultRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    background: 'var(--glass-1)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
  },
  resultDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  resultPlatform: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    fontWeight: 500,
    width: '90px',
    flexShrink: 0,
    textTransform: 'capitalize',
  },
  resultStatus: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '12px',
    color: 'var(--text-secondary)',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  viewLink: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    marginLeft: '8px',
  },
}