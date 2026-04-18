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

export async function readSheet(sheetName: string) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
      range: sheetName,
    });

    return response.data.values || [];
  } catch (err: any) {
    console.error('readSheet error:', err.message);
    throw new Error('Không đọc được Google Sheet');
  }
}

export async function appendRow(sheetName: string, row: any[]) {
  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID!,
      range: sheetName,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('appendRow error:', err.message);
    throw new Error('Không ghi được Google Sheet');
  }
}
