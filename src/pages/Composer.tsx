import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useComposerStore } from '../store/composerStore'
import { usePlatforms } from '../hooks/usePlatforms'
import { publishToAll } from '../core/publishingEngine'

export default function Composer() {
    const {
        title, body, selectedPlatforms,
        isPublishing, publishResults,
        setTitle, setBody,
        togglePlatform, setPublishing,
        setPublishResults, reset,
    } = useComposerStore()

    const { platforms, loading } = usePlatforms()
    const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)

    const connectedPlatforms = platforms.filter(p => p.connected)
    const charCount = body.length

    const handlePublish = async () => {
        if (!body.trim()) return
        if (selectedPlatforms.length === 0) return
        if (isPublishing) return

        setPublishing(true)
        setPublishResults(null)

        try {
            const result = await publishToAll({
                post: {
                    id: uuidv4(),
                    title: title.trim() || undefined,
                    body: body.trim(),
                },
                platformIds: selectedPlatforms,
            })

            // Convert results to display format
            const displayResults: Record<string, { success: boolean; error?: string; url?: string }> = {}
            for (const [platformId, r] of Object.entries(result.results)) {
                displayResults[platformId] = {
                    success: r.success,
                    error: r.error,
                    url: r.platformPostUrl,
                }
            }

            setPublishResults(displayResults)
        } catch (err) {
            console.error('Publish failed:', err)
        } finally {
            setPublishing(false)
        }
    }

    return (
        <div style={styles.root}>

            {/* LEFT — EDITOR */}
            <div style={styles.editorCol}>

                {/* SECTION LABEL */}
                <div style={styles.sectionLabel}>
                    <span>Publish to</span>
                    <div style={styles.sectionLine} />
                </div>

                {/* PLATFORM SELECTOR */}
                {loading ? (
                    <div style={styles.loadingText}>Loading platforms...</div>
                ) : connectedPlatforms.length === 0 ? (
                    <div style={styles.emptyPlatforms}>
                        No platforms connected yet.{' '}
                        <span
                            style={styles.emptyLink}
                            onClick={() => window.location.href = '/app/connections'}
                        >
                            Go to Connections →
                        </span>
                    </div>
                ) : (
                    <div style={styles.platformGrid}>
                        {connectedPlatforms.map(({ plugin }) => {
                            const selected = selectedPlatforms.includes(plugin.id)
                            const hovered = hoveredPlatform === plugin.id
                            return (
                                <div
                                    key={plugin.id}
                                    style={{
                                        ...styles.platformCard,
                                        ...(selected ? styles.platformCardSelected : {}),
                                        ...(hovered && !selected ? styles.platformCardHover : {}),
                                        borderColor: selected
                                            ? `${plugin.color}60`
                                            : hovered
                                                ? 'rgba(255,255,255,0.14)'
                                                : 'rgba(255,255,255,0.08)',
                                    }}
                                    onClick={() => togglePlatform(plugin.id)}
                                    onMouseEnter={() => setHoveredPlatform(plugin.id)}
                                    onMouseLeave={() => setHoveredPlatform(null)}
                                >
                                    {selected && <div style={styles.checkBadge}>✓</div>}
                                    <div style={{
                                        ...styles.platformIcon,
                                        background: `${plugin.color}18`,
                                        color: plugin.color,
                                    }}>
                                        {plugin.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div style={styles.platformName}>{plugin.name}</div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* SECTION LABEL */}
                <div style={{ ...styles.sectionLabel, marginTop: '8px' }}>
                    <span>Content</span>
                    <div style={styles.sectionLine} />
                </div>

                {/* EDITOR BLOCK */}
                <div style={styles.editorBlock}>

                    {/* TOOLBAR */}
                    <div style={styles.toolbar}>
                        {['B', 'I', 'U'].map(btn => (
                            <button key={btn} style={styles.toolbarBtn}>{btn}</button>
                        ))}
                        <div style={styles.toolbarSep} />
                        {['H1', 'H2'].map(btn => (
                            <button key={btn} style={styles.toolbarBtn}>{btn}</button>
                        ))}
                        <div style={styles.toolbarSep} />
                        <button style={styles.toolbarBtn}>≡</button>
                        <button style={styles.toolbarBtn}>&lt;/&gt;</button>
                        <button style={styles.toolbarBtn}>🔗</button>
                    </div>

                    {/* TITLE INPUT */}
                    <textarea
                        style={styles.titleInput}
                        placeholder="Title (optional — required for blog platforms)"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        rows={1}
                    />

                    {/* BODY INPUT */}
                    <textarea
                        style={styles.bodyInput}
                        placeholder="Write your post here..."
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        rows={8}
                    />

                    {/* EDITOR FOOTER */}
                    <div style={styles.editorFooter}>
                        <button style={styles.toolbarBtn}>😊</button>
                        <button style={styles.toolbarBtn}>🏷</button>
                        <div style={styles.charCount}>
                            {charCount} chars
                        </div>
                    </div>

                </div>

                {/* PUBLISH RESULTS */}
                {publishResults && (
                    <div style={styles.resultsBlock}>
                        <div style={styles.sectionLabel}>
                            <span>Publish Results</span>
                            <div style={styles.sectionLine} />
                        </div>
                        {Object.entries(publishResults).map(([platformId, result]) => (
                            <div key={platformId} style={styles.resultRow}>
                                <div style={{
                                    ...styles.resultDot,
                                    background: result.success
                                        ? 'var(--success)'
                                        : 'var(--error)',
                                    boxShadow: result.success
                                        ? '0 0 6px var(--success)'
                                        : '0 0 6px var(--error)',
                                }} />
                                <div style={styles.resultPlatform}>{platformId}</div>
                                <div style={styles.resultStatus}>
                                    {result.success ? '✓ Published' : `✗ ${result.error}`}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* RIGHT PANEL */}
            <div style={styles.rightPanel}>

                {/* PUBLISH ACTION */}
                <div style={styles.panelSection}>
                    <div style={styles.panelLabel}>Publish</div>

                    <button
                        style={{
                            ...styles.publishBtn,
                            opacity: isPublishing || selectedPlatforms.length === 0 || !body.trim()
                                ? 0.5
                                : 1,
                            cursor: isPublishing || selectedPlatforms.length === 0 || !body.trim()
                                ? 'not-allowed'
                                : 'pointer',
                        }}
                        onClick={handlePublish}
                        disabled={isPublishing || selectedPlatforms.length === 0 || !body.trim()}
                    >
                        {isPublishing ? (
                            'Publishing...'
                        ) : (
                            <>
                                Publish to{' '}
                                <span style={styles.platformCount}>
                                    {selectedPlatforms.length}
                                </span>
                            </>
                        )}
                    </button>

                    {selectedPlatforms.length === 0 && (
                        <div style={styles.hintText}>
                            Select at least one platform above
                        </div>
                    )}

                    {!body.trim() && selectedPlatforms.length > 0 && (
                        <div style={styles.hintText}>
                            Write something to publish
                        </div>
                    )}
                </div>

                {/* SELECTED PLATFORMS STATUS */}
                {selectedPlatforms.length > 0 && (
                    <div style={styles.panelSection}>
                        <div style={styles.panelLabel}>Selected</div>
                        <div style={styles.statusCard}>
                            {selectedPlatforms.map(platformId => {
                                const platform = platforms.find(p => p.plugin.id === platformId)
                                if (!platform) return null
                                const result = publishResults?.[platformId]
                                return (
                                    <div key={platformId} style={styles.statusRow}>
                                        <div style={{
                                            ...styles.statusDot,
                                            background: result
                                                ? result.success ? 'var(--success)' : 'var(--error)'
                                                : 'var(--accent)',
                                            boxShadow: result
                                                ? result.success
                                                    ? '0 0 6px var(--success)'
                                                    : '0 0 6px var(--error)'
                                                : '0 0 6px var(--accent)',
                                        }} />
                                        <div style={styles.statusName}>
                                            {platform.plugin.name}
                                        </div>
                                        <div style={{
                                            ...styles.statusVal,
                                            color: result
                                                ? result.success ? 'var(--success)' : 'var(--error)'
                                                : 'var(--accent)',
                                        }}>
                                            {result
                                                ? result.success ? 'done' : 'failed'
                                                : 'ready'}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* RESET */}
                {publishResults && (
                    <div style={styles.panelSection}>
                        <button
                            style={styles.resetBtn}
                            onClick={reset}
                        >
                            ↺ New Post
                        </button>
                    </div>
                )}

            </div>
        </div>
    )
}

const styles: Record<string, React.CSSProperties> = {
    root: {
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
    },

    /* EDITOR COL */
    editorCol: {
        flex: 1,
        padding: '28px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderRight: '1px solid var(--border-subtle)',
    },

    sectionLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
    },
    sectionLine: {
        flex: 1,
        height: '1px',
        background: 'var(--border-subtle)',
    },

    loadingText: {
        color: 'var(--text-muted)',
        fontSize: '13px',
        fontFamily: "'DM Mono', monospace",
    },

    emptyPlatforms: {
        color: 'var(--text-muted)',
        fontSize: '13px',
        padding: '16px',
        background: 'var(--glass-1)',
        borderRadius: '10px',
        border: '1px solid var(--border-subtle)',
    },
    emptyLink: {
        color: 'var(--accent)',
        cursor: 'pointer',
    },

    /* PLATFORM GRID */
    platformGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '8px',
    },
    platformCard: {
        background: 'var(--glass-1)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '12px 8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        position: 'relative',
    },
    platformCardSelected: {
        background: 'rgba(139,120,255,0.08)',
    },
    platformCardHover: {
        background: 'var(--glass-2)',
        transform: 'translateY(-2px)',
    },
    checkBadge: {
        position: 'absolute',
        top: '6px',
        right: '6px',
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        background: 'var(--accent)',
        color: 'white',
        fontSize: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
    },
    platformIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Syne', sans-serif",
        fontSize: '11px',
        fontWeight: 800,
    },
    platformName: {
        fontSize: '10px',
        color: 'var(--text-muted)',
        fontWeight: 400,
        textAlign: 'center',
    },

    /* EDITOR */
    editorBlock: {
        background: 'var(--glass-2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid var(--border-default)',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        padding: '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(255,255,255,0.015)',
    },
    toolbarBtn: {
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '11px',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        border: 'none',
        background: 'transparent',
        fontFamily: "'DM Mono', monospace",
        fontWeight: 500,
        transition: 'all 0.1s ease',
    },
    toolbarSep: {
        width: '1px',
        height: '16px',
        background: 'var(--border-subtle)',
        margin: '0 4px',
    },
    titleInput: {
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--text-primary)',
        fontFamily: "'Syne', sans-serif",
        fontSize: '20px',
        fontWeight: 700,
        padding: '16px 18px 8px',
        resize: 'none',
    },
    bodyInput: {
        width: '100%',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--text-primary)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '14.5px',
        fontWeight: 300,
        lineHeight: 1.8,
        padding: '8px 18px 16px',
        resize: 'none',
        minHeight: '160px',
    },
    editorFooter: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(255,255,255,0.01)',
    },
    charCount: {
        marginLeft: 'auto',
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        color: 'var(--text-muted)',
    },

    /* RESULTS */
    resultsBlock: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    resultRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
    },
    resultDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    resultPlatform: {
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        width: '80px',
        flexShrink: 0,
        textTransform: 'capitalize',
    },
    resultStatus: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '11px',
        color: 'var(--text-secondary)',
        flex: 1,
    },

    /* RIGHT PANEL */
    rightPanel: {
        width: '280px',
        minWidth: '280px',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        overflowY: 'auto',
        background: 'rgba(8,8,20,0.5)',
    },
    panelSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    panelLabel: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '9px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
    },
    publishBtn: {
        width: '100%',
        padding: '14px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #8b78ff 0%, #7060ee 100%)',
        color: 'white',
        fontFamily: "'Syne', sans-serif',",
        fontSize: '14px',
        fontWeight: 700,
        border: '1px solid rgba(255,255,255,0.15)',
        cursor: 'pointer',
        boxShadow: '0 4px 24px rgba(139,120,255,0.35)',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
    },
    platformCount: {
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '5px',
        padding: '1px 8px',
        fontSize: '12px',
    },
    hintText: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
        color: 'var(--text-muted)',
        textAlign: 'center',
    },
    statusCard: {
        background: 'var(--glass-1)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '4px 0',
    },
    statusRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 14px',
    },
    statusDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    statusName: {
        flex: 1,
        fontSize: '12.5px',
        color: 'var(--text-secondary)',
        fontFamily: "'DM Sans', sans-serif",
    },
    statusVal: {
        fontFamily: "'DM Mono', monospace",
        fontSize: '10px',
    },
    resetBtn: {
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        background: 'transparent',
        color: 'var(--text-muted)',
        border: '1px solid var(--border-subtle)',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
    },
}