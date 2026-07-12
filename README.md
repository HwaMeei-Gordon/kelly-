# Kelly Ski Japan — 日本滑雪一站式服務網站

多頁式形象網站＋需求單系統：客人在網站上了解服務、挑雪場，
最後用「需求單表單」把人數、日期、程度、預算一次填好，
自動整理成一則格式化訊息、一鍵傳到 Kelly 的 LINE——
取代目前用 LINE 一來一回逐項詢問的流程。

## 網站架構（多頁式）

| 頁面 | 檔案 | 內容 |
|------|------|------|
| 首頁 | `index.html` | 全景手繪 Hero、品牌主張、服務精華、精選雪場、預約流程、適合對象 |
| 服務項目 | `services.html` | 課程教練／住宿／交通／雪票裝備 四大服務詳細介紹（各配手繪插畫） |
| 雪場介紹 | `resorts.html` | 六大雪場（二世谷、留壽都、富良野、白馬、野澤、藏王）＋雪季指南 |
| 預約指南 | `guide.html` | 預約流程、常見問題 FAQ、行前準備清單 |
| 教學影片 | `videos.html` | 教學實錄 + Kelly 的滑行 兩大影片區（貼連結自動上架） |
| 立即預約 | `booking.html` | 需求單表單 → 自動生成訊息 → 複製／一鍵開 LINE |

共用檔案：`styles.css`（設計系統）、`main.js`（互動、表單邏輯與影片清單）。

## 設計特色

- **高級感 × 運動感**：深夜藍黑基調＋冰藍／電光橘點綴、斜切按鈕與標籤、
  跑馬燈雪場名、描邊幽靈字、進場動畫
- **全手繪 SVG**：所有圖示（30+ 顆）與場景插畫（雪山全景、滑雪者、六座雪場、
  四大服務場景）都是純 SVG 手工繪製，**零 emoji、零外部圖片**，載入極快
- 手機優先 RWD，全螢幕手機選單
- 純靜態網站、無後端、零維運成本

## 上線前必改：填入 Kelly 的 LINE ID

打開 `main.js`，最上方的設定區：

```js
const KELLY_LINE_ID = "";
```

- **LINE 官方帳號**：填入含 `@` 的 ID，例如 `"@123abcd"`。
  客人按「用 LINE 傳給 Kelly」會直接開啟聊天室並自動帶入訊息（體驗最好，建議申請，免費）。
- **個人帳號**：填加好友連結末段 ID，例如 `"kelly123"`（即 `line.me/ti/p/~kelly123`）。
  訊息會自動複製，客人加好友後貼上即可。

## 影片怎麼上架（Kelly 自己就能做）

影片清單也在 `main.js` 最上方的 `KELLY_VIDEOS`，一部影片一行，存檔即上架：

```js
const KELLY_VIDEOS = [
  { type: "yt",   id: "AbCdEfGhIjK", title: "初學第一天：從穿板到滑綠線", cat: "lesson" },
  { type: "yt",   id: "XyZ12345678", title: "二世谷粉雪日", cat: "kelly", vertical: true },
  { type: "link", url: "https://www.instagram.com/reel/xxxx/", title: "留壽都樹林穿梭", cat: "kelly", vertical: true },
];
```

| 欄位 | 說明 |
|------|------|
| `type` | `"yt"`＝YouTube／Shorts（`id` 填影片 ID：`watch?v=`後面那串或 `/shorts/` 後面那串）；`"link"`＝IG Reels、TikTok（`url` 填完整網址，以卡片開新視窗） |
| `title` | 卡片上顯示的標題 |
| `cat` | `"lesson"`＝教學實錄區、`"kelly"`＝Kelly 的滑行區 |
| `vertical` | `true`＝直式短影音（9:16） |

- 影片會同時出現在 **教學影片頁** 與 **首頁精選**（首頁取前三部）
- 還沒放影片時會顯示「COMING SOON」手繪佔位卡，版面一樣好看
- YouTube 影片直接在站內播放（點縮圖才載入，網頁依然輕快）；IG／TikTok 以連結卡片開新視窗
- 另外可填 `KELLY_IG_URL` 顯示「追蹤 Instagram」按鈕（不填就自動隱藏）

> 建議流程：影片平常照舊發到 IG／YouTube，挑精華貼進這份清單就好，網站零維護負擔。

## 如何部署（免費，用 GitHub Pages）

1. 進入這個 repo 的 **Settings → Pages**
2. Source 選 **Deploy from a branch**，Branch 選 `main`、資料夾選 `/ (root)`，按 Save
3. 幾分鐘後網站就會出現在 `https://<帳號>.github.io/<repo 名稱>/`
4. 把網址放到 Kelly 的 LINE 個人檔案／IG／社群貼文，客人點進來填單即可

## 本機預覽

直接用瀏覽器打開 `index.html` 就能看，不需要安裝任何東西。

## 未來可以加的功能

- 接 Google 試算表或後台，自動記錄每筆需求單
- 教練介紹頁／學員照片牆與評價
- 雪場即時雪況、價目方案表
- 日文、英文版本
