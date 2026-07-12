/* =========================================================
   KELLY SKI JAPAN — 共用腳本
   ========================================================= */

/* ====== 設定（Kelly 上線前請修改這裡）======
   LINE 官方帳號請含 @，例如 "@123abcd"
   個人帳號請填加好友連結末段 ID，例如 "kelly123"（即 line.me/ti/p/~kelly123）*/
const KELLY_LINE_ID = "@965vhiqj";

/* Kelly 的 Instagram（選填），例如 "https://www.instagram.com/kelly.ski" */
const KELLY_IG_URL = "";

/* ====== 影片上架區（貼上就自動出現在網站）======
   每一部影片一行，欄位說明：
   type    "yt"   → YouTube／YouTube Shorts：id 填影片 ID
                    （一般網址 watch?v=【這串】；Shorts 網址 /shorts/【這串】）
           "link" → Instagram Reels、TikTok 等：url 填完整網址（以卡片開新視窗）
   title   影片標題（顯示在卡片上）
   cat     "lesson"（教學實錄）或 "kelly"（Kelly 的滑行）
   vertical true = 直式短影音（9:16），false 或省略 = 橫式

   範例（把 // 拿掉就會上架）：
   // { type: "yt",   id: "AbCdEfGhIjK", title: "初學第一天：從穿板到滑綠線", cat: "lesson" },
   // { type: "yt",   id: "XyZ12345678", title: "二世谷粉雪日", cat: "kelly", vertical: true },
   // { type: "link", url: "https://www.instagram.com/reel/xxxx/", title: "留壽都樹林穿梭", cat: "kelly", vertical: true },
*/
const KELLY_VIDEOS = [];
/* ============================================ */

document.documentElement.classList.add("js");

/* ---------- 導覽列：捲動變實色 ---------- */
const nav = document.querySelector(".site-nav");
const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- 手機選單 ---------- */
const burger = document.querySelector(".nav-burger");
if (burger) {
  burger.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  document.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => document.body.classList.remove("nav-open"))
  );
}

/* ---------- 進場動畫 ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => io.observe(el));
  // 防呆：3 秒後強制顯示所有尚未進場的元素（避免特殊環境下內容被隱藏）
  setTimeout(() => revealEls.forEach((el) => el.classList.add("in")), 3000);
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* ---------- 年份 ---------- */
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* =========================================================
   預約表單（僅 booking.html 有）
   ========================================================= */
const form = document.getElementById("bookingForm");
if (form) {
  const result = document.getElementById("result");
  const resultText = document.getElementById("resultText");
  const toast = document.getElementById("toast");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const d = new FormData(form);
    const services = d.getAll("services");
    const lines = [
      "＝＝ 日本滑雪需求單 ＝＝",
      "稱呼：" + d.get("name").trim(),
      "LINE：" + d.get("line").trim(),
      "人數：大人 " + d.get("adults") + " 位" +
        (d.get("kids") ? "、小孩 " + d.get("kids") + " 位" : ""),
      "日期：" + d.get("date").trim() + (d.get("days") ? "（" + d.get("days") + "）" : ""),
      "程度：" + (d.get("level") || "未填"),
    ];
    if (d.get("board")) lines.push("板類：" + d.get("board"));
    lines.push("需要服務：" + (services.length ? services.join("、") : "請 Kelly 建議"));
    lines.push("想去雪場：" + (d.get("resort") || "還不確定，請 Kelly 推薦"));
    if (d.get("budget")) lines.push("每人預算：" + d.get("budget"));
    if (d.get("note").trim()) lines.push("備註：" + d.get("note").trim());
    lines.push("＝＝＝＝＝＝＝＝＝＝＝＝");

    resultText.value = lines.join("\n");
    result.classList.add("show");
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(resultText.value);
    } catch {
      resultText.select();
      document.execCommand("copy");
    }
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2400);
  }

  document.getElementById("btnCopy").addEventListener("click", copyMessage);

  document.getElementById("btnLine").addEventListener("click", async () => {
    await copyMessage();
    if (!KELLY_LINE_ID) {
      alert("尚未設定 Kelly 的 LINE ID（main.js 第一行）。\n訊息已複製，也可以直接貼給 Kelly。");
      return;
    }
    let url;
    if (KELLY_LINE_ID.startsWith("@")) {
      url = "https://line.me/R/oaMessage/" + encodeURIComponent(KELLY_LINE_ID) + "/?" +
        encodeURIComponent(resultText.value);
    } else {
      url = "https://line.me/ti/p/~" + encodeURIComponent(KELLY_LINE_ID);
    }
    window.open(url, "_blank");
  });
}

/* =========================================================
   影片專區（videos.html 與首頁精選）
   ========================================================= */
(function () {
  const CAT_LABEL = { lesson: "LESSON", kelly: "KELLY'S RIDE" };

  const PLAY_BTN =
    '<span class="vc-play"><svg viewBox="0 0 24 24"><path d="M8 5.6 18.4 12 8 18.4Z"/></svg></span>';

  /* 佔位卡的手繪小場景 */
  const PH_SCENES = {
    lesson:
      '<svg class="ph-scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="phl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f9cc8"/><stop offset="1" stop-color="#cde2f2"/></linearGradient></defs>' +
      '<rect width="400" height="225" fill="url(#phl)"/>' +
      '<circle cx="330" cy="44" r="22" fill="#fff8e8" opacity="0.9"/>' +
      '<path d="M-20 140 90 60l100 80Z" fill="#3d719e"/>' +
      '<path d="M90 60 66 108l14-10 10 11 13-15 9 8Z" fill="#eef6fc"/>' +
      '<path d="M400 110c-130 15-260 60-420 105v10h420Z" fill="#ffffff"/>' +
      '<path d="M262 128v30" stroke="#ff5a3c" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M262 128l20 7-20 7Z" fill="#ff5a3c"/>' +
      '<g transform="translate(120 150)"><circle cx="0" cy="-30" r="7" fill="#0b1220"/>' +
      '<path d="M-1 -23c5-1 9 1 10 6l3 12-7 2-3-10-6 1c-5 1-8-2-8-5 0-4 5-6 11-6Z" fill="#ff5a3c"/>' +
      '<path d="M-5 -6 -8 16M3 -5 8 16" stroke="#0b1220" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M-15 18h16M0 20h16" stroke="#0b1220" stroke-width="3" stroke-linecap="round"/></g>' +
      '<g transform="translate(175 168)"><circle cx="0" cy="-25" r="6" fill="#0b1220"/>' +
      '<path d="M-5 -19h10l4 13h-18Z" fill="#2b7fb8"/>' +
      '<path d="M-5 -6 -10 13M5 -6 10 13" stroke="#0b1220" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-17 15 -3 12M3 12l14 3" stroke="#0b1220" stroke-width="2.6" stroke-linecap="round"/></g>' +
      '<g fill="#ffffff"><circle cx="60" cy="40" r="2" opacity="0.7"/><circle cx="220" cy="30" r="1.6" opacity="0.6"/><circle cx="370" cy="90" r="1.8" opacity="0.6"/></g></svg>',
    kelly:
      '<svg class="ph-scene" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><linearGradient id="phk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1a2e"/><stop offset="1" stop-color="#2f6da0"/></linearGradient></defs>' +
      '<rect width="400" height="225" fill="url(#phk)"/>' +
      '<circle cx="90" cy="50" r="26" fill="#bfe3fb" opacity="0.35"/>' +
      '<path d="M-20 130 120 40l130 90Z" fill="#16304f"/>' +
      '<path d="M120 40 92 96l16-11 11 12 14-17 10 9Z" fill="#dcecf8"/>' +
      '<path d="M400 90c-120 25-240 80-420 125v10h420Z" fill="#e9f3fb"/>' +
      '<g transform="translate(235 130) rotate(-10)">' +
      '<g fill="#ffffff"><path d="M-52 26c14-8 27-10 40-8-14 6-26 11-40 14Z" opacity="0.9"/><circle cx="-48" cy="16" r="3" opacity="0.8"/><circle cx="-60" cy="28" r="4" opacity="0.6"/></g>' +
      '<g stroke="#6fc3f7" stroke-width="3" stroke-linecap="round" opacity="0.8"><path d="M-78 6h22"/><path d="M-86 18h18"/></g>' +
      '<g fill="#0b1220"><rect x="-22" y="20" width="52" height="5" rx="2.5" transform="rotate(-13 0 22)"/><rect x="-17" y="27" width="52" height="5" rx="2.5" transform="rotate(-13 0 29)"/></g>' +
      '<path d="M-4 24 5 11c2-3 5-4 8-4l11 3c3 1 5 3 5 6l2 9-7 1-3-8-8-1-6 11Z" fill="#0b1220"/>' +
      '<path d="M6 10c1-2 4-3 6-3l12 3c2 0 4 2 4 4l1 5-10 2-2-6-9-2Z" fill="#ff5a3c"/>' +
      '<circle cx="22" cy="5" r="6" fill="#0b1220"/>' +
      '<path d="M18 3a6 6 0 0 1 9-1l-2 3Z" fill="#6fc3f7"/></g>' +
      '<g fill="#ffffff"><circle cx="320" cy="40" r="2" opacity="0.6"/><circle cx="180" cy="26" r="1.6" opacity="0.5"/><circle cx="360" cy="120" r="1.8" opacity="0.5"/></g></svg>',
  };

  function platformOf(url) {
    if (/instagram\.com/i.test(url)) return "INSTAGRAM";
    if (/tiktok\.com/i.test(url)) return "TIKTOK";
    if (/youtu\.?be/i.test(url)) return "YOUTUBE";
    return "WATCH";
  }

  function cardHTML(v) {
    const vert = v.vertical ? " v916" : "";
    const tagCls = v.cat === "kelly" ? " accent" : "";
    const tag = CAT_LABEL[v.cat] || "VIDEO";
    if (v.type === "yt") {
      return (
        '<article class="video-card' + vert + '">' +
        '<div class="vc-thumb" data-yt="' + v.id + '">' +
        '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy" onerror="this.style.display=\'none\'">' +
        '<span class="vc-tag' + tagCls + '">' + tag + "</span>" + PLAY_BTN +
        "</div>" +
        '<div class="vc-body"><h3>' + v.title + "</h3>" +
        '<p class="vc-sub"><span class="dot"></span>YOUTUBE</p></div></article>'
      );
    }
    const pf = platformOf(v.url || "");
    return (
      '<a class="video-card' + vert + '" href="' + v.url + '" target="_blank" rel="noopener">' +
      '<div class="vc-thumb">' + PH_SCENES[v.cat === "kelly" ? "kelly" : "lesson"] +
      '<span class="vc-tag' + tagCls + '">' + tag + "</span>" + PLAY_BTN +
      "</div>" +
      '<div class="vc-body"><h3>' + v.title + "</h3>" +
      '<p class="vc-sub"><span class="dot"></span>' + pf + "（開新視窗）</p></div></a>"
    );
  }

  function placeholderHTML(cat) {
    const titles = {
      lesson: "教學實錄影片準備中",
      kelly: "Kelly 的滑行片段準備中",
    };
    return (
      '<article class="video-card placeholder">' +
      '<div class="vc-thumb">' + PH_SCENES[cat] +
      '<span class="vc-tag' + (cat === "kelly" ? " accent" : "") + '">' + CAT_LABEL[cat] + "</span>" +
      PLAY_BTN +
      '<span class="coming-chip">COMING SOON・陸續上架</span>' +
      "</div>" +
      '<div class="vc-body"><h3>' + titles[cat] + "</h3>" +
      '<p class="vc-sub"><span class="dot"></span>Follow Kelly</p></div></article>'
    );
  }

  function bindPlay(container) {
    container.addEventListener("click", (e) => {
      const t = e.target.closest(".vc-thumb[data-yt]");
      if (!t || !container.contains(t)) return;
      const id = t.getAttribute("data-yt");
      t.removeAttribute("data-yt");
      t.innerHTML =
        '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&playsinline=1&rel=0" title="video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    });
  }

  /* 影片頁：兩個分區 */
  [["videoGridLesson", "lesson"], ["videoGridKelly", "kelly"]].forEach(([id, cat]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const vids = KELLY_VIDEOS.filter((v) => v.cat === cat);
    el.innerHTML = vids.length
      ? vids.map(cardHTML).join("")
      : placeholderHTML(cat) + placeholderHTML(cat) + placeholderHTML(cat);
    bindPlay(el);
  });

  /* 首頁：精選（取前三部；沒有就放佔位卡） */
  const feat = document.getElementById("videoFeatured");
  if (feat) {
    const vids = KELLY_VIDEOS.slice(0, 3);
    feat.innerHTML = vids.length
      ? vids.map(cardHTML).join("")
      : placeholderHTML("lesson") + placeholderHTML("kelly") + placeholderHTML("lesson");
    bindPlay(feat);
  }

  /* IG 追蹤鈕（有設定才顯示） */
  document.querySelectorAll("[data-ig]").forEach((el) => {
    if (KELLY_IG_URL) el.href = KELLY_IG_URL;
    else el.style.display = "none";
  });
})();
