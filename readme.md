# This is a customise project.
(EN Version down)  
這是一個已經高度自定義的 Project. 因此，如果您需要使用這樣的系統，請自行 fork, 并且自行使用 AI 工具 (如: ChatGPT, Claude) 幫您自定義您的網頁及工具。  
This is a highly-customise project. So, please FORK if you want use this system.  
If you can't make it, just use AI tools to change it.

## 專案結構

```text
public/logo.svg                 實體 Logo 資產（可替換成官方 logo.webp）
src/app/api/calendar/route.ts   Google Calendar API Route（10 分鐘快取）
src/app/globals.css             UMK 品牌樣式與響應式版面
src/app/layout.tsx              字體與全站 metadata
src/app/page.tsx                首頁入口
src/components/dashboard.tsx   Dashboard 互動元件
src/data/links.ts               可編輯的快速連結
src/data/schedule.ts            課表 seed data
src/lib/calendar.ts             Google OAuth 與事件正規化
.env.example                    環境變數範例
```

## 本機開發

需要 Node.js 20.9 或更新版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

開啟 `http://localhost:3000`。若暫時不設定 Google 環境變數，網站仍會正常顯示 seed 課表。修改連結請編輯 `src/data/links.ts`；修改固定課表請編輯 `src/data/schedule.ts`。

## Google Calendar OAuth

1. 前往 Google Cloud Console，建立或選擇專案。
2. 在 **APIs & Services > Library** 啟用 **Google Calendar API**。
3. 設定 OAuth consent screen。若應用程式維持 Testing，請將自己的 Google 帳號加入 Test users。
4. 在 **Credentials** 建立 OAuth 2.0 Client ID。可使用 Web application，並加入用來取得授權碼的 redirect URI（例如 Google OAuth Playground）。
5. 用 OAuth Playground 或一次性腳本授權 `https://www.googleapis.com/auth/calendar.readonly`，並取得 refresh token。使用 Playground 時需勾選 **Use your own OAuth credentials**，填入同一組 Client ID 與 Client Secret。
6. 將下列值填入 `.env.local`；這些值只能保存在伺服器端，不可加上 `NEXT_PUBLIC_`：

```dotenv
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_CALENDAR_ID=primary
```

API Route 每 10 分鐘重新驗證一次。Calendar 無法連線或憑證缺失時會回傳 `source: "seed"`，前端隨即使用本地課表。

## 部署到 Vercel

1. 將專案推送到 GitHub，登入 Vercel 後選擇 **Add New > Project** 並匯入 repository。
2. Framework Preset 選擇 Next.js，Build Command 保持 `next build`。
3. 在 **Project Settings > Environment Variables** 新增上述四個 Google 變數，套用至 Production（需要時也套用 Preview）。
4. 按下 Deploy。若後續修改環境變數，請重新部署一次。

## 自訂網域

1. 在 Vercel 專案的 **Settings > Domains** 輸入網域，例如 `dashboard.example.com`。
2. 子網域：在 DNS 供應商新增 `CNAME`，Name 設為 `dashboard`，Value 設為 `cname.vercel-dns.com`。
3. 根網域：新增 `A` record，Name 設為 `@`，Value 設為 Vercel 畫面指定的 IP（通常為 `76.76.21.21`，應以 Vercel 當下顯示值為準）。
4. 移除同一主機名稱上衝突的 A/AAAA/CNAME 記錄，等待 DNS 傳播及 Vercel 自動核發 HTTPS 憑證。

## Logo

目前 `public/logo.svg` 是可替換的本地品牌字標。取得官方 `logo-menegak` 後，放入 `public/logo.webp`，並將 Dashboard 中的 Image 路徑由 `/logo.svg` 改為 `/logo.webp` 即可。