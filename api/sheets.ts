import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    throw new Error('Thiếu ENV Google Sheets');
  }

  return new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey.replace(/\\n/g, '\n'),
    SCOPES
  );
}

// ================= READ =================
export async function readSheet(sheetName: string) {
  const auth = getAuth();
  await auth.authorize();

  const sheets = google.sheets({ version: 'v4', auth });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
    range: `${sheetName}!A:Z`,
  });

  return res.data.values || [];
}

// ================= APPEND =================
export async function appendRow(sheetName: string, row: any[]) {
  const auth = getAuth();
  await auth.authorize();

  const sheets = google.sheets({ version: 'v4', auth });

  return sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
    range: `${sheetName}!A:A`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  });
}

// ================= UPDATE (🔥 QUAN TRỌNG) =================
export async function updateRowById(
  sheetName: string,
  id: string,
  idColIndex: number,
  newRow: any[]
) {
  const auth = getAuth();
  await auth.authorize();

  const sheets = google.sheets({ version: 'v4', auth });

  const data = await readSheet(sheetName);

  const rowIndex = data.findIndex((row, i) => i > 0 && row[idColIndex] === id);

  if (rowIndex === -1) throw new Error('Không tìm thấy ID để update');

  const range = `${sheetName}!A${rowIndex + 1}`;

  return sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [newRow],
    },
  });
}

// ================= DELETE (🔥 QUAN TRỌNG) =================
export async function deleteRowById(
  sheetName: string,
  id: string,
  idColIndex: number
) {
  const auth = getAuth();
  await auth.authorize();

  const sheets = google.sheets({ version: 'v4', auth });

  const data = await readSheet(sheetName);

  const rowIndex = data.findIndex((row, i) => i > 0 && row[idColIndex] === id);

  if (rowIndex === -1) throw new Error('Không tìm thấy ID để xóa');

  return sheets.spreadsheets.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0, // ⚠️ nếu bạn có nhiều sheet → cần map sheetId
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });
}
