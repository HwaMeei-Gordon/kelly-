/**
 * ═══════════════════════════════════════════════════════════
 * Kelly Ski Japan — 需求單自動通知後端（Google Apps Script）
 * ═══════════════════════════════════════════════════════════
 * 功能：
 *   1. 接收網站需求單（HTTP POST JSON）
 *   2. 寫入 Google 試算表「Kelly 需求單紀錄」（自動建立）
 *   3. 透過 LINE 官方帳號 Messaging API 推播通知管理者
 *
 * 部署方式見 backend/SETUP.md。
 *
 * ── 指令碼屬性（專案設定 → 指令碼屬性）──
 *   CHANNEL_ACCESS_TOKEN  LINE 官方帳號的 channel access token（必填）
 *   SHARED_KEY            與網站約定的通關密語，防止陌生人濫發（必填，自訂一串亂碼）
 *   ADMIN_USER_IDS        要收通知的 LINE userId，逗號分隔（選填；
 *                         沒填會改用 broadcast 發給「官方帳號的所有好友」，
 *                         僅適合帳號還只有自己人時的測試期）
 *   SHEET_ID              （自動產生，不用手填）
 *
 * ⚠️ Token 是鑰匙，只放在指令碼屬性，不要貼進任何程式碼或公開場合。
 */

const PROPS = PropertiesService.getScriptProperties();

/** HTTP POST 入口：接收網站需求單 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json_({ ok: false, error: 'empty body' });
    }
    const data = JSON.parse(e.postData.contents);

    // 驗證通關密語
    const key = PROPS.getProperty('SHARED_KEY') || '';
    if (!key || data.key !== key) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    // 基本防呆
    const message = String(data.message || '').trim();
    if (!message || message.length > 4000) {
      return json_({ ok: false, error: 'bad payload' });
    }

    logToSheet_(data);                    // 先留紀錄（即使 LINE 失敗也有備份）
    const lineResult = notifyLINE_(message);

    return json_({ ok: true, line: lineResult });
  } catch (err) {
    Logger.log('[ERROR][doPost] ' + (err && err.message) + '\n' + (err && err.stack || ''));
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/** 推播需求單到管理者的 LINE */
function notifyLINE_(text) {
  const token = PROPS.getProperty('CHANNEL_ACCESS_TOKEN');
  if (!token) {
    Logger.log('[WARN] CHANNEL_ACCESS_TOKEN 未設定，略過 LINE 通知');
    return 'no-token';
  }

  const messages = [{ type: 'text', text: '【網站新需求單】\n\n' + text }];
  const ids = (PROPS.getProperty('ADMIN_USER_IDS') || '')
    .split(',').map(function (s) { return s.trim(); }).filter(Boolean);

  if (ids.length) {
    ids.forEach(function (id) {
      fetchLINE_('push', { to: id, messages: messages }, token);
    });
    return 'push:' + ids.length;
  }

  // 未設定 userId → broadcast（發給官方帳號的所有好友，僅適合測試期）
  fetchLINE_('broadcast', { messages: messages }, token);
  return 'broadcast';
}

/** 呼叫 LINE Messaging API（模式參考 The_Q_System_Core.pushToLINE_） */
function fetchLINE_(endpoint, payload, token) {
  const resp = UrlFetchApp.fetch('https://api.line.me/v2/bot/message/' + endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    muteHttpExceptions: true,
    payload: JSON.stringify(payload),
  });
  const code = resp.getResponseCode();
  if (code !== 200) {
    Logger.log('[ERROR][LINE ' + endpoint + '] HTTP ' + code + ' | ' +
      resp.getContentText().substring(0, 300));
  }
}

/** 寫入試算表（第一次執行自動建立，並把 ID 記回指令碼屬性） */
function logToSheet_(data) {
  try {
    let sheetId = PROPS.getProperty('SHEET_ID');
    let ss;
    if (sheetId) {
      ss = SpreadsheetApp.openById(sheetId);
    } else {
      ss = SpreadsheetApp.create('Kelly 需求單紀錄');
      PROPS.setProperty('SHEET_ID', ss.getId());
      ss.getActiveSheet().appendRow([
        '時間', '稱呼', 'LINE', '大人', '小孩', '日期', '天數',
        '程度', '板類', '需要服務', '雪場', '預算', '備註', '完整訊息',
      ]);
    }
    const f = data.fields || {};
    ss.getSheets()[0].appendRow([
      new Date(), f.name || '', f.line || '', f.adults || '', f.kids || '',
      f.date || '', f.days || '', f.level || '', f.board || '',
      f.services || '', f.resort || '', f.budget || '', f.note || '',
      String(data.message || ''),
    ]);
  } catch (err) {
    Logger.log('[ERROR][logToSheet_] ' + (err && err.message));
  }
}

/** JSON 回應（ContentService 對簡單請求會自帶 CORS 標頭） */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 手動測試：在編輯器選這個函式按「執行」，管理者 LINE 應收到測試訊息 */
function testPush() {
  const result = notifyLINE_('這是一則測試訊息。看到代表推播設定成功！');
  Logger.log('notifyLINE_ → ' + result);
}
