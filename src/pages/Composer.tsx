import { useState, useRef, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useComposerStore } from '../store/composerStore'
import { usePlatforms } from '../hooks/usePlatforms'
import { publishToAll } from '../core/publishingEngine'
import { db } from '../db/client'
import PlatformIcon from '../components/shared/PlatformIcon'

// Platform character limits for warnings
const PLATFORM_LIMITS: Record<string, {
  maxBody?: number
  requiresTitle?: boolean
  requiresImage?: boolean
  maxTags?: number
}> = {
  discord: { maxBody: 2000 },
  telegram: { maxBody: 4096 },
  bluesky: { maxBody: 300 },
  mastodon: { maxBody: 500 },
  devto: { requiresTitle: true, maxTags: 4 },
  hashnode: { requiresTitle: true, maxTags: 5 },
}

export default function Composer() {
  const {
    title, body, tags, tagInput,
    imageFile, imagePreviewUrl,
    selectedPlatforms, isPublishing, publishResults,
    setTitle, setBody, setTagInput, addTag, removeTag,
    setImage, clearImage,
    togglePlatform, setPublishing,
    setPublishResults, setLastSaved, reset,
  } = useComposerStore()

  const { platforms, loading } = usePlatforms()
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [previewPlatform, setPreviewPlatform] = useState<string | null>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const connectedPlatforms = platforms.filter(p => p.connected)
  const charCount = body.length

  // Auto-save draft every 2 seconds after typing stops
  const triggerAutoSave = useCallback(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(async () => {
      if (!body.trim() && !title.trim()) return
      try {
        const draftId = 'draft_current'
        await db.appSettings.put({
          key: draftId,
          value: JSON.stringify({ title, body, tags, selectedPlatforms }),
          updatedAt: Date.now(),
        })
        setLastSaved(Date.now())
      } catch (err) {
        console.error('Auto-save failed:', err)
      }
    }, 2000)
  }, [title, body, tags, selectedPlatforms])

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await db.appSettings.get('draft_current')
        if (draft) {
          const data = JSON.parse(draft.value)
          if (data.title) setTitle(data.title)
          if (data.body) setBody(data.body)
        }
      } catch { }
    }
    loadDraft()
  }, [])

  useEffect(() => {
    triggerAutoSave()
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    }
  }, [title, body, tags, triggerAutoSave])

  // Set first selected platform as preview default
  useEffect(() => {
    if (selectedPlatforms.length > 0 && !previewPlatform) {
      setPreviewPlatform(selectedPlatforms[0])
    }
    if (selectedPlatforms.length === 0) setPreviewPlatform(null)
  }, [selectedPlatforms])

  // Toolbar actions
  const wrapSelection = (before: string, after: string = before) => {
    const ta = bodyRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = body.slice(start, end)
    const newBody = body.slice(0, start) + before + selected + after + body.slice(end)
    setBody(newBody)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const insertAtCursor = (text: string) => {
    const ta = bodyRef.current
    if (!ta) return
    const start = ta.selectionStart
    const newBody = body.slice(0, start) + text + body.slice(start)
    setBody(newBody)
    setTimeout(() => {
      ta.focus()
      ta.setSelectionRange(start + text.length, start + text.length)
    }, 0)
  }

  const insertHeading = (level: number) => {
    const ta = bodyRef.current
    if (!ta) return
    const start = ta.selectionStart
    const lineStart = body.lastIndexOf('\n', start - 1) + 1
    const prefix = '#'.repeat(level) + ' '
    const newBody = body.slice(0, lineStart) + prefix + body.slice(lineStart)
    setBody(newBody)
    setTimeout(() => ta.focus(), 0)
  }

  const handleLink = () => {
    const ta = bodyRef.current
    if (!ta) return
    const selected = body.slice(ta.selectionStart, ta.selectionEnd)
    setLinkText(selected || '')
    setLinkUrl('')
    setShowLinkDialog(true)
  }

  const insertLink = () => {
    if (!linkUrl) return
    const text = linkText || linkUrl
    insertAtCursor(`[${text}](${linkUrl})`)
    setShowLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }

  // Image upload
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImage(file, url)
  }

  // Tag input handling
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
    if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  // Platform warnings
  const getPlatformWarnings = (platformId: string): string[] => {
    const limits = PLATFORM_LIMITS[platformId]
    if (!limits) return []
    const warnings: string[] = []
    if (limits.requiresTitle && !title.trim()) {
      warnings.push('Title required')
    }
    if (limits.requiresImage && !imageFile) {
      warnings.push('Image required')
    }
    if (limits.maxBody && body.length > limits.maxBody) {
      warnings.push(`Over ${limits.maxBody} char limit`)
    }
    if (limits.maxTags && tags.length > limits.maxTags) {
      warnings.push(`Max ${limits.maxTags} tags`)
    }
    return warnings
  }

  // Platform preview content
  const getPreviewContent = (platformId: string) => {
    const limits = PLATFORM_LIMITS[platformId]
    let previewBody = body
    if (limits?.maxBody && body.length > limits.maxBody) {
      previewBody = body.slice(0, limits.maxBody - 3) + '...'
    }
    const hashtags = tags.length > 0
      ? '\n\n' + tags.map(t => `#${t}`).join(' ')
      : ''
    switch (platformId) {
      case 'bluesky':
      case 'mastodon':
        return previewBody + hashtags
      case 'discord':
        return title ? `**${title}**\n\n${previewBody}` : previewBody
      case 'telegram':
        return title ? `*${title}*\n\n${previewBody}` : previewBody
      case 'devto':
      case 'hashnode':
        return `# ${title || 'Untitled'}\n\n${previewBody}`
      default:
        return previewBody
    }
  }

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
          tags: tags.length > 0 ? tags : undefined,
          imagePath: imageFile?.name,
        },
        platformIds: selectedPlatforms,
      })

      const displayResults: Record<string, {
        success: boolean
        error?: string
        url?: string
      }> = {}

      for (const [platformId, r] of Object.entries(result.results)) {
        displayResults[platformId] = {
          success: r.success,
          error: r.error,
          url: r.platformPostUrl,
        }
      }

      setPublishResults(displayResults)

      // Clear draft after successful publish
      await db.appSettings.delete('draft_current')
    } catch (err) {
      console.error('Publish failed:', err)
    } finally {
      setPublishing(false)
    }
  }

  const allWarnings = selectedPlatforms.reduce((acc, platformId) => {
    const warnings = getPlatformWarnings(platformId)
    if (warnings.length > 0) acc[platformId] = warnings
    return acc
  }, {} as Record<string, string[]>)

  const hasBlockingWarnings = selectedPlatforms.some(platformId => {
    const limits = PLATFORM_LIMITS[platformId]
    if (!limits) return false
    if (limits.requiresTitle && !title.trim()) return true
    if (limits.requiresImage && !imageFile) return true
    return false
  })

  return (
    <div style={styles.root}>

      {/* LEFT — EDITOR */}
      <div style={styles.editorCol}>

        {/* PLATFORM SELECTOR */}
        <div style={styles.sectionLabel}>
          <span>Publish to</span>
          <div style={styles.sectionLine} />
        </div>

        {loading ? (
          <div style={styles.loadingText}>Loading platforms...</div>
        ) : connectedPlatforms.length === 0 ? (
          <div style={styles.emptyPlatforms}>
            No platforms connected yet.{' '}
            <span
              style={styles.emptyLink}
              onClick={() => window.location.href = '/app/connections'}
            >
              Go to Connections
            </span>
          </div>
        ) : (
          <div style={styles.platformGrid}>
            {connectedPlatforms.map(({ plugin }) => {
              const selected = selectedPlatforms.includes(plugin.id)
              const hovered = hoveredPlatform === plugin.id
              const warnings = getPlatformWarnings(plugin.id)
              const hasWarning = warnings.length > 0
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
                  {selected && hasWarning && (
                    <div style={styles.warningBadge} title={warnings.join(', ')}>!</div>
                  )}
                  <div style={{
                    ...styles.platformIcon,
                    background: `${plugin.color}18`,
                  }}>
                    <PlatformIcon platformId={plugin.id} size={18} color={plugin.color} />
                  </div>
                  <div style={styles.platformName}>{plugin.name}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* WRITE / PREVIEW TABS */}
        <div style={styles.tabRow}>
          <div style={styles.tabs}>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'write' ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab('write')}
            >
              Write
            </button>
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'preview' ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </button>
          </div>
          {activeTab === 'preview' && selectedPlatforms.length > 0 && (
            <div style={styles.previewPlatformPicker}>
              {selectedPlatforms.map(platformId => {
                const p = platforms.find(p => p.plugin.id === platformId)
                if (!p) return null
                return (
                  <button
                    key={platformId}
                    style={{
                      ...styles.previewPlatformBtn,
                      borderColor: previewPlatform === platformId
                        ? `${p.plugin.color}60`
                        : 'var(--border-subtle)',
                      color: previewPlatform === platformId
                        ? p.plugin.color
                        : 'var(--text-muted)',
                      background: previewPlatform === platformId
                        ? `${p.plugin.color}12`
                        : 'transparent',
                    }}
                    onClick={() => setPreviewPlatform(platformId)}
                  >
                    {p.plugin.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* EDITOR BLOCK */}
        {activeTab === 'write' ? (
          <div style={styles.editorBlock}>

            {/* TOOLBAR */}
            <div style={styles.toolbar}>
              <button
                style={styles.toolbarBtn}
                title="Bold"
                onClick={() => wrapSelection('**')}
              >
                <strong>B</strong>
              </button>
              <button
                style={styles.toolbarBtn}
                title="Italic"
                onClick={() => wrapSelection('_')}
              >
                <em>I</em>
              </button>
              <button
                style={styles.toolbarBtn}
                title="Strikethrough"
                onClick={() => wrapSelection('~~')}
              >
                <span style={{ textDecoration: 'line-through' }}>S</span>
              </button>
              <div style={styles.toolbarSep} />
              <button
                style={styles.toolbarBtn}
                title="Heading 1"
                onClick={() => insertHeading(1)}
              >
                H1
              </button>
              <button
                style={styles.toolbarBtn}
                title="Heading 2"
                onClick={() => insertHeading(2)}
              >
                H2
              </button>
              <div style={styles.toolbarSep} />
              <button
                style={styles.toolbarBtn}
                title="Bullet list"
                onClick={() => insertAtCursor('\n- ')}
              >
                ≡
              </button>
              <button
                style={styles.toolbarBtn}
                title="Code block"
                onClick={() => wrapSelection('`')}
              >
                {'</>'}
              </button>
              <button
                style={styles.toolbarBtn}
                title="Insert link"
                onClick={handleLink}
              >
                🔗
              </button>
              <div style={styles.toolbarSep} />
              <button
                style={styles.toolbarBtn}
                title="Attach image"
                onClick={() => fileInputRef.current?.click()}
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageSelect}
              />
            </div>

            {/* TITLE */}
            <textarea
              style={styles.titleInput}
              placeholder="Title (optional — required for Dev.to, Hashnode)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              rows={1}
            />

            {/* BODY */}
            <textarea
              ref={bodyRef}
              style={styles.bodyInput}
              placeholder="Write your post here... (Markdown supported)"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={10}
            />

            {/* IMAGE PREVIEW */}
            {imagePreviewUrl && (
              <div style={styles.imagePreview}>
                <img
                  src={imagePreviewUrl}
                  alt="Attached"
                  style={styles.imagePreviewImg}
                />
                <button
                  style={styles.imageRemoveBtn}
                  onClick={clearImage}
                  title="Remove image"
                >
                  ✕
                </button>
                <div style={styles.imageFileName}>
                  {imageFile?.name}
                </div>
              </div>
            )}

            {/* TAGS INPUT */}
            <div style={styles.tagsSection}>
              <div style={styles.tagsRow}>
                {tags.map(tag => (
                  <div key={tag} style={styles.tag}>
                    #{tag}
                    <button
                      style={styles.tagRemove}
                      onClick={() => removeTag(tag)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <input
                  style={styles.tagInput}
                  placeholder={tags.length === 0 ? 'Add tags...' : ''}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
              </div>
              <div style={styles.tagHint}>
                Press Enter or comma to add · max 5 tags
              </div>
            </div>

            {/* EDITOR FOOTER */}
            <div style={styles.editorFooter}>
              <div style={styles.charCount}>
                {charCount} chars
              </div>
              {selectedPlatforms.map(platformId => {
                const limit = PLATFORM_LIMITS[platformId]?.maxBody
                if (!limit) return null
                const over = charCount > limit
                return (
                  <div
                    key={platformId}
                    style={{
                      ...styles.platformCharCount,
                      color: over ? 'var(--error)' : 'var(--text-muted)',
                    }}
                  >
                    {platformId}: {charCount}/{limit}
                    {over && ' ⚠'}
                  </div>
                )
              })}
            </div>

          </div>
        ) : (

          /* PREVIEW TAB */
          <div style={styles.previewBlock}>
            {!previewPlatform ? (
              <div style={styles.previewEmpty}>
                Select platforms above to preview how your post will look
              </div>
            ) : (
              <div style={styles.previewContent}>
                <div style={styles.previewPlatformLabel}>
                  Preview for{' '}
                  <span style={{
                    color: platforms.find(p => p.plugin.id === previewPlatform)?.plugin.color,
                  }}>
                    {platforms.find(p => p.plugin.id === previewPlatform)?.plugin.name}
                  </span>
                </div>

                {imagePreviewUrl && (
                  <img
                    src={imagePreviewUrl}
                    alt="Attached"
                    style={styles.previewImage}
                  />
                )}

                <div style={styles.previewText}>
                  {getPreviewContent(previewPlatform) || (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Nothing to preview yet — write something first
                    </span>
                  )}
                </div>

                {tags.length > 0 && (
                  <div style={styles.previewTags}>
                    {tags.map(tag => (
                      <span key={tag} style={styles.previewTag}>#{tag}</span>
                    ))}
                  </div>
                )}

                {/* WARNINGS */}
                {getPlatformWarnings(previewPlatform).length > 0 && (
                  <div style={styles.warningsBlock}>
                    {getPlatformWarnings(previewPlatform).map((w, i) => (
                      <div key={i} style={styles.warningItem}>
                        ⚠ {w}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* LINK DIALOG */}
        {showLinkDialog && (
          <div style={styles.linkDialogOverlay}>
            <div style={styles.linkDialog}>
              <div style={styles.linkDialogTitle}>Insert Link</div>
              <input
                style={styles.linkInput}
                placeholder="Link text"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
                autoFocus
              />
              <input
                style={styles.linkInput}
                placeholder="https://..."
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && insertLink()}
              />
              <div style={styles.linkDialogBtns}>
                <button style={styles.btnPrimary} onClick={insertLink}>
                  Insert
                </button>
                <button
                  style={styles.btnGhost}
                  onClick={() => setShowLinkDialog(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PUBLISH RESULTS */}
        {publishResults && (
          <div style={styles.resultsBlock}>
            <div style={styles.sectionLabel}>
              <span>Results</span>
              <div style={styles.sectionLine} />
            </div>
            {Object.entries(publishResults).map(([platformId, result]) => (
              <div key={platformId} style={styles.resultRow}>
                <div style={{
                  ...styles.resultDot,
                  background: result.success ? 'var(--success)' : 'var(--error)',
                  boxShadow: result.success
                    ? '0 0 6px var(--success)'
                    : '0 0 6px var(--error)',
                }} />
                <div style={styles.resultPlatform}>{platformId}</div>
                <div style={styles.resultStatus}>
                  {result.success
                    ? '✓ Published'
                    : `✗ ${result.error}`
                  }
                </div>
                {result.success && result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.viewLink}
                  >
                    View
                  </a>
                )}
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
              opacity: isPublishing ||
                selectedPlatforms.length === 0 ||
                !body.trim() ||
                hasBlockingWarnings
                ? 0.5 : 1,
              cursor: isPublishing ||
                selectedPlatforms.length === 0 ||
                !body.trim() ||
                hasBlockingWarnings
                ? 'not-allowed' : 'pointer',
            }}
            onClick={handlePublish}
            disabled={
              isPublishing ||
              selectedPlatforms.length === 0 ||
              !body.trim() ||
              hasBlockingWarnings
            }
          >
            {isPublishing ? 'Publishing...' : (
              <>
                Publish to{' '}
                <span style={styles.platformCount}>
                  {selectedPlatforms.length}
                </span>
              </>
            )}
          </button>

          {selectedPlatforms.length === 0 && (
            <div style={styles.hintText}>Select at least one platform</div>
          )}
          {hasBlockingWarnings && selectedPlatforms.length > 0 && (
            <div style={{ ...styles.hintText, color: 'var(--warning)' }}>
              Fix warnings before publishing
            </div>
          )}
        </div>

        {/* WARNINGS */}
        {Object.keys(allWarnings).length > 0 && (
          <div style={styles.panelSection}>
            <div style={styles.panelLabel}>Warnings</div>
            <div style={styles.warningsCard}>
              {Object.entries(allWarnings).map(([platformId, warnings]) => (
                <div key={platformId} style={styles.warnRow}>
                  <div style={styles.warnPlatform}>{platformId}</div>
                  <div style={styles.warnMessages}>
                    {warnings.map((w, i) => (
                      <div key={i} style={styles.warnMsg}>⚠ {w}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLATFORM STATUS */}
        {selectedPlatforms.length > 0 && (
          <div style={styles.panelSection}>
            <div style={styles.panelLabel}>Selected</div>
            <div style={styles.statusCard}>
              {selectedPlatforms.map(platformId => {
                const platform = platforms.find(p => p.plugin.id === platformId)
                if (!platform) return null
                const result = publishResults?.[platformId]
                const warnings = getPlatformWarnings(platformId)
                return (
                  <div key={platformId} style={styles.statusRow}>
                    <div style={{
                      ...styles.statusDot,
                      background: result
                        ? result.success ? 'var(--success)' : 'var(--error)'
                        : warnings.length > 0 ? 'var(--warning)' : 'var(--accent)',
                      boxShadow: result
                        ? result.success
                          ? '0 0 6px var(--success)'
                          : '0 0 6px var(--error)'
                        : warnings.length > 0
                          ? '0 0 6px var(--warning)'
                          : '0 0 6px var(--accent)',
                    }} />
                    <div style={styles.statusName}>
                      {platform.plugin.name}
                    </div>
                    <div style={{
                      ...styles.statusVal,
                      color: result
                        ? result.success ? 'var(--success)' : 'var(--error)'
                        : warnings.length > 0 ? 'var(--warning)' : 'var(--accent)',
                    }}>
                      {result
                        ? result.success ? 'done' : 'failed'
                        : warnings.length > 0 ? 'warning' : 'ready'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* AUTO-SAVE STATUS */}
        <div style={styles.panelSection}>
          <div style={styles.autoSaveStatus}>
            {body.trim() || title.trim()
              ? '● Draft auto-saved'
              : '○ Nothing to save'}
          </div>
        </div>

        {/* RESET */}
        {publishResults && (
          <div style={styles.panelSection}>
            <button style={styles.resetBtn} onClick={reset}>
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
  editorCol: {
    flex: 1,
    padding: '24px 28px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
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
    top: '5px',
    right: '5px',
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
  warningBadge: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: 'var(--warning)',
    color: '#000',
    fontSize: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    cursor: 'help',
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
    textAlign: 'center',
  },

  /* TABS */
  tabRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tabs: {
    display: 'flex',
    background: 'var(--glass-1)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '3px',
    gap: '2px',
  },
  tab: {
    padding: '6px 16px',
    borderRadius: '6px',
    fontSize: '12px',
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    background: 'var(--glass-3)',
    color: 'var(--text-primary)',
  },
  previewPlatformPicker: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  previewPlatformBtn: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '11px',
    fontFamily: "'DM Sans', sans-serif",
    cursor: 'pointer',
    border: '1px solid',
    background: 'transparent',
    transition: 'all 0.15s ease',
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
    flexWrap: 'wrap',
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
    resize: 'vertical',
    minHeight: '200px',
  },

  /* IMAGE */
  imagePreview: {
    margin: '0 18px 12px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid var(--border-default)',
    position: 'relative',
  },
  imagePreviewImg: {
    width: '100%',
    maxHeight: '200px',
    objectFit: 'cover',
    display: 'block',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFileName: {
    padding: '6px 12px',
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: "'DM Mono', monospace",
    background: 'rgba(0,0,0,0.3)',
  },

  /* TAGS */
  tagsSection: {
    padding: '8px 18px 12px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  tagsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignItems: 'center',
    minHeight: '32px',
  },
  tag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'var(--accent-dim)',
    border: '1px solid var(--border-accent)',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '12px',
    color: 'var(--accent-bright)',
    fontFamily: "'DM Mono', monospace",
  },
  tagRemove: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    cursor: 'pointer',
    fontSize: '10px',
    padding: '0',
    lineHeight: 1,
  },
  tagInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    minWidth: '100px',
    flex: 1,
  },
  tagHint: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: 'var(--text-muted)',
  },

  /* EDITOR FOOTER */
  editorFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 18px',
    borderTop: '1px solid var(--border-subtle)',
    background: 'rgba(255,255,255,0.01)',
    flexWrap: 'wrap',
  },
  charCount: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginLeft: 'auto',
  },
  platformCharCount: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
  },

  /* PREVIEW */
  previewBlock: {
    background: 'var(--glass-2)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border-default)',
    borderRadius: '14px',
    minHeight: '300px',
    overflow: 'hidden',
  },
  previewEmpty: {
    padding: '48px 24px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
  },
  previewContent: {
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  previewPlatformLabel: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
  },
  previewImage: {
    width: '100%',
    maxHeight: '180px',
    objectFit: 'cover',
    borderRadius: '8px',
  },
  previewText: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '14px',
    fontWeight: 300,
    lineHeight: 1.8,
    color: 'var(--text-secondary)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  previewTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  previewTag: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '12px',
    color: 'var(--accent)',
  },
  warningsBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '12px',
    background: 'rgba(255,208,96,0.06)',
    border: '1px solid rgba(255,208,96,0.20)',
    borderRadius: '8px',
  },
  warningItem: {
    fontSize: '12px',
    color: 'var(--warning)',
    fontFamily: "'DM Sans', sans-serif",
  },

  /* LINK DIALOG */
  linkDialogOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  linkDialog: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: '16px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '360px',
    boxShadow: 'var(--shadow-elevated)',
  },
  linkDialogTitle: {
    fontFamily: "'Syne', sans-serif",
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: '4px',
  },
  linkInput: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  },
  linkDialogBtns: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #8b78ff 0%, #7060ee 100%)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px',
    padding: '9px 20px',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnGhost: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    padding: '9px 20px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '13px',
    cursor: 'pointer',
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
  viewLink: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
  },

  /* RIGHT PANEL */
  rightPanel: {
    width: '280px',
    minWidth: '280px',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    overflowY: 'auto',
    background: 'rgba(8,8,20,0.5)',
  },
  panelSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
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
    fontFamily: "'Syne', sans-serif",
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
  warningsCard: {
    background: 'rgba(255,208,96,0.06)',
    border: '1px solid rgba(255,208,96,0.20)',
    borderRadius: '10px',
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  warnRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  warnPlatform: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: 'var(--text-muted)',
    textTransform: 'capitalize',
    letterSpacing: '0.5px',
  },
  warnMessages: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  warnMsg: {
    fontSize: '11px',
    color: 'var(--warning)',
    fontFamily: "'DM Sans', sans-serif",
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
  autoSaveStatus: {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    color: 'var(--text-muted)',
    textAlign: 'center',
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