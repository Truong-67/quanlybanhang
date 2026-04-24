import {
  readSheet,
  appendRow,
  updateRowById,
  deleteRowById
} from './sheets.js';

// ================= CACHE =================
let cacheData: any = null;
let cacheTime = 0;
const CACHE_TTL = 10000; // 10 giây

function clearCache() {
  cacheData = null;
  cacheTime = 0;
}

// ================= HELPER =================
function findById(data: any[][], id: string, colIndex: number) {
  return data.slice(1).find(row => row[colIndex] === id);
}

// ================= API =================
export default async function handler(req: any, res: any) {
  try {
    const { action } = req.query;

    // ================= GET =================
    if (req.method === 'GET') {

      if (action === 'getAll') {
        const now = Date.now();

        // 🔥 CACHE HIT
        if (cacheData && (now - cacheTime < CACHE_TTL)) {
          return res.status(200).json(cacheData);
        }

        // 🔥 LOAD DATA (PARALLEL)
        const [giaoDich, khachHang, nhaCungCap, hangHoa] = await Promise.all([
          readSheet('GIAO_DICH'),
          readSheet('KHACH_HANG'),
          readSheet('NHA_CUNG_CAP'),
          readSheet('HANG_HOA')
        ]);

        const result = {
          giaoDich,
          khachHang,
          nhaCungCap,
          hangHoa
        };

        // 🔥 SAVE CACHE
        cacheData = result;
        cacheTime = now;

        return res.status(200).json(result);
      }

      return res.status(400).json({
        error: 'Action GET không hợp lệ'
      });
    }

    // ================= POST =================
    if (req.method === 'POST') {
      const { row, id } = req.body || {};

      // ================= KHÁCH HÀNG =================
      if (action === 'addKhachHang') {
        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Dữ liệu KH không hợp lệ' });
        }

        await appendRow('KHACH_HANG', row);
        clearCache();

        return res.status(200).json({
          success: true,
          message: 'Đã thêm khách hàng'
        });
      }

      // ================= NCC =================
      if (action === 'addNCC') {
        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Dữ liệu NCC không hợp lệ' });
        }

        await appendRow('NHA_CUNG_CAP', row);
        clearCache();

        return res.status(200).json({
          success: true,
          message: 'Đã thêm nhà cung cấp'
        });
      }

      // ================= HÀNG HÓA =================
      if (action === 'addHangHoa') {
        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Dữ liệu hàng hóa không hợp lệ' });
        }

        await appendRow('HANG_HOA', row);
        clearCache();

        return res.status(200).json({
          success: true,
          message: 'Đã thêm hàng hóa'
        });
      }

      // ================= UPDATE HÀNG =================
      if (action === 'updateHangHoa') {
        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Dữ liệu update không hợp lệ' });
        }

        await updateRowById('HANG_HOA', row[0], 0, row);
        clearCache();

        return res.status(200).json({
          success: true,
          message: 'Đã cập nhật hàng hóa'
        });
      }

      // ================= DELETE HÀNG =================
      if (action === 'deleteHangHoa') {
        if (!id) {
          return res.status(400).json({ error: 'Thiếu ID xóa' });
        }

        await deleteRowById('HANG_HOA', id, 0);
        clearCache();

        return res.status(200).json({
          success: true,
          message: 'Đã xóa hàng hóa'
        });
      }

      // ================= GIAO DỊCH =================
      if (action === 'addGiaoDich') {
        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Row không hợp lệ' });
        }

        const type = row[1];
        const doiTacId = row[6];
        const ten = row[7];
        const sdt = row[8];
        const diaChi = row[9];

        const [khachHang, nhaCungCap] = await Promise.all([
          readSheet('KHACH_HANG'),
          readSheet('NHA_CUNG_CAP')
        ]);

        // KHÁCH HÀNG
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

        // NCC
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

        await appendRow('GIAO_DICH', row);
        clearCache();

        return res.status(200).json({
          success: true,
          message: 'Đã ghi giao dịch'
        });
      }

      return res.status(400).json({
        error: 'Action POST không hợp lệ'
      });
    }

    return res.status(405).json({
      error: 'Method không được hỗ trợ'
    });

  } catch (error: any) {
    console.error('API ERROR:', error);

    return res.status(500).json({
      error: error.message || 'Lỗi server'
    });
  }
}
