import { db } from '../db/client'
import { encrypt, decrypt } from '../crypto/encrypt'
import { getOrCreateKey } from '../crypto/keyManager'
import { v4 as uuidv4 } from 'uuid'

// Save encrypted token for a platform
export async function saveToken(
    platformId: string,
    tokenData: Record<string, string>,
    extra?: {
        displayName?: string
        platformUserId?: string
        extraConfig?: string
    }
): Promise<void> {
    const key = await getOrCreateKey()
    const encryptedToken = await encrypt(JSON.stringify(tokenData), key)
    const now = Date.now()

    // Check if account already exists for this platform
    const existing = await db.platformAccounts
        .where('platformId')
        .equals(platformId)
        .first()

    if (existing) {
        await db.platformAccounts.update(existing.id, {
            encryptedToken,
            isActive: 1,
            lastUsedAt: now,
            displayName: extra?.displayName,
            platformUserId: extra?.platformUserId,
            extraConfig: extra?.extraConfig,
        })
    } else {
        await db.platformAccounts.add({
            id: uuidv4(),
            platformId,
            encryptedToken,
            isActive: 1,
            connectedAt: now,
            lastUsedAt: now,
            displayName: extra?.displayName,
            platformUserId: extra?.platformUserId,
            extraConfig: extra?.extraConfig,
        })
    }
}

// Get decrypted token for a platform
export async function getToken(
    platformId: string
): Promise<Record<string, string> | null> {
    const account = await db.platformAccounts
        .where('platformId')
        .equals(platformId)
        .filter(a => a.isActive === 1)
        .first()

    if (!account) return null

    try {
        const key = await getOrCreateKey()
        const decrypted = await decrypt(account.encryptedToken, key)
        return JSON.parse(decrypted)
    } catch {
        return null
    }
}

// Remove token for a platform
export async function removeToken(platformId: string): Promise<void> {
    await db.platformAccounts
        .where('platformId')
        .equals(platformId)
        .modify({ isActive: 0 })
}

// Check if platform has a stored token
export async function hasToken(platformId: string): Promise<boolean> {
    const account = await db.platformAccounts
        .where('platformId')
        .equals(platformId)
        .filter(a => a.isActive === 1)
        .first()
    return !!account
}