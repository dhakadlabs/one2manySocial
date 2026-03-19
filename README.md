# one2manySocial

**Write once. Reach everywhere. Privately.**

one2manySocial is a local-first, privacy-focused social media distribution tool that allows you to publish your content to multiple platforms simultaneously — directly from your browser. No servers, no accounts, and no compromise on your data.

---

## ✦ Key Features

- **Write Once, Publish Everywhere**: A single unified composer for 7+ platforms.
- **Local-First / No Backend**: All your API keys and tokens are stored in your browser's IndexedDB. We never see them.
- **Privacy First**: No user accounts or login required. Your data never leaves your device.
- **Encrypted Storage**: Sensitive platform tokens are encrypted using **AES-256-GCM** before being stored.
- **Modular Plugin Architecture**: Easily extensible system for adding new social platforms.
- **Beta version**: Currently supports publishing articles/text posts (images and videos support coming soon).

## ⬡ Supported Platforms

| Platform | Auth Method | Color |
| :--- | :--- | :--- |
| **Discord** | Webhook | `#5865f2` |
| **Telegram** | Bot Token | `#0088cc` |
| **Bluesky** | App Password | `#0085ff` |
| **Mastodon** | OAuth2 | `#6364ff` |
| **Dev.to** | API Token | `#0838fe` |
| **Hashnode** | Personal Access Token | `#2962ff` |
| **Tumblr** | OAuth2 | `#35465c` |

## ◈ Tech Stack

- **Core**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
- **Encryption**: [Crypto-js](https://github.com/brix/crypto-js) + Web Crypto API (AES-256-GCM)
- **Styling**: Vanilla CSS + [Lucide Icons](https://lucide.dev/)
- **API Utilities**: Axios + React Query

## ◎ Architecture

### Plugin System
The app uses a modular plugin architecture centered around the [`PlatformPlugin`](src/plugins/_interface/PlatformPlugin.ts) interface. To add a new platform, simply implement the interface and register the plugin in [`registry.ts`](src/core/registry.ts).

### Privacy & Encryption
When you connect a platform, your credentials are:
1. Encrypted in the browser using a volatile AES-256-GCM key from `sessionStorage`.
2. Stored in your local IndexedDB via Dexie.
3. Decrypted only at the moment of publishing.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dhakadlabs/one2manySocial.git
   ```
2. Install dependencies:
   ```bash
   cd one2manySocial
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ♡ by [Dhakad Labs](https://dhakadlabs.site)
