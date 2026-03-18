const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256

// Generate a new AES-256-GCM key
export async function generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    )
}

// Export key to base64 string for storage
export async function exportKey(key: CryptoKey): Promise<string> {
    const raw = await crypto.subtle.exportKey('raw', key)
    return btoa(String.fromCharCode(...new Uint8Array(raw)))
}

// Import key from base64 string
export async function importKey(keyB64: string): Promise<CryptoKey> {
    const raw = Uint8Array.from(atob(keyB64), c => c.charCodeAt(0))
    return crypto.subtle.importKey(
        'raw',
        raw,
        { name: ALGORITHM, length: KEY_LENGTH },
        true,
        ['encrypt', 'decrypt']
    )
}

// Encrypt a string — returns base64 encoded nonce + ciphertext
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
    const nonce = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(plaintext)

    const ciphertext = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv: nonce },
        key,
        encoded
    )

    // Combine nonce (12 bytes) + ciphertext
    const combined = new Uint8Array(12 + ciphertext.byteLength)
    combined.set(nonce, 0)
    combined.set(new Uint8Array(ciphertext), 12)

    return btoa(String.fromCharCode(...combined))
}

// Decrypt a base64 encoded nonce + ciphertext string
export async function decrypt(encoded: string, key: CryptoKey): Promise<string> {
    const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0))

    const nonce = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv: nonce },
        key,
        ciphertext
    )

    return new TextDecoder().decode(decrypted)
}