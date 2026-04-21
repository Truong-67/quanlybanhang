/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import {
  ShoppingCart,
  Package,
  Home,
  DollarSign,
  Search,
  Moon,
  Sun,
  Plus,
  X,
  AlertTriangle,
  Pencil,
  Trash2,
  RefreshCcw,
  Users,
  Truck
} from 'lucide-react';
import { inventoryService, Transaction } from './services/inventoryService';

type TabType = 'dashboard' | 'muahang' | 'banhang' | 'kho' | 'taichinh';
type ThemeMode = 'light' | 'dark';

export default function App() {
  const [tab, setTab] = useState<TabType>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>('light');

  const [dsNhap, setDsNhap] = useState<Transaction[]>([]);
  const [dsBan, setDsBan] = useState<Transaction[]>([]);
  const [dsGiaoDich, setDsGiaoDich] = useState<any[]>([]);

  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');

  const [dsKhachHang, setDsKhachHang] = useState<any[]>([]);
  const [dsNhaCungCap, setDsNhaCungCap] = useState<any[]>([]);
  const [dsHangHoa, setDsHangHoa] = useState<any[]>([]);

  const [nhapMaHang, setNhapMaHang] = useState('');
  const [nhapMaNCC, setNhapMaNCC] = useState('');
  const [nhapSoLuong, setNhapSoLuong] = useState('');
  const [nhapGia, setNhapGia] = useState('');

  const [banMaHang, setBanMaHang] = useState('');
  const [banMaKH, setBanMaKH] = useState('');
  const [banSoLuong, setBanSoLuong] = useState('');
  const [banGia, setBanGia] = useState('');

  const [tenKhachHangMoi, setTenKhachHangMoi] = useState('');
  const [tenNCCMoi, setTenNCCMoi] = useState('');
  const [tenHangMoi, setTenHangMoi] = useState('');
  const [donViMoi, setDonViMoi] = useState('');
  const [giaNhapMoi, setGiaNhapMoi] = useState('');
  const [giaBanMoi, setGiaBanMoi] = useState('');
  const [sdtKhachHangMoi, setSdtKhachHangMoi] = useState('');
  const [diaChiKhachHangMoi, setDiaChiKhachHangMoi] = useState('');

  const [sdtNCCMoi, setSdtNCCMoi] = useState('');
  const [diaChiNCCMoi, setDiaChiNCCMoi] = useState('');

  const [error, setError] = useState('');

  // nâng cấp UI
  const [searchHangHoa, setSearchHangHoa] = useState('');
  const [showAddHangModal, setShowAddHangModal] = useState(false);
  const [showEditHangModal, setShowEditHangModal] = useState(false);
  const [editingHang, setEditingHang] = useState<any | null>(null);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  useEffect(() => {
    const savedTheme = localStorage.getItem('sales-theme') as ThemeMode | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sales-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/data?action=getAll');
      const data = await res.json();

      setDsGiaoDich([]);
      setDsNhap([]);
      setDsBan([]);
      setDsKhachHang([]);
      setDsNhaCungCap([]);
      setDsHangHoa([]);

      const parseSheet = (sheet: any[]) => {
        if (!sheet || sheet.length <= 1) return [];
        const headers = sheet[0];
        return sheet.slice(1).map(row => {
          const obj: any = {};
          headers.forEach((h: string, i: number) => {
            obj[h] = row[i];
          });
          return obj;
        });
      };

      if (data.giaoDich) {
        const parsed = parseSheet(data.giaoDich).map(item => ({
          ...item,
          soLuong: Number(item.soLuong),
          gia: Number(item.gia),
          thoiGian: new Date(item.thoiGian)
        }));
        setDsGiaoDich(parsed.reverse());
        setDsNhap(
          parsed
            .filter(gd => gd.type === 'NHAP')
            .map(gd => ({ maHang: gd.maHang, soLuong: gd.soLuong, maNCC: gd.doiTac }))
        );
        setDsBan(
          parsed
            .filter(gd => gd.type === 'BAN')
            .map(gd => ({ maHang: gd.maHang, soLuong: gd.soLuong, maKH: gd.doiTac }))
        );
      }

      if (data.khachHang) {
        const parsedKH = parseSheet(data.khachHang).map((item: any) => ({
          MaKH: item.maKH,
          TenKH: item.tenKH,
          SoDienThoai: item.sdt,
          DiaChi: item.diaChi
        }));
        setDsKhachHang(parsedKH);
        if (parsedKH.length > 0) setBanMaKH(prev => prev || parsedKH[0].MaKH);
      }

      if (data.nhaCungCap) {
        const parsedNCC = parseSheet(data.nhaCungCap).map((item: any) => ({
          MaNCC: item.maNCC,
          TenNCC: item.tenNCC,
          SoDienThoai: item.sdt,
          DiaChi: item.diaChi
        }));
        setDsNhaCungCap(parsedNCC);
        if (parsedNCC.length > 0) setNhapMaNCC(prev => prev || parsedNCC[0].MaNCC);
      }

      if (data.hangHoa) {
        const parsedHH = parseSheet(data.hangHoa).map((item: any) => ({
          MaHang: item.MaHang,
          TenHang: item.TenHang,
          GiaNhap: Number(item.GiaNhap || 0),
          GiaBan: Number(item.GiaBan || 0),
          DonVi: item.DonVi || item.donVi || ''
        }));
        setDsHangHoa(parsedHH);
        if (parsedHH.length > 0) {
          setNhapMaHang(prev => prev || parsedHH[0].MaHang);
          setBanMaHang(prev => prev || parsedHH[0].MaHang);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi tải dữ liệu từ server');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNhap = async () => {
    if (Number(nhapGia) <= 0) {
      setError('Giá nhập phải lớn hơn 0');
      return;
    }
    try {
      const tenH = dsHangHoa.find(h => h.MaHang === nhapMaHang)?.TenHang || nhapMaHang;

      const ncc = dsNhaCungCap.find(n => n.MaNCC === nhapMaNCC);
      const tenN = ncc?.TenNCC || nhapMaNCC;
      const sdtN = ncc?.SoDienThoai || '';
      const diaChiN = ncc?.DiaChi || '';

      const newTransaction = {
        id: Date.now().toString(),
        type: 'NHAP',
        maHang: nhapMaHang,
        tenHang: tenH,
        soLuong: Number(nhapSoLuong),
        gia: Number(nhapGia),
        doiTac: tenN,
        thoiGian: new Date()
      };

      const row = [
        newTransaction.id,
        newTransaction.type,
        newTransaction.maHang,
        newTransaction.tenHang,
        newTransaction.soLuong,
        newTransaction.gia,
        nhapMaNCC,
        tenN,
        sdtN,
        diaChiN,
        newTransaction.thoiGian.toISOString()
      ];

      const res = await fetch('/api/data?action=addGiaoDich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row })
      });

      if (!res.ok) throw new Error('Lỗi lưu giao dịch lên server');

      await loadData();

      setNhapSoLuong('');
      setNhapGia('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBan = async () => {
    if (Number(banGia) <= 0) {
      setError('Giá bán phải lớn hơn 0');
      return;
    }

    try {
      const tk = dsHangHoa.find(h => h.MaHang === banMaHang);
      const tenH = tk?.TenHang || banMaHang;

      const kh = dsKhachHang.find(k => k.MaKH === banMaKH);
      const tenK = kh?.TenKH || banMaKH;
      const sdtK = kh?.SoDienThoai || '';
      const diaChiK = kh?.DiaChi || '';

      const newTransaction = {
        id: Date.now().toString(),
        type: 'BAN',
        maHang: banMaHang,
        tenHang: tenH,
        soLuong: Number(banSoLuong),
        gia: Number(banGia),
        doiTac: tenK,
        thoiGian: new Date()
      };

      const row = [
        newTransaction.id,
        newTransaction.type,
        newTransaction.maHang,
        newTransaction.tenHang,
        newTransaction.soLuong,
        newTransaction.gia,
        banMaKH,
        tenK,
        sdtK,
        diaChiK,
        newTransaction.thoiGian.toISOString()
      ];

      const res = await fetch('/api/data?action=addGiaoDich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row })
      });

      if (!res.ok) throw new Error('Lỗi lưu giao dịch');

      await loadData();

      setBanSoLuong('');
      setBanGia('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleThemKH = async () => {
    if (!tenKhachHangMoi.trim() || !sdtKhachHangMoi.trim() || !diaChiKhachHangMoi.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin khách hàng');
      return;
    }

    try {
      const nextIdNum = dsKhachHang.length + 1;
      const newMaKH = `KH${nextIdNum.toString().padStart(3, '0')}`;

      const row = [
        newMaKH,
        tenKhachHangMoi.trim(),
        sdtKhachHangMoi.trim(),
        diaChiKhachHangMoi.trim()
      ];

      const res = await fetch('/api/data?action=addKhachHang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row })
      });

      if (!res.ok) throw new Error('Lỗi thêm khách hàng');

      await loadData();

      setTenKhachHangMoi('');
      setSdtKhachHangMoi('');
      setDiaChiKhachHangMoi('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleThemNCC = async () => {
    if (!tenNCCMoi.trim() || !sdtNCCMoi.trim() || !diaChiNCCMoi.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin nhà cung cấp');
      return;
    }

    try {
      const nextIdNum = dsNhaCungCap.length + 1;
      const newMaNCC = `NCC${nextIdNum.toString().padStart(3, '0')}`;

      const row = [
        newMaNCC,
        tenNCCMoi.trim(),
        sdtNCCMoi.trim(),
        diaChiNCCMoi.trim()
      ];

      const res = await fetch('/api/data?action=addNCC', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row })
      });

      if (!res.ok) throw new Error('Lỗi thêm NCC');

      await loadData();

      setTenNCCMoi('');
      setSdtNCCMoi('');
      setDiaChiNCCMoi('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleThemHangHoa = async () => {
    if (!tenHangMoi.trim() || !donViMoi.trim()) {
      setError('Nhập tên hàng và đơn vị');
      return;
    }

    try {
      const nextId = dsHangHoa.length + 1;
      const ma = `H${nextId.toString().padStart(3, '0')}`;

      const row = [
        ma,
        tenHangMoi.trim(),
        donViMoi.trim(),
        Number(giaNhapMoi || 0),
        Number(giaBanMoi || 0)
      ];

      const res = await fetch('/api/data?action=addHangHoa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row })
      });

      if (!res.ok) throw new Error('Lỗi thêm hàng hóa');

      await loadData();

      setTenHangMoi('');
      setDonViMoi('');
      setGiaNhapMoi('');
      setGiaBanMoi('');
      setShowAddHangModal(false);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // chuẩn bị UI sửa/xóa; cần backend để lưu thật
  const openEditHang = (item: any) => {
    setEditingHang(item);
    setTenHangMoi(item.TenHang || '');
    setDonViMoi(item.DonVi || '');
    setGiaNhapMoi(String(item.GiaNhap || 0));
    setGiaBanMoi(String(item.GiaBan || 0));
    setShowEditHangModal(true);
  };

  const handleSaveEditHang = async () => {
    setError('Sửa hàng hóa lưu xuống Google Sheet cần bổ sung endpoint update trong data.ts.');
    setShowEditHangModal(false);
  };

  const handleDeleteHang = async (_item: any) => {
    setError('Xóa hàng hóa lưu xuống Google Sheet cần bổ sung endpoint delete trong data.ts.');
  };

  const handleDeleteKH = (maKH: string) => {
    setDsKhachHang(dsKhachHang.filter(kh => kh.MaKH !== maKH));
  };

  const handleDeleteNCC = (maNCC: string) => {
    setDsNhaCungCap(dsNhaCungCap.filter(ncc => ncc.MaNCC !== maNCC));
  };

  const filteredGiaoDich = dsGiaoDich.filter(gd => {
    let isValid = true;
    if (tuNgay) {
      const tu = new Date(tuNgay);
      tu.setHours(0, 0, 0, 0);
      if (gd.thoiGian < tu) isValid = false;
    }
    if (denNgay) {
      const den = new Date(denNgay);
      den.setHours(23, 59, 59, 999);
      if (gd.thoiGian > den) isValid = false;
    }
    return isValid;
  });

  const tongNhap = filteredGiaoDich
    .filter(gd => gd.type === 'NHAP')
    .reduce((sum, current) => sum + current.soLuong * (current.gia || 0), 0);

  const tongBan = filteredGiaoDich
    .filter(gd => gd.type === 'BAN')
    .reduce((sum, current) => sum + current.soLuong, 0);

  const doanhThu = filteredGiaoDich
    .filter(gd => gd.type === 'BAN')
    .reduce((sum, current) => sum + current.soLuong * (current.gia || 0), 0);

  const soGiaoDich = filteredGiaoDich.length;

  const chartNhapVsBan = [
    {
      name: 'Nhập (SL)',
      value: filteredGiaoDich
        .filter(gd => gd.type === 'NHAP')
        .reduce((sum, current) => sum + current.soLuong, 0)
    },
    { name: 'Bán (SL)', value: tongBan }
  ];

  const getChartDoanhThu = () => {
    const data: Record<string, number> = {};
    const banGiaoDich = [...filteredGiaoDich]
      .filter(gd => gd.type === 'BAN')
      .sort((a, b) => a.thoiGian.getTime() - b.thoiGian.getTime());

    banGiaoDich.forEach(gd => {
      const dateStr = `${gd.thoiGian.getDate()}/${gd.thoiGian.getMonth() + 1}`;
      data[dateStr] = (data[dateStr] || 0) + gd.soLuong * (gd.gia || 0);
    });

    return Object.keys(data).map(date => ({ date, value: data[date] }));
  };

  const chartDoanhThu = getChartDoanhThu();

  const getTopKhachHang = () => {
    const data: Record<string, number> = {};
    filteredGiaoDich
      .filter(gd => gd.type === 'BAN')
      .forEach(gd => {
        data[gd.doiTac] = (data[gd.doiTac] || 0) + gd.soLuong * (gd.gia || 0);
      });

    return Object.keys(data)
      .map(name => ({ name, value: data[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const chartTopKhachHang = getTopKhachHang();

  const PIE_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatMoney = (n: number) => `${(n || 0).toLocaleString('vi-VN')}đ`;

  const iconClass = 'w-5 h-5';

  const navClass = (name: TabType) =>
    `flex flex-col items-center justify-center gap-1 text-[11px] font-medium px-2 py-1 rounded-xl transition ${
      tab === name
        ? theme === 'dark'
          ? 'text-indigo-300'
          : 'text-indigo-600'
        : theme === 'dark'
          ? 'text-slate-400'
          : 'text-slate-500'
    }`;

  const filteredHangHoa = useMemo(() => {
    const keyword = searchHangHoa.trim().toLowerCase();
    if (!keyword) return dsHangHoa;
    return dsHangHoa.filter(h => {
      const ton = inventoryService.getTonByMaHang(dsNhap, dsBan, h.MaHang);
      return (
        String(h.MaHang || '').toLowerCase().includes(keyword) ||
        String(h.TenHang || '').toLowerCase().includes(keyword) ||
        String(h.DonVi || '').toLowerCase().includes(keyword) ||
        String(ton).includes(keyword)
      );
    });
  }, [searchHangHoa, dsHangHoa, dsNhap, dsBan]);

  const lowStockItems = useMemo(() => {
    return dsHangHoa.filter(h => {
      const ton = inventoryService.getTonByMaHang(dsNhap, dsBan, h.MaHang);
      return ton <= lowStockThreshold;
    });
  }, [dsHangHoa, dsNhap, dsBan, lowStockThreshold]);

  const bgApp = theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800';
  const cardClass =
    theme === 'dark'
      ? 'bg-slate-900 rounded-3xl shadow-sm border border-slate-800'
      : 'bg-white rounded-3xl shadow-sm border border-slate-200';
  const inputClass =
    theme === 'dark'
      ? 'w-full rounded-xl border border-slate-700 px-3 py-3 bg-slate-900 text-slate-100 placeholder:text-slate-500'
      : 'w-full rounded-xl border border-slate-300 px-3 py-3 bg-slate-50 text-slate-800 placeholder:text-slate-400';
  const mutedText = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const strongMutedText = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const borderSoft = theme === 'dark' ? 'border-slate-800' : 'border-slate-200';

  return (
    <div className={`min-h-screen pb-24 transition-colors ${bgApp}`}>
      <header className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow">
        <div className="px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold leading-none">Sales Management</div>
            <div className="text-xs text-indigo-100 mt-1">Web App</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/20"
              title="Đổi giao diện"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={loadData}
              className="text-xs px-3 py-2 rounded-xl bg-white/15 hover:bg-white/20 flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              <span>Tải lại</span>
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className={`mx-4 mt-4 rounded-2xl border px-4 py-3 text-sm ${
          theme === 'dark'
            ? 'border-red-900 bg-red-950 text-red-300'
            : 'border-red-200 bg-red-50 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* DASHBOARD */}
      {tab === 'dashboard' && (
        <main className="p-4 space-y-4">
          {lowStockItems.length > 0 && (
            <section className={`rounded-3xl border px-4 py-4 ${
              theme === 'dark'
                ? 'border-amber-800 bg-amber-950'
                : 'border-amber-200 bg-amber-50'
            }`}>
              <div className={`flex items-center gap-2 text-sm font-semibold ${
                theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
              }`}>
                <AlertTriangle size={16} />
                <span>Cảnh báo tồn kho thấp ({lowStockItems.length} mặt hàng)</span>
              </div>
              <div className={`mt-2 text-xs ${theme === 'dark' ? 'text-amber-200' : 'text-amber-700'}`}>
                Ngưỡng cảnh báo hiện tại: ≤ {lowStockThreshold}
              </div>
            </section>
          )}

          <section className={`${cardClass} p-4`}>
            <div className={`text-sm font-semibold ${strongMutedText} mb-3`}>Bộ lọc thời gian</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs ${mutedText} mb-1`}>Từ ngày</label>
                <input
                  type="date"
                  className={inputClass.replace('py-3', 'py-2')}
                  value={tuNgay}
                  onChange={e => setTuNgay(e.target.value)}
                />
              </div>
              <div>
                <label className={`block text-xs ${mutedText} mb-1`}>Đến ngày</label>
                <input
                  type="date"
                  className={inputClass.replace('py-3', 'py-2')}
                  value={denNgay}
                  onChange={e => setDenNgay(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <div className={`${cardClass} p-4`}>
              <div className={`text-xs ${mutedText}`}>Tổng nhập</div>
              <div className="text-lg font-bold mt-1">{formatMoney(tongNhap)}</div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className={`text-xs ${mutedText}`}>Tổng bán</div>
              <div className="text-lg font-bold mt-1">{tongBan}</div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className={`text-xs ${mutedText}`}>Doanh thu</div>
              <div className="text-lg font-bold mt-1">{formatMoney(doanhThu)}</div>
            </div>
            <div className={`${cardClass} p-4`}>
              <div className={`text-xs ${mutedText}`}>Số giao dịch</div>
              <div className="text-lg font-bold mt-1">{soGiaoDich}</div>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className={`${cardClass} p-4`}>
              <div className={`text-sm font-semibold ${strongMutedText} mb-3`}>Nhập vs Bán</div>
              <div className="h-64">
                {chartNhapVsBan.every(item => item.value === 0) ? (
                  <div className={`h-full flex items-center justify-center text-sm ${mutedText}`}>
                    Chưa có dữ liệu
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartNhapVsBan} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#475569' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {chartNhapVsBan.map((entry, index) => (
                          <Cell key={index} fill={entry.name.includes('Nhập') ? '#4f46e5' : '#10b981'} />
                        ))}
                        <LabelList
                          dataKey="value"
                          position="top"
                          style={{
                            fontSize: '11px',
                            fill: theme === 'dark' ? '#cbd5e1' : '#475569',
                            fontWeight: 600
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={`${cardClass} p-4`}>
              <div className={`text-sm font-semibold ${strongMutedText} mb-3`}>Doanh thu theo ngày</div>
              <div className="h-64">
                {chartDoanhThu.length === 0 ? (
                  <div className={`h-full flex items-center justify-center text-sm ${mutedText}`}>
                    Chưa có dữ liệu
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartDoanhThu} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: theme === 'dark' ? '#cbd5e1' : '#475569' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(val: number) => `${val.toLocaleString('vi-VN')}đ`}
                        contentStyle={{
                          borderRadius: 12,
                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#10b981' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className={`${cardClass} p-4`}>
              <div className={`text-sm font-semibold ${strongMutedText} mb-3`}>Top khách hàng</div>
              <div className="h-64">
                {chartTopKhachHang.length === 0 ? (
                  <div className={`h-full flex items-center justify-center text-sm ${mutedText}`}>
                    Chưa có dữ liệu
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        formatter={(val: number) => `${val.toLocaleString('vi-VN')}đ`}
                        contentStyle={{
                          borderRadius: 12,
                          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                          background: theme === 'dark' ? '#0f172a' : '#ffffff',
                          color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Pie
                        data={chartTopKhachHang}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="name"
                        label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          fill: theme === 'dark' ? '#cbd5e1' : '#475569'
                        }}
                      >
                        {chartTopKhachHang.map((entry, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
            <div className={`${cardClass} p-4`}>
              <div className={`text-sm font-semibold ${strongMutedText} mb-3`}>Tồn kho</div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {dsHangHoa.map(h => {
                  const ton = inventoryService.getTonByMaHang(dsNhap, dsBan, h.MaHang);
                  const low = ton <= lowStockThreshold;

                  return (
                    <div
                      key={h.MaHang}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                        theme === 'dark'
                          ? low
                            ? 'border-amber-800 bg-amber-950/40'
                            : 'border-slate-800 bg-slate-900'
                          : low
                            ? 'border-amber-200 bg-amber-50'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{h.TenHang}</div>
                        <div className={`text-xs ${mutedText}`}>{h.MaHang}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{ton}</div>
                        <div className={`text-xs mt-1 ${low ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {low ? 'Tồn thấp' : 'Còn hàng'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`${cardClass} p-4`}>
              <div className={`text-sm font-semibold ${strongMutedText} mb-3`}>Lịch sử giao dịch</div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {filteredGiaoDich.length === 0 ? (
                  <div className={`text-sm ${mutedText} py-8 text-center`}>Chưa có giao dịch nào</div>
                ) : (
                  filteredGiaoDich.map(gd => (
                    <div
                      key={gd.id}
                      className={`rounded-2xl border px-4 py-3 ${
                        theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium">{gd.tenHang}</div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                            gd.type === 'NHAP'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {gd.type === 'NHAP' ? 'NHẬP' : 'BÁN'}
                        </span>
                      </div>
                      <div className={`text-sm mt-1 ${mutedText}`}>
                        {gd.soLuong} × {formatMoney(gd.gia || 0)}
                      </div>
                      <div className={`text-xs mt-1 ${mutedText}`}>{gd.doiTac}</div>
                      <div className={`text-xs mt-1 ${mutedText}`}>
                        {gd.thoiGian.toLocaleTimeString('vi-VN')} - {gd.thoiGian.toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* MUA HÀNG */}
      {tab === 'muahang' && (
        <main className="p-4 space-y-4">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${cardClass} p-5`}>
              <div className="text-lg font-bold mb-1">Nhập kho</div>
              <div className={`text-sm ${mutedText} mb-4`}>Ghi nhận hàng nhập từ nhà cung cấp</div>

              <div className="space-y-3">
                <div>
                  <label className={`block text-xs ${mutedText} mb-1`}>Nhà cung cấp</label>
                  <select
                    className={inputClass}
                    value={nhapMaNCC}
                    onChange={e => setNhapMaNCC(e.target.value)}
                  >
                    {dsNhaCungCap.map(ncc => (
                      <option key={ncc.MaNCC} value={ncc.MaNCC}>
                        {ncc.TenNCC} ({ncc.SoDienThoai})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs ${mutedText} mb-1`}>Mặt hàng</label>
                  <select
                    className={inputClass}
                    value={nhapMaHang}
                    onChange={e => setNhapMaHang(e.target.value)}
                  >
                    {dsHangHoa.map(h => (
                      <option key={h.MaHang} value={h.MaHang}>
                        {h.MaHang} - {h.TenHang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs ${mutedText} mb-1`}>Số lượng nhập</label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={nhapSoLuong}
                      onChange={e => setNhapSoLuong(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${mutedText} mb-1`}>Giá nhập</label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={nhapGia}
                      onChange={e => setNhapGia(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  onClick={handleNhap}
                  className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3"
                >
                  Xác nhận nhập hàng
                </button>
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <div className="text-lg font-bold mb-1">Nhà cung cấp</div>
              <div className={`text-sm ${mutedText} mb-4`}>Thêm và xem nhanh danh sách NCC</div>

              <div className="space-y-3">
                <input
                  type="text"
                  className={inputClass}
                  value={tenNCCMoi}
                  onChange={e => setTenNCCMoi(e.target.value)}
                  placeholder="Tên nhà cung cấp"
                />
                <input
                  type="text"
                  className={inputClass}
                  value={sdtNCCMoi}
                  onChange={e => setSdtNCCMoi(e.target.value)}
                  placeholder="Số điện thoại"
                />
                <input
                  type="text"
                  className={inputClass}
                  value={diaChiNCCMoi}
                  onChange={e => setDiaChiNCCMoi(e.target.value)}
                  placeholder="Địa chỉ"
                />
                <button
                  onClick={handleThemNCC}
                  className="w-full rounded-2xl bg-violet-500 hover:bg-violet-600 text-white font-semibold py-3"
                >
                  Thêm nhà cung cấp
                </button>
              </div>

              <div className="mt-5 space-y-2 max-h-60 overflow-y-auto">
                {dsNhaCungCap.map(ncc => (
                  <div
                    key={ncc.MaNCC}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                      theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{ncc.TenNCC}</div>
                      <div className={`text-xs ${mutedText}`}>
                        {ncc.MaNCC} · {ncc.SoDienThoai}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNCC(ncc.MaNCC)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* BÁN HÀNG */}
      {tab === 'banhang' && (
        <main className="p-4 space-y-4">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${cardClass} p-5`}>
              <div className="text-lg font-bold mb-1">Bán hàng</div>
              <div className={`text-sm ${mutedText} mb-4`}>Tạo giao dịch bán cho khách hàng</div>

              <div className="space-y-3">
                <div>
                  <label className={`block text-xs ${mutedText} mb-1`}>Khách hàng</label>
                  <select
                    className={inputClass}
                    value={banMaKH}
                    onChange={e => setBanMaKH(e.target.value)}
                  >
                    {dsKhachHang.map(kh => (
                      <option key={kh.MaKH} value={kh.MaKH}>
                        {kh.TenKH} ({kh.SoDienThoai})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs ${mutedText} mb-1`}>Mặt hàng</label>
                  <select
                    className={inputClass}
                    value={banMaHang}
                    onChange={e => setBanMaHang(e.target.value)}
                  >
                    {dsHangHoa.map(h => (
                      <option key={h.MaHang} value={h.MaHang}>
                        {h.MaHang} - {h.TenHang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs ${mutedText} mb-1`}>Số lượng bán</label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={banSoLuong}
                      onChange={e => setBanSoLuong(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${mutedText} mb-1`}>Giá bán</label>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={banGia}
                      onChange={e => setBanGia(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  onClick={handleBan}
                  className="w-full rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3"
                >
                  Xác nhận bán hàng
                </button>
              </div>
            </div>

            <div className={`${cardClass} p-5`}>
              <div className="text-lg font-bold mb-1">Khách hàng</div>
              <div className={`text-sm ${mutedText} mb-4`}>Thêm và quản lý danh sách khách hàng</div>

              <div className="space-y-3">
                <input
                  type="text"
                  className={inputClass}
                  value={tenKhachHangMoi}
                  onChange={e => setTenKhachHangMoi(e.target.value)}
                  placeholder="Tên khách hàng"
                />
                <input
                  type="text"
                  className={inputClass}
                  value={sdtKhachHangMoi}
                  onChange={e => setSdtKhachHangMoi(e.target.value)}
                  placeholder="Số điện thoại"
                />
                <input
                  type="text"
                  className={inputClass}
                  value={diaChiKhachHangMoi}
                  onChange={e => setDiaChiKhachHangMoi(e.target.value)}
                  placeholder="Địa chỉ"
                />
                <button
                  onClick={handleThemKH}
                  className="w-full rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3"
                >
                  Thêm khách hàng
                </button>
              </div>

              <div className="mt-5 space-y-2 max-h-60 overflow-y-auto">
                {dsKhachHang.map(kh => (
                  <div
                    key={kh.MaKH}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${
                      theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{kh.TenKH}</div>
                      <div className={`text-xs ${mutedText}`}>
                        {kh.MaKH} · {kh.SoDienThoai}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKH(kh.MaKH)}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* KHO */}
      {tab === 'kho' && (
        <main className="p-4 space-y-4">
          <section className={`${cardClass} p-5`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              <div>
                <div className="text-lg font-bold mb-1">Kho hàng</div>
                <div className={`text-sm ${mutedText}`}>Danh mục hàng hóa, tìm kiếm, cảnh báo tồn thấp</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative min-w-[260px]">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`} />
                  <input
                    type="text"
                    value={searchHangHoa}
                    onChange={e => setSearchHangHoa(e.target.value)}
                    placeholder="Tìm mã hàng, tên hàng, đơn vị..."
                    className={`${inputClass} pl-9`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-sm ${mutedText}`}>Ngưỡng cảnh báo</span>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(Number(e.target.value || 0))}
                    className={`${inputClass} w-24 py-2`}
                  />
                </div>

                <button
                  onClick={() => {
                    setTenHangMoi('');
                    setDonViMoi('');
                    setGiaNhapMoi('');
                    setGiaBanMoi('');
                    setShowAddHangModal(true);
                  }}
                  className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-3 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  <span>Thêm hàng</span>
                </button>
              </div>
            </div>

            {lowStockItems.length > 0 && (
              <div className={`mb-4 rounded-2xl border px-4 py-3 ${
                theme === 'dark'
                  ? 'border-amber-800 bg-amber-950'
                  : 'border-amber-200 bg-amber-50'
              }`}>
                <div className={`flex items-center gap-2 text-sm font-semibold ${
                  theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                }`}>
                  <AlertTriangle size={16} />
                  <span>
                    Có {lowStockItems.length} mặt hàng tồn thấp (≤ {lowStockThreshold})
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-3">
                {filteredHangHoa.length === 0 ? (
                  <div className={`rounded-2xl border px-4 py-10 text-center ${
                    theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-white text-slate-400'
                  }`}>
                    Không tìm thấy hàng hóa phù hợp
                  </div>
                ) : (
                  filteredHangHoa.map(h => {
                    const ton = inventoryService.getTonByMaHang(dsNhap, dsBan, h.MaHang);
                    const low = ton <= lowStockThreshold;

                    return (
                      <div
                        key={h.MaHang}
                        className={`rounded-2xl border px-4 py-4 flex items-center justify-between gap-3 ${
                          theme === 'dark'
                            ? low
                              ? 'border-amber-800 bg-amber-950/40'
                              : 'border-slate-800 bg-slate-900'
                            : low
                              ? 'border-amber-200 bg-amber-50'
                              : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-3 rounded-2xl ${
                            theme === 'dark' ? 'bg-slate-800' : 'bg-indigo-50'
                          }`}>
                            <Package size={18} className={theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'} />
                          </div>

                          <div className="min-w-0">
                            <div className="font-medium truncate">{h.TenHang}</div>
                            <div className={`text-xs ${mutedText}`}>
                              {h.MaHang}
                              {h.DonVi ? ` · ${h.DonVi}` : ''}
                            </div>
                            <div className={`text-xs mt-1 ${mutedText}`}>
                              Giá nhập: {formatMoney(h.GiaNhap || 0)} · Giá bán: {formatMoney(h.GiaBan || 0)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-lg">{ton}</div>
                          <div className={`text-xs ${low ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {low ? 'Tồn thấp' : 'Còn hàng'}
                          </div>

                          <div className="flex items-center justify-end gap-1 mt-2">
                            <button
                              onClick={() => openEditHang(h)}
                              className={`p-2 rounded-xl ${
                                theme === 'dark'
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                              title="Sửa hàng"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteHang(h)}
                              className={`p-2 rounded-xl ${
                                theme === 'dark'
                                  ? 'bg-red-950 hover:bg-red-900 text-red-300'
                                  : 'bg-red-50 hover:bg-red-100 text-red-600'
                              }`}
                              title="Xóa hàng"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-3xl border p-4`}>
                <div className="text-base font-bold mb-3">Tổng quan kho</div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`${cardClass} p-4`}>
                    <div className={`text-xs ${mutedText}`}>Tổng mặt hàng</div>
                    <div className="text-lg font-bold mt-1">{dsHangHoa.length}</div>
                  </div>
                  <div className={`${cardClass} p-4`}>
                    <div className={`text-xs ${mutedText}`}>Tồn thấp</div>
                    <div className="text-lg font-bold mt-1">{lowStockItems.length}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className={`text-sm font-semibold ${strongMutedText} mb-2`}>Danh sách cần chú ý</div>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {lowStockItems.length === 0 ? (
                      <div className={`text-sm ${mutedText}`}>Không có mặt hàng nào dưới ngưỡng cảnh báo.</div>
                    ) : (
                      lowStockItems.map(h => {
                        const ton = inventoryService.getTonByMaHang(dsNhap, dsBan, h.MaHang);
                        return (
                          <div
                            key={`warn-${h.MaHang}`}
                            className={`rounded-2xl border px-4 py-3 ${
                              theme === 'dark' ? 'border-amber-800 bg-amber-950/40' : 'border-amber-200 bg-amber-50'
                            }`}
                          >
                            <div className="font-medium">{h.TenHang}</div>
                            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-amber-200' : 'text-amber-700'}`}>
                              {h.MaHang} · Tồn hiện tại: {ton}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className={`mt-4 text-xs ${mutedText}`}>
                  Sửa/Xóa hiện đã có giao diện. Để lưu thật xuống Google Sheet, cần bổ sung endpoint update/delete trong <code>data.ts</code>.
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* TÀI CHÍNH */}
      {tab === 'taichinh' && (
        <main className="p-4 space-y-4">
          <section className={`${cardClass} p-5`}>
            <div className="text-lg font-bold mb-1">Tài chính</div>
            <div className={`text-sm ${mutedText} mb-4`}>Danh sách giao dịch theo thời gian</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div>
                <label className={`block text-xs ${mutedText} mb-1`}>Từ ngày</label>
                <input
                  type="date"
                  className={inputClass}
                  value={tuNgay}
                  onChange={e => setTuNgay(e.target.value)}
                />
              </div>
              <div>
                <label className={`block text-xs ${mutedText} mb-1`}>Đến ngày</label>
                <input
                  type="date"
                  className={inputClass}
                  value={denNgay}
                  onChange={e => setDenNgay(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-2xl border p-4`}>
                <div className={`text-xs ${mutedText}`}>Tổng nhập</div>
                <div className="font-bold mt-1">{formatMoney(tongNhap)}</div>
              </div>
              <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-2xl border p-4`}>
                <div className={`text-xs ${mutedText}`}>Doanh thu</div>
                <div className="font-bold mt-1">{formatMoney(doanhThu)}</div>
              </div>
              <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} rounded-2xl border p-4`}>
                <div className={`text-xs ${mutedText}`}>Số giao dịch</div>
                <div className="font-bold mt-1">{soGiaoDich}</div>
              </div>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto">
              {filteredGiaoDich.length === 0 ? (
                <div className={`text-sm ${mutedText} py-8 text-center`}>Chưa có giao dịch nào</div>
              ) : (
                filteredGiaoDich.map(gd => (
                  <div
                    key={gd.id}
                    className={`rounded-2xl border px-4 py-3 flex items-start justify-between gap-4 ${
                      theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{gd.tenHang}</div>
                      <div className={`text-sm mt-1 ${mutedText}`}>
                        {gd.soLuong} × {formatMoney(gd.gia || 0)}
                      </div>
                      <div className={`text-xs mt-1 ${mutedText}`}>{gd.doiTac}</div>
                      <div className={`text-xs mt-1 ${mutedText}`}>
                        {gd.thoiGian.toLocaleTimeString('vi-VN')} - {gd.thoiGian.toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[11px] font-semibold px-2 py-1 rounded-full ${
                          gd.type === 'NHAP'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {gd.type === 'NHAP' ? 'NHẬP' : 'BÁN'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      )}

      {/* MODAL THÊM HÀNG */}
      {showAddHangModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className={`${cardClass} w-full max-w-lg p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold">Thêm hàng hóa</div>
              <button
                onClick={() => setShowAddHangModal(false)}
                className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên hàng"
                value={tenHangMoi}
                onChange={e => setTenHangMoi(e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Đơn vị (kg, cái...)"
                value={donViMoi}
                onChange={e => setDonViMoi(e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Giá nhập"
                value={giaNhapMoi}
                onChange={e => setGiaNhapMoi(e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Giá bán"
                value={giaBanMoi}
                onChange={e => setGiaBanMoi(e.target.value)}
                className={inputClass}
              />

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowAddHangModal(false)}
                  className={`rounded-2xl py-3 font-semibold ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Hủy
                </button>
                <button
                  onClick={handleThemHangHoa}
                  className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3"
                >
                  Lưu hàng hóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SỬA HÀNG */}
      {showEditHangModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
          <div className={`${cardClass} w-full max-w-lg p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-bold">Sửa hàng hóa</div>
                <div className={`text-xs ${mutedText} mt-1`}>
                  {editingHang?.MaHang || ''}
                </div>
              </div>
              <button
                onClick={() => setShowEditHangModal(false)}
                className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Tên hàng"
                value={tenHangMoi}
                onChange={e => setTenHangMoi(e.target.value)}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Đơn vị"
                value={donViMoi}
                onChange={e => setDonViMoi(e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Giá nhập"
                value={giaNhapMoi}
                onChange={e => setGiaNhapMoi(e.target.value)}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Giá bán"
                value={giaBanMoi}
                onChange={e => setGiaBanMoi(e.target.value)}
                className={inputClass}
              />

              <div className={`rounded-2xl border px-4 py-3 text-sm ${
                theme === 'dark'
                  ? 'border-amber-800 bg-amber-950 text-amber-200'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
              }`}>
                Chức năng sửa/xóa đã có giao diện. Để lưu thật xuống Google Sheet, cần thêm endpoint update/delete trong backend.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowEditHangModal(false)}
                  className={`rounded-2xl py-3 font-semibold ${
                    theme === 'dark' ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEditHang}
                  className="rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3"
                >
                  Lưu chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur ${
        theme === 'dark'
          ? 'border-slate-800 bg-slate-950/95'
          : 'border-slate-200 bg-white/95'
      }`}>
        <div className="max-w-4xl mx-auto grid grid-cols-5 px-2 py-2">
          <button onClick={() => setTab('muahang')} className={navClass('muahang')}>
            <Truck className={iconClass} />
            <span>Mua</span>
          </button>

          <button onClick={() => setTab('banhang')} className={navClass('banhang')}>
            <ShoppingCart className={iconClass} />
            <span>Bán</span>
          </button>

          <button onClick={() => setTab('dashboard')} className={navClass('dashboard')}>
            <Home className={iconClass} />
            <span>Home</span>
          </button>

          <button onClick={() => setTab('taichinh')} className={navClass('taichinh')}>
            <DollarSign className={iconClass} />
            <span>Tiền</span>
          </button>

          <button onClick={() => setTab('kho')} className={navClass('kho')}>
            <Package className={iconClass} />
            <span>Kho</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
