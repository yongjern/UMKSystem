# This is a customise project.
(EN Version down)  
這是一個已經高度自定義的 Project. 因此，如果您需要使用這樣的系統，請自行 fork, 并且自行使用 AI 工具 (如: ChatGPT, Claude) 幫您自定義您的網頁及工具。  
This is a highly-customise project. So, please FORK if you want use this system.  
If you can't make it, just use AI tools to change it.

## 更新了什麼 / What's Updated

### v1.06（目前版本）
- 整合並統一最新的 Beta 更新內容，版本資訊會在通知中顯示。
- Notification / 版本提示已更新：每個版本會顯示版本號與「歡迎使用 MYUMK 系統」提示。
- Manifest 與品牌名稱已從 My UMK Dashboard 更新為 MyUMK。

### v1.05.3
- 更新 Planner 的中文翻譯與介面文案。
- 修正通知提醒中版本資訊顯示邏輯。

### v1.05.2
- 修正「下趟 / 后趟」時刻顯示方向問題，現在會依正確方向顯示。

### v1.05.1
- Planner 進行重大更新，現在可在 Event 中新增 revision。
- 新增「Other」作為課程結構以外的選項。
- Event Title 改為全大寫，讓版面更符合字型設計。
- 設定 deadline 時，預設直接設為 12:00 AM。
- 允許在 Event 中加入 hyperlink。
- Bus Schedule 現在會顯示接近的前三班車次，讓使用者更容易規劃時間。

### Notification / Permission 更新（v1.02 ~ v1.05）
- 點擊 Class Reminders 後，會要求通知權限。
- 授權成功後會立即發送測試通知；頁面載入時也會自動測試。
- 若權限被封鎖、網站不是 HTTPS、瀏覽器不支援通知、或通知發送失敗，將明確顯示錯誤原因。
- 新增 Service Worker 驗證與錯誤處理，讓通知流程更穩定。

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

開啟 `http://localhost:3000`。先完成下方 Supabase 設定；課程、課表、校車和快速連結會從 Supabase 讀取。個人活動與 Planner 需要以電子郵件登入後才會儲存。

## Supabase 設定

1. 在 Supabase 專案的 **Project Settings > API** 取得 Project URL 和 publishable key，填入 `.env.local`：

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

2. 在 Supabase **SQL Editor** 執行 [`supabase/schema.sql`](./supabase/schema.sql)。此腳本會建立資料表、Row Level Security policies，並寫入目前的課表、校車及快速連結 seed data。公開資料僅允許讀取；個人活動與 Planner 依登入使用者隔離。
3. 在 **Authentication > Providers** 啟用 Email，設定郵件 OTP/magic link；於 **Authentication > URL Configuration** 將本機與正式網站網址加入 Site URL / Redirect URLs。
4. 複製 `.env.example` 為 `.env.local`，並在 Supabase Auth 設定郵件寄送服務後測試一次性登入連結。

登入以電子郵件連結驗證；學號只作為 `profiles.matric_no` 個人資料，不會被當作密碼或登入憑證。首次登入會把本機 IndexedDB/localStorage 內既有的活動與 Planner 資料移至該登入帳戶。

只需要瀏覽課表/連結時不必登入。若 Supabase 尚未設定或資料表尚未建立，頁面會顯示資料載入錯誤；請先確認環境變數與 SQL schema 已套用。

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