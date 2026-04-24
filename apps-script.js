/**
 * Lumiere 实验数据收集 · Google Apps Script
 *
 * 更新说明（2026-04-24）：
 * 新增 Week 8 会议确定的三个字段：
 * mood_tired（情绪4维）、phone_tempted / phone_picked（手机使用自我报告）
 */

const SHEET_ID = '1UPH9dljYWdKPb_L7e_fh3MO8BSszB-lSvFbyjpVlS0c';
const SHEET_NAME = 'responses';

const HEADERS = [
  'participant_id', 'timestamp', 'group', 'group_label',
  'bl_sleep', 'bl_activity', 'bl_energy', 'bl_stress',
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
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
    }
    sheet.appendRow(HEADERS.map(k => (data[k] === undefined ? '' : data[k])));
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
