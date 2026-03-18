import { useState, useEffect } from 'react'
import { getAllPlugins } from '../core/registry'
import type { PlatformPlugin } from '../plugins/_interface/PlatformPlugin'

export interface PlatformStatus {
    plugin: PlatformPlugin
    connected: boolean
}

export function usePlatforms() {
    const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
    const [loading, setLoading] = useState(true)

    const refresh = async () => {
        setLoading(true)
        const plugins = getAllPlugins()

        const statuses = await Promise.all(
            plugins.map(async plugin => ({
                plugin,
                connected: await plugin.isConnected(),
            }))
        )

        setPlatforms(statuses)
        setLoading(false)
    }

    useEffect(() => {
        refresh()
    }, [])

    return { platforms, loading, refresh }
}