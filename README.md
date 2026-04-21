# 💬 即時聊天室 (Real-time Chat App) 專案說明書

這是一個基於 Web 技術開發的即時聊天室應用程式，採用無伺服器 (Serverless) 架構與 Supabase 作為後端服務。系統支援即時訊息推播、PWA（漸進式網路應用程式）、密碼保護聊天室、端到端加密 (E2EE) 以及管理員操作面板，並且具備響應式設計 (RWD)，能夠完美適配手機與電腦端。

---

## 🛠️ 技術架構與技術棧 (Tech Stack)

### 前端 (Frontend)
- **核心技術**：HTML5, CSS3 (原生 CSS 變數與 Flexbox 排版), Vanilla JavaScript (原生 JS)。
- **即時通訊**：使用 [Supabase JS SDK](https://supabase.com/docs/reference/javascript/introduction) 處理 WebSocket 即時事件與資料庫互動。
- **端到端加密 (E2EE)**：結合 **Web Crypto API** 實作 AES-GCM 演算法，針對有密碼的房間對訊息與檔案連結進行本地端加密/解密。
- **PWA 支援**：透過 `manifest.json` 與 `sw.js` (Service Worker) 提供應用程式安裝與本地通知 (Local Notifications) 功能。

### 後端與部署 (Backend & Deployment)
- **部署平台**：[Vercel](https://vercel.com/)，透過 `vercel.json` 進行路由重寫。
- **無伺服器函數 (Serverless Functions)**：
  - `/api/config.js`：提供前端安全的 Supabase 連線設定。
  - `/api/admin.js`：處理管理員權限驗證與訊息清除邏輯。
  - `/api/verify.js`：負責在後端比對 SHA-256 Hash，確保房間密碼不會以明文形式暴露在前端或傳輸過程中。
- **資料庫與即時服務**：[Supabase](https://supabase.com/)
  - **PostgreSQL**：儲存聊天室 (Rooms)、訊息 (Messages)、反應 (Reactions) 等資料。
  - **Realtime**：負責即時同步聊天訊息、上線狀態與輸入中提示。
  - **Storage**：(預設) 用於處理圖片與檔案的上傳。

---

## ✨ 核心功能 (Core Features)

### 1. 快速登入 (Quick Login)
- **無須註冊**：使用者只需輸入「暱稱」即可快速進入聊天系統。
- **狀態保存**：暱稱與登入狀態會記錄在瀏覽器的 `sessionStorage` 中。

### 2. 聊天室管理與安全 (Room Security)
- **建立聊天室**：任何人皆可建立新的聊天室。
- **軍規級密碼保護**：建立聊天室時若設定密碼，密碼會先在前端使用 SHA-256 轉換成 Hash 後才存入資料庫，達成「密碼不落地」。進入時需透過 `/api/verify` 進行後端比對驗證。
- **端到端加密 (E2EE)**：若聊天室設有密碼，所有的訊息與傳送的檔案網址，都會在瀏覽器送出前被加密成 `E2EE:IV:密文` 的格式。資料庫無法讀取明文，只有擁有該房間密碼的使用者能解密觀看。

### 3. 即時通訊與互動 (Real-time Chat & Interaction)
- **即時訊息**：傳送訊息後，所有在同個聊天室的使用者會立刻收到。
- **多媒體支援**：支援傳送文字、圖片與各類檔案（PDF, ZIP, DOCX 等），點擊圖片可放大查看 (Lightbox)。
- **訊息操作**：
  - **編輯與刪除**：使用者可以編輯或刪除自己傳送的訊息。
  - **表情反應 (Emoji Reactions)**：任何人都可以對訊息點擊表情符號 (👍, ❤️, 😂 等) 進行互動。
- **輸入中提示 (Typing Indicator)**：當有人正在打字時，底部會顯示「某某某 正在輸入中...」。

### 4. 推播通知 (Push Notifications)
- 透過 Service Worker 實作本地通知。
- 若應用程式不在目前焦點（例如縮小或切換分頁），收到新訊息時會彈出桌面/手機通知。

### 5. 管理員面板 (Admin Panel)
- **權限控制**：透過獨立的管理員密碼進行登入。
- **訊息清理**：管理員可以選擇清除「特定聊天室」或「所有聊天室」的訊息。
- **清理模式**：可選擇「僅清除 30 天前的舊訊息」或「清除全部訊息」。

---

## 📂 目錄與檔案結構 (Directory Structure)

```text
my-chat-app/
│
├── index.html          # 系統主入口：包含所有 UI 結構、CSS 樣式與前端 JavaScript 邏輯
├── manifest.json       # PWA 設定檔，定義應用程式名稱、圖示與顯示模式
├── sw.js               # Service Worker：處理應用程式安裝與背景通知點擊事件
├── vercel.json         # Vercel 部署設定檔，設定 API 路由重寫
├── package.json        # Node.js 依賴套件管理檔 (供 Vercel 安裝 Supabase SDK 使用)
│
└── api/                # Vercel Serverless Functions 目錄
    ├── config.js       # (GET) 回傳 Supabase 的 URL 與公開 Key 給前端
    ├── admin.js        # (POST) 處理管理員驗證、清除訊息的後端邏輯
    └── verify.js       # (POST) 處理房間密碼 Hash 的安全驗證
```

---

## ⚙️ 環境變數設定 (Environment Variables)

專案部署至 Vercel 時，需要在 Vercel 的專案設定 (Settings -> Environment Variables) 中配置以下環境變數：

| 變數名稱 | 說明 | 備註 |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase 專案的 API URL | 必填 |
| `SUPABASE_KEY` | Supabase 專案的公開 (anon) Key | 必填 |
| `SUPABASE_SERVICE_KEY` | Supabase 的 Service Role Key | 必填 (用於管理員權限刪除資料與後端密碼驗證) |
| `ADMIN_PASSWORD` | 管理員面板的登入密碼 | 必填 (自訂一組密碼) |

---

## 🚀 開發與部署指南 (Development & Deployment)

### 本地開發測試
1. 安裝 [Vercel CLI](https://vercel.com/docs/cli)：
   ```bash
   npm i -g vercel
   ```
2. 在專案根目錄下，連結 Vercel 專案並拉取環境變數：
   ```bash
   vercel link
   vercel env pull
   ```
3. 啟動本地測試伺服器：
   ```bash
   vercel dev
   ```
   伺服器啟動後，即可在 `http://localhost:3000` 預覽應用程式。

### 部署至線上
將程式碼推播至 GitHub，並確保 Vercel 已經與該 Repo 連結，Vercel 就會在偵測到 `package.json` 後自動安裝相依套件並完成部署。也可以直接使用命令列部署：
```bash
vercel --prod
```

---

## 💡 系統資料庫表結構建議 (Supabase Schema Reference)

為了讓系統正常運作，你的 Supabase 需要包含以下資料表結構 (Tables)：

1. **`rooms`**：`id` (UUID), `name` (Text), `password` (Text, nullable - 現在儲存為 SHA-256 Hash 字串), `created_at` (Timestamp)
2. **`messages`**：`id` (UUID), `room_id` (UUID, FK), `username` (Text), `content` (Text - E2EE 加密內容), `file_url` (Text - E2EE 加密連結), `file_name` (Text - E2EE 加密檔名), `is_deleted` (Boolean), `edited_at` (Timestamp), `created_at` (Timestamp)
3. **`reactions`**：`id` (UUID), `message_id` (UUID, FK), `username` (Text), `emoji` (Text), `created_at` (Timestamp)

*(註：需確保 supabase 中已開啟 Realtime 功能，並針對 `messages` 與 `reactions` 表啟用推播)*
