import { hangHoa } from '../data/store';

export type Transaction = { maHang: string, soLuong: number, maNCC?: string, maKH?: string };

export const inventoryService = {
  getTenHang(maHang: string): string {
    const hang = hangHoa.find(h => h.MaHang === maHang);
    return hang ? hang.TenHang : 'Không rõ';
  },
  getTonByMaHang(dsNhap: Transaction[], dsBan: Transaction[], maHang: string): number {
    const tongNhap = dsNhap.filter(n => n.maHang === maHang).reduce((sum, item) => sum + item.soLuong, 0);
    const tongBan = dsBan.filter(b => b.maHang === maHang).reduce((sum, item) => sum + item.soLuong, 0);
    return tongNhap - tongBan;
  },
  nhapHang(dsNhap: Transaction[], data: { maHang: string, soLuong: number, maNCC?: string }) {
    if (data.soLuong <= 0) throw new Error('Số lượng nhập phải lớn hơn 0');
    return [...dsNhap, { maHang: data.maHang, soLuong: data.soLuong, maNCC: data.maNCC }];
  },
  banHang(dsNhap: Transaction[], dsBan: Transaction[], data: { maHang: string, soLuong: number, maKH?: string }) {
    if (data.soLuong <= 0) throw new Error('Số lượng bán phải lớn hơn 0');
    const ton = this.getTonByMaHang(dsNhap, dsBan, data.maHang);
    if (data.soLuong > ton) {
        throw new Error(`Không đủ hàng tồn`);
    }
    return [...dsBan, { maHang: data.maHang, soLuong: data.soLuong, maKH: data.maKH }];
  }
};
