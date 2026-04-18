import { readSheet, appendRow } from './sheets';

export default async function handler(req: any, res: any) {
  try {
    const { action } = req.query;

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

    if (req.method === 'POST') {
      if (action === 'addGiaoDich') {
        const { row } = req.body;

        if (!row || !Array.isArray(row)) {
          return res.status(400).json({ error: 'Request body must contain a "row" array' });
        }

        await appendRow('GIAO_DICH', row);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Thêm dòng thành công vào sheet GIAO_DICH' 
        });
      }
    }

    // Nếu không khớp method hay action nào
    return res.status(400).json({ error: 'Action hoặc Method không hợp lệ' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message || 'Lỗi server nội bộ',
      details: 'Vui lòng kiểm tra lại cấu hình hoặc dữ liệu đầu vào'
    });
  }
}
