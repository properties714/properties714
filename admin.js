// ══════════════════════════════════════
// ADMIN API — Google Apps Script Backend
// ══════════════════════════════════════

// Spreadsheet donde guardas datos
const SHEET_ID = "PUT_YOUR_SPREADSHEET_ID_HERE";

function doGet(e) {

  const action = e.parameter.action;

  if (action === "users") {
    return jsonResponse(getUsers());
  }

  if (action === "properties") {
    return jsonResponse(getProperties());
  }

  if (action === "stats") {
    return jsonResponse(getStats());
  }

  return jsonResponse({ error: "Invalid action" });
}

// ══════════════════════════════════════
// USERS
// ══════════════════════════════════════
function getUsers() {

  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName("users");

  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();

  const users = rows.map(r => ({
    id: r[0],
    email: r[1],
    name: r[2],
    created_at: r[3],
    plan: r[4],
    status: r[5]
  }));

  return users;
}

// ══════════════════════════════════════
// PROPERTIES
// ══════════════════════════════════════
function getProperties() {

  const sheet = SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName("properties");

  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();

  const props = rows.map(r => ({
    id: r[0],
    address: r[1],
    city: r[2],
    asking_price: r[3],
    arv: r[4],
    strategy: r[5],
    created_at: r[6]
  }));

  return props;
}

// ══════════════════════════════════════
// STATS
// ══════════════════════════════════════
function getStats() {

  const ss = SpreadsheetApp.openById(SHEET_ID);

  const usersSheet = ss.getSheetByName("users");
  const propsSheet = ss.getSheetByName("properties");

  const users = usersSheet.getLastRow() - 1;
  const properties = propsSheet.getLastRow() - 1;

  const stats = {
    total_users: users,
    total_properties: properties,
    monthly_revenue: users * 49,
    active_users: users
  };

  return stats;
}

// ══════════════════════════════════════
// JSON RESPONSE
// ══════════════════════════════════════
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
