import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getAuth() {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !sheetId) {
    throw new Error('Thiếu ENV Google Sheets');
  }

  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey.replace(/\\n/g, '\n'),
    SCOPES
  );

  return auth;
}

// ================= READ =================
export async function readSheet(sheetName: string) {
  try {
    const auth = getAuth();
    await auth.authorize();

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
      range: `${sheetName}!A:Z`, // 🔥 đọc full cột
    });

    return response.data.values || [];
  } catch (err: any) {
    console.error('❌ readSheet error:', err.response?.data || err.message);
    throw new Error('Không đọc được Google Sheet');
  }
}

// ================= APPEND =================
export async function appendRow(sheetName: string, row: any[]) {
  try {
    const auth = getAuth();
    await auth.authorize();

    const sheets = google.sheets({ version: 'v4', auth });

    // 🔥 luôn append từ cột A để tránh lệch
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('❌ appendRow error:', err.response?.data || err.message);
    throw new Error('Không ghi được Google Sheet');
  }
}
