/**
 * Lumiere 实验数据收集 · Google Apps Script
 *
 * 修复说明（2026-04-17）：
 *   将 getActiveSpreadsheet() 替换为 openById()。
 *   Web App 部署后不存在"当前活跃表格"，getActiveSpreadsheet() 返回 null
 *   导致 doPost 静默失败，数据无法写入。openById 明确指定目标表格，彻底修复此问题。
 *
 * 更新（2026-04-25）：
 *   1. HEADERS 新增字段：last_screen, bl_mood_*, video_interest, mood_tired,
 *      phone_tempted, phone_picked；移除旧字段 bl_energy, bl_stress。
 *   2. appendRow → upsert：按 participant_id 查找已有行，存在则覆盖，否则追加。
 *      配合前端 commitProgress() 逐屏实时上报，实现增量写入同一行。
 */

const SHEET_ID   = '1UPH9dljYWdKPb_L7e_fh3MO8BSszB-lSvFbyjpVlS0c';
const SHEET_NAME = 'responses';

const HEADERS = [
  'participant_id', 'timestamp', 'group', 'group_label', 'last_screen',
  'bl_sleep', 'bl_activity',
  'bl_mood_happy', 'bl_mood_sad', 'bl_mood_energetic', 'bl_mood_tired',
  'video_interest',
  'mood_happy', 'mood_sad', 'mood_energetic', 'mood_tired',
  'phone_tempted', 'phone_picked',
  'pre_sart_commission_errors', 'pre_sart_omission_errors',
  'pre_sart_mean_rt_ms', 'pre_sart_sdrt_ms',
  'post_sart_commission_errors', 'post_sart_omission_errors',
  'post_sart_mean_rt_ms', 'post_sart_sdrt_ms',
  'sm_hours', 'sm_type', 'videogame_hours',
  'age', 'gender', 'location', 'email',
  'tab_switched', 'pre_sart_trials', 'post_sart_trials'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const missing = ['participant_id', 'timestamp'].filter(f => data[f] === undefined);
    if (missing.length > 0) throw new Error('Missing required fields: ' + missing.join(', '));

    const ss    = SpreadsheetApp.openById(SHEET_ID);
    let   sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }

    const newRow = HEADERS.map(k => (data[k] === undefined ? '' : data[k]));

    // Upsert: find existing row by participant_id, overwrite if found
    const pidCol   = HEADERS.indexOf('participant_id') + 1;
    const lastRow  = sheet.getLastRow();
    let   targetRow = -1;

    if (lastRow > 1) {
      const pidValues = sheet.getRange(2, pidCol, lastRow - 1, 1).getValues();
      for (let i = 0; i < pidValues.length; i++) {
        if (pidValues[i][0] === data.participant_id) {
          targetRow = i + 2;
          break;
        }
      }
    }

    if (targetRow > 0) {
      sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([newRow]);
    } else {
      sheet.appendRow(newRow);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('Lumiere experiment endpoint is live.');
}
