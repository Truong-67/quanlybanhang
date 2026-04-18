import { readSheet, appendRow } from './sheets.js';

export default async function handler(req: any, res: any) {
  try {
    const { action } = req.query;

    // ================= GET =================
    if (req.method === 'GET') {
      if (action === 'getAll') {
        const [giaoDich, khachHang, nhaCungCap] = await Promise.all([
          readSheet('GIAO_DICH'),
          readSheet('KHACH_HANG'),
          readSheet('NHA_CUNG_CAP'),
        ]);

        return res.status(200).json({
          giaoDich,
          khachHang,
          nhaCungCap,
        });
      }
    }

    // ================= POST =================
    if (req.method === 'POST') {
      if (action === 'addGiaoDich') {
        const { row } = req.body;

        if (!row || !Array.isArray(row)) {
          return res.status(400).json({
            error: 'Body phải có row dạng array',
          });
        }

        await appendRow('GIAO_DICH', row);

        return res.status(200).json({
          success: true,
          message: 'Đã thêm giao dịch',
        });
      }
    }

    return res.status(400).json({
      error: 'Sai action hoặc method',
    });

  } catch (error: any) {
    console.error('API ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
