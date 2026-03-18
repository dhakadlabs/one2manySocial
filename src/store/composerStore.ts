import { create } from 'zustand'

interface ComposerState {
    title: string
    body: string
    tags: string[]
    selectedPlatforms: string[]
    isPublishing: boolean
    publishResults: Record<string, { success: boolean; error?: string; url?: string }> | null

    setTitle: (title: string) => void
    setBody: (body: string) => void
    setTags: (tags: string[]) => void
    togglePlatform: (platformId: string) => void
    selectAllPlatforms: (platformIds: string[]) => void
    clearSelection: () => void
    setPublishing: (val: boolean) => void
    setPublishResults: (results: Record<string, { success: boolean; error?: string; url?: string }> | null) => void
    reset: () => void
}

const initialState = {
    title: '',
    body: '',
    tags: [],
    selectedPlatforms: [],
    isPublishing: false,
    publishResults: null,
}

export const useComposerStore = create<ComposerState>(set => ({
    ...initialState,

    setTitle: title => set({ title }),
    setBody: body => set({ body }),
    setTags: tags => set({ tags }),

    togglePlatform: platformId =>
        set(state => ({
            selectedPlatforms: state.selectedPlatforms.includes(platformId)
                ? state.selectedPlatforms.filter(id => id !== platformId)
                : [...state.selectedPlatforms, platformId],
            publishResults: null,
        })),

    selectAllPlatforms: platformIds =>
        set({ selectedPlatforms: platformIds, publishResults: null }),

    clearSelection: () =>
        set({ selectedPlatforms: [], publishResults: null }),

    setPublishing: isPublishing => set({ isPublishing }),

    setPublishResults: publishResults => set({ publishResults }),

    reset: () => set(initialState),
}))