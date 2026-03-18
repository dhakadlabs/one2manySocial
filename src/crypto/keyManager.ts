import { generateKey, exportKey, importKey } from './encrypt'

const KEY_STORAGE_NAME = 'o2ms_enc_key'

// Get existing key or create a new one
// Key is stored in sessionStorage — cleared when browser tab closes
// On next open a new key is generated (tokens would need re-auth in that case)
// For MVP this is acceptable — future: use a derived key from a user passphrase

export async function getOrCreateKey(): Promise<CryptoKey> {
    const stored = sessionStorage.getItem(KEY_STORAGE_NAME)

    if (stored) {
        try {
            return await importKey(stored)
        } catch {
            // Key corrupted — generate new one
            sessionStorage.removeItem(KEY_STORAGE_NAME)
        }
    }

    const key = await generateKey()
    const exported = await exportKey(key)
    sessionStorage.setItem(KEY_STORAGE_NAME, exported)
    return key
}