/* =========================================================
   KELLY SKI JAPAN — 共用腳本
   ========================================================= */

/* ====== 設定（Kelly 上線前請修改這裡）======
   LINE 官方帳號請含 @，例如 "@123abcd"
   個人帳號請填加好友連結末段 ID，例如 "kelly123"（即 line.me/ti/p/~kelly123）*/
const KELLY_LINE_ID = "";
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
