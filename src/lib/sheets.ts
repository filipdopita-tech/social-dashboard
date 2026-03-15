import { google } from "googleapis";

const SPREADSHEET_ID = "12LBNKEFQfOwdE2FAo4aAp-QCP6QZImARGjKgS5sBGjE";
const SHEET_NAME = "Social Queue";

function getAuth() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "{}");
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export interface QueueItem {
  id: string;
  datum: string;
  cas: string;
  platforma: string;
  typ: string;
  caption: string;
  mediaFile: string;
  status: string;
  rowIndex: number;
}

const HEADERS = ["ID", "Datum", "Čas", "Platforma", "Typ", "Caption", "Media File", "Status"];

export async function ensureHeaders(): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1:H1`,
  });
  
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
    });
  }
}

export async function getQueueItems(): Promise<QueueItem[]> {
  const sheets = getSheets();
  
  try {
    await ensureHeaders();
  } catch {
    // Sheet might not exist yet, try creating it
    try {
      const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
      const sheetExists = spreadsheet.data.sheets?.some(
        (s) => s.properties?.title === SHEET_NAME
      );
      if (!sheetExists) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
          },
        });
        await ensureHeaders();
      }
    } catch (e) {
      console.error("Error creating sheet:", e);
    }
  }

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2:H1000`,
  });

  const rows = res.data.values || [];
  return rows.map((row, index) => ({
    id: row[0] || "",
    datum: row[1] || "",
    cas: row[2] || "",
    platforma: row[3] || "",
    typ: row[4] || "",
    caption: row[5] || "",
    mediaFile: row[6] || "",
    status: row[7] || "pending",
    rowIndex: index + 2,
  }));
}

export async function addQueueItem(
  item: Omit<QueueItem, "id" | "rowIndex">
): Promise<QueueItem> {
  const sheets = getSheets();
  await ensureHeaders();

  const items = await getQueueItems();
  const maxId = items.reduce((max, i) => {
    const num = parseInt(i.id, 10);
    return num > max ? num : max;
  }, 0);
  const newId = String(maxId + 1);

  const row = [newId, item.datum, item.cas, item.platforma, item.typ, item.caption, item.mediaFile, item.status];
  
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:H`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  return {
    ...item,
    id: newId,
    rowIndex: items.length + 2,
  };
}

export async function updateQueueItem(
  id: string,
  updates: Partial<Omit<QueueItem, "id" | "rowIndex">>
): Promise<QueueItem | null> {
  const items = await getQueueItems();
  const item = items.find((i) => i.id === id);
  if (!item) return null;

  const updated = { ...item, ...updates };
  const row = [updated.id, updated.datum, updated.cas, updated.platforma, updated.typ, updated.caption, updated.mediaFile, updated.status];

  const sheets = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A${item.rowIndex}:H${item.rowIndex}`,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });

  return updated;
}

export async function deleteQueueItem(id: string): Promise<boolean> {
  const items = await getQueueItems();
  const item = items.find((i) => i.id === id);
  if (!item) return false;

  const sheets = getSheets();
  
  // Get sheet ID
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  );
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId === undefined) return false;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: item.rowIndex - 1,
              endIndex: item.rowIndex,
            },
          },
        },
      ],
    },
  });

  return true;
}

export async function getStats(): Promise<{
  total: number;
  pending: number;
  scheduled: number;
  posted: number;
  todayPosts: number;
  weekPosts: number;
}> {
  const items = await getQueueItems();
  const today = new Date().toISOString().split("T")[0];
  
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  return {
    total: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    scheduled: items.filter((i) => i.status === "scheduled").length,
    posted: items.filter((i) => i.status === "posted").length,
    todayPosts: items.filter((i) => i.datum === today).length,
    weekPosts: items.filter((i) => {
      if (!i.datum) return false;
      const d = new Date(i.datum);
      return d >= now && d <= weekEnd;
    }).length,
  };
}
