import { create } from 'zustand'

export interface ComposerState {
  title: string
  body: string
  tags: string[]
  tagInput: string
  imagePath: string | null
  imageFile: File | null
  imagePreviewUrl: string | null
  selectedPlatforms: string[]
  isPublishing: boolean
  isDraft: boolean
  lastSaved: number | null
  publishResults: Record<string, {
    success: boolean
    error?: string
    url?: string
  }> | null

  setTitle: (title: string) => void
  setBody: (body: string) => void
  setTagInput: (input: string) => void
  addTag: (tag: string) => void
  removeTag: (tag: string) => void
  setImage: (file: File | null, previewUrl: string | null) => void
  clearImage: () => void
  togglePlatform: (platformId: string) => void
  selectAllPlatforms: (platformIds: string[]) => void
  clearSelection: () => void
  setPublishing: (val: boolean) => void
  setPublishResults: (
    results: Record<string, {
      success: boolean
      error?: string
      url?: string
    }> | null
  ) => void
  setLastSaved: (ts: number) => void
  reset: () => void
}

const initialState = {
  title: '',
  body: '',
  tags: [],
  tagInput: '',
  imagePath: null,
  imageFile: null,
  imagePreviewUrl: null,
  selectedPlatforms: [],
  isPublishing: false,
  isDraft: false,
  lastSaved: null,
  publishResults: null,
}

export const useComposerStore = create<ComposerState>(set => ({
  ...initialState,

  setTitle: title => set({ title, publishResults: null }),
  setBody: body => set({ body, publishResults: null }),

  setTagInput: tagInput => set({ tagInput }),

  addTag: tag => set(state => {
    const cleaned = tag.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!cleaned || state.tags.includes(cleaned) || state.tags.length >= 5) return state
    return { tags: [...state.tags, cleaned], tagInput: '' }
  }),

  removeTag: tag => set(state => ({
    tags: state.tags.filter(t => t !== tag)
  })),

  setImage: (imageFile, imagePreviewUrl) => set({
    imageFile,
    imagePreviewUrl,
    imagePath: imageFile?.name ?? null,
  }),

  clearImage: () => set({
    imageFile: null,
    imagePreviewUrl: null,
    imagePath: null,
  }),

  togglePlatform: platformId => set(state => ({
    selectedPlatforms: state.selectedPlatforms.includes(platformId)
      ? state.selectedPlatforms.filter(id => id !== platformId)
      : [...state.selectedPlatforms, platformId],
    publishResults: null,
  })),

  selectAllPlatforms: platformIds => set({
    selectedPlatforms: platformIds,
    publishResults: null,
  }),

  clearSelection: () => set({
    selectedPlatforms: [],
    publishResults: null,
  }),

  setPublishing: isPublishing => set({ isPublishing }),

  setPublishResults: publishResults => set({ publishResults }),

  setLastSaved: lastSaved => set({ lastSaved }),

  reset: () => set(initialState),
}))