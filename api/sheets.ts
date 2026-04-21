import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thiếu ENV: ${name}`);
  }
  return value;
}

function getSpreadsheetId(): string {
  return getEnv('GOOGLE_SHEETS_SPREADSHEET_ID');
}

function getAuth() {
  const clientEmail = getEnv('GOOGLE_SHEETS_CLIENT_EMAIL');
  const privateKey = getEnv('GOOGLE_SHEETS_PRIVATE_KEY');

  return new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey.replace(/\\n/g, '\n'),
    SCOPES
  );
}

async function getSheetsClient() {
  const auth = getAuth();
  await auth.authorize();
  return google.sheets({ version: 'v4', auth });
}

export async function readSheet(sheetName: string) {
  try {
    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getSpreadsheetId(),
      range: `${sheetName}!A:Z`,
    });

    return response.data.values || [];
  } catch (err: any) {
    console.error('❌ readSheet error:', err?.response?.data || err?.message || err);
    throw new Error(`Không đọc được Google Sheet: ${sheetName}`);
  }
}

export async function appendRow(sheetName: string, row: any[]) {
  try {
    if (!Array.isArray(row) || row.length === 0) {
      throw new Error('Row append không hợp lệ');
    }

    const sheets = await getSheetsClient();

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: getSpreadsheetId(),
      range: `${sheetName}!A:A`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [row],
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('❌ appendRow error:', err?.response?.data || err?.message || err);
    throw new Error(`Không ghi được Google Sheet: ${sheetName}`);
  }
}

async function getSheetIdByName(sheetName: string): Promise<number> {
  const sheets = await getSheetsClient();

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: 'sheets.properties',
  });

  const found = meta.data.sheets?.find(
    s => s.properties?.title === sheetName
  );

  const sheetId = found?.properties?.sheetId;

  if (sheetId === undefined || sheetId === null) {
    throw new Error(`Không tìm thấy sheetId cho sheet: ${sheetName}`);
  }

  return sheetId;
}

export async function findRowIndexById(
  sheetName: string,
  id: string,
  idColIndex: number
): Promise<number> {
  const data = await readSheet(sheetName);

  const rowIndex = data.findIndex((row, i) => i > 0 && row[idColIndex] === id);

  if (rowIndex === -1) {
    throw new Error(`Không tìm thấy ID "${id}" trong sheet ${sheetName}`);
  }

  return rowIndex; // zero-based trên mảng values, header là dòng 0
}

export async function updateRowById(
  sheetName: string,
  id: string,
  idColIndex: number,
  newRow: any[]
) {
  try {
    if (!id) throw new Error('Thiếu id để update');
    if (!Array.isArray(newRow) || newRow.length === 0) {
      throw new Error('newRow update không hợp lệ');
    }

    const sheets = await getSheetsClient();
    const rowIndex = await findRowIndexById(sheetName, id, idColIndex);

    const a1RowNumber = rowIndex + 1;
    const range = `${sheetName}!A${a1RowNumber}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('❌ updateRowById error:', err?.response?.data || err?.message || err);
    throw new Error(`Không cập nhật được sheet ${sheetName}`);
  }
}

export async function deleteRowById(
  sheetName: string,
  id: string,
  idColIndex: number
) {
  try {
    if (!id) throw new Error('Thiếu id để xóa');

    const sheets = await getSheetsClient();
    const spreadsheetId = getSpreadsheetId();

    const rowIndex = await findRowIndexById(sheetName, id, idColIndex);
    const sheetId = await getSheetIdByName(sheetName);

    // batchUpdate dùng index 0-based, header là dòng 0.
    // rowIndex ở trên đã là index trong values => đúng để xóa trực tiếp.
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });

    return response.data;
  } catch (err: any) {
    console.error('❌ deleteRowById error:', err?.response?.data || err?.message || err);
    throw new Error(`Không xóa được dòng trong sheet ${sheetName}`);
  }
}
