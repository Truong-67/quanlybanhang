import { readSheet, appendRow } from './sheets.js';

// 🔍 tìm theo ID (bỏ header)
function findById(data: any[][], id: string, colIndex: number) {
  return data.slice(1).find(row => row[colIndex] === id);
}

export default async function handler(req: any, res: any) {
  try {
    const { action } = req.query;

    // ================= GET =================
    if (req.method === 'GET') {
      if (action === 'getAll') {

        const [giaoDich, khachHang, nhaCungCap, hangHoa] = await Promise.all([
          readSheet('GIAO_DICH'),
          readSheet('KHACH_HANG'),
          readSheet('NHA_CUNG_CAP'),
          readSheet('HANG_HOA')
        ]);

        return res.status(200).json({
          giaoDich,
          khachHang,
          nhaCungCap,
          hangHoa
        });
      }
    }

    // ================= POST =================
    if (req.method === 'POST') {

      // =========================================
      // 🔥 THÊM KHÁCH HÀNG
      // =========================================
      if (action === 'addKhachHang') {
        const { row } = req.body;

        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Dữ liệu KH không hợp lệ' });
        }

        await appendRow('KHACH_HANG', row);

        return res.status(200).json({
          success: true,
          message: 'Đã thêm khách hàng'
        });
      }

      // =========================================
      // 🔥 THÊM NHÀ CUNG CẤP
      // =========================================
      if (action === 'addNCC') {
        const { row } = req.body;

        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Dữ liệu NCC không hợp lệ' });
        }

        await appendRow('NHA_CUNG_CAP', row);

        return res.status(200).json({
          success: true,
          message: 'Đã thêm nhà cung cấp'
        });
      }

      // =========================================
      // 🔥 THÊM GIAO DỊCH
      // =========================================
      if (action === 'addGiaoDich') {
        const { row } = req.body;

        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Row không hợp lệ' });
        }
      // =========================================
// 🔥 THÊM HÀNG HÓA
// =========================================
if (action === 'addHangHoa') {
  const { row } = req.body;

  // kiểm tra dữ liệu
  if (!row || !Array.isArray(row)) {
    return res.status(400).json({ error: 'Dữ liệu hàng hóa không hợp lệ' });
  }

  /**
   * row format:
   * [MaHang, TenHang, DonVi, GiaNhap, GiaBan]
   */

  await appendRow('HANG_HOA', row);

  return res.status(200).json({
    success: true,
    message: 'Đã thêm hàng hóa'
  });
}
        /**
         * row format:
         * [id, type, maHang, tenHang, soLuong, gia, doiTacId, tenDoiTac, sdt, diaChi, time]
         */

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

        // ================= KHÁCH HÀNG =================
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

        // ================= NHÀ CUNG CẤP =================
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

        // ================= GIAO DỊCH =================
        await appendRow('GIAO_DICH', row);

        return res.status(200).json({
          success: true,
          message: 'Đã ghi giao dịch'
        });
      }
    }

    return res.status(400).json({
      error: 'Action không hợp lệ'
    });

  } catch (error: any) {
    console.error('API ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Lỗi server'
    });
  }
}
