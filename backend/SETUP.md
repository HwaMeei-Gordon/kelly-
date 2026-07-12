# 需求單自動通知——部署教學（約 10 分鐘）

做完之後：客人在網站按「送出」→ 你們的 LINE 直接收到完整需求單，
客人**不需要開 LINE、不需要按任何發送**。每筆需求也會自動存進 Google 試算表。

> 可以先拿測試用的官方帳號（例如 The Q 那個）練一次，流程完全相同，
> 之後換成 Kelly 正式帳號只要改一個 token。

## 第 1 步：建立 Apps Script 專案

1. 打開 <https://script.google.com> → 「新專案」
2. 把 `backend/kelly-webhook.gs` 的內容全部貼進去（取代原本的空白程式）
3. 左上角把專案命名為 `kelly-webhook`

## 第 2 步：填入金鑰（不會出現在任何公開地方）

1. 左側齒輪「專案設定」→ 最下方「指令碼屬性」→「新增指令碼屬性」
2. 加入這三筆：

| 屬性 | 值 |
|------|----|
| `CHANNEL_ACCESS_TOKEN` | LINE Developers → 你的官方帳號 channel → Messaging API 分頁 → Channel access token（沒有就按 Issue） |
| `SHARED_KEY` | 自己編一串亂碼，例如 `kelly-2027-xYz`（等等要同步給網站） |
| `ADMIN_USER_IDS` | 要收通知的人的 LINE **userId**（U 開頭那串）。多人用逗號分隔。<br>先留空也可以：留空會改用「廣播給官方帳號所有好友」，帳號只有自己人時拿來測試剛剛好 |

> 📌 userId 去哪找？The Q 系統的聊天記憶表裡就有；
> 或在 LINE Developers 的 channel 首頁有你自己的「Your user ID」。

## 第 3 步：測試推播

1. 編輯器上方函式選單選 `testPush` → 按「執行」
2. 第一次會跳出授權視窗 → 一路允許
3. 你的 LINE 應該會叮咚收到「這是一則測試訊息」→ 成功！

## 第 4 步：部署成網址

1. 右上「部署」→「新增部署作業」→ 類型選「**網頁應用程式**」
2. 執行身分：**我**；誰可以存取：**所有人**
3. 按「部署」→ 複製產生的網址（`https://script.google.com/macros/s/…/exec`）

## 第 5 步：把網址接上網站

把兩個值告訴 Claude（或自己改 `main.js` 最上方）：

```js
const KELLY_WEBHOOK_URL = "貼上第 4 步的 /exec 網址";
const KELLY_WEBHOOK_KEY = "第 2 步自訂的 SHARED_KEY";
```

完成！之後客人送出需求單：

- ✅ 你們的 LINE 立刻收到【網站新需求單】
- ✅ Google 試算表「Kelly 需求單紀錄」自動多一列（第一筆送出時自動建立）
- ✅ 客人看到「已送出，Kelly 會主動聯繫」＋加好友按鈕
- 🔁 萬一雲端暫時故障，網站自動退回原本的「複製訊息＋開 LINE」流程，不會漏單

## 常見問題

- **改程式要重新部署嗎？** 要。「部署」→「管理部署作業」→ 鉛筆 → 版本選「新版本」→ 部署（網址不變）。
- **SHARED_KEY 有什麼用？** 網址是公開的，密語可以擋住陌生人對這支程式亂灌訊息。
- **費用？** Apps Script 免費；LINE 官方帳號免費方案每月有免費訊息額度，接收詢問綽綽有餘。
