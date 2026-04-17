/**
 * Lumiere 实验数据收集 · Google Apps Script
 *
 * 部署步骤：
 * 1. 打开 Google Sheets，新建表格，命名为"Lumiere 实验数据"
 * 2. 菜单 → 扩展程序 → Apps Script
 * 3. 将此文件内容完整粘贴，替换原有内容
 * 4. 点击「部署」→「新建部署」
 *    - 类型：Web 应用
 *    - 执行身份：我（你的账号）
 *    - 访问权限：任何人
 * 5. 授权，复制生成的 Web App URL
 * 6. 将 URL 填入 code/config.js 的 sheetsUrl 字段
 */

const SHEET_NAME = 'responses';

const HEADERS = [
  'participant_id', 'timestamp', 'group', 'group_label',
  'bl_sleep', 'bl_activity', 'bl_energy', 'bl_stress',
  'mood_happy', 'mood_sad', 'mood_energetic',
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
    const data  = JSON.parse(e.postData.contents);
    const ss    = SpreadsheetApp.getActiveSpreadsheet();
    let   sheet = ss.getSheetByName(SHEET_NAME);

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
