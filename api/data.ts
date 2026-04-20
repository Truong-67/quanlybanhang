import { readSheet, appendRow } from './sheets.js';

function findById(data: any[][], id: string, colIndex: number) {
  return data.slice(1).find(row => row[colIndex] === id);
}

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
          readSheet('HANG_HOA') // 🔥 THÊM DÒNG NÀY
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
          return res.status(400).json({ error: 'Row không hợp lệ' });
        }

        // Cấu trúc row:
        // [id, type, maHang, tenHang, soLuong, gia, doiTacId, tenDoiTac, sdt, diaChi, time]

        const type = row[1];
        const doiTacId = row[6];
        const ten = row[7];
        const sdt = row[8];
        const diaChi = row[9];

        // Load dữ liệu hiện tại
        const [khachHang, nhaCungCap] = await Promise.all([
          readSheet('KHACH_HANG'),
          readSheet('NHA_CUNG_CAP'),
        ]);

        // ================= THÊM KHÁCH HÀNG =================
        if (type === 'BAN') {
          const exists = findById(khachHang, doiTacId, 0);

          if (!exists) {
            await appendRow('KHACH_HANG', [
              doiTacId,
              ten,
              sdt,
              diaChi
            ]);
          }
        }

        // ================= THÊM NHÀ CUNG CẤP =================
        if (type === 'NHAP') {
          const exists = findById(nhaCungCap, doiTacId, 0);

          if (!exists) {
            await appendRow('NHA_CUNG_CAP', [
              doiTacId,
              ten,
              sdt,
              diaChi
            ]);
          }
        }

        // ================= THÊM GIAO DỊCH =================
        await appendRow('GIAO_DICH', row);

        return res.status(200).json({
          success: true,
          message: 'Đã ghi đầy đủ dữ liệu',
        });
      }
    }

    return res.status(400).json({ error: 'Action không hợp lệ' });

  } catch (error: any) {
    console.error('API ERROR:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
