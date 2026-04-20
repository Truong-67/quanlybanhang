/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, LabelList } from 'recharts';
import { inventoryService, Transaction } from './services/inventoryService';

export default function App() {
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

  const [sdtKhachHangMoi, setSdtKhachHangMoi] = useState('');
  const [diaChiKhachHangMoi, setDiaChiKhachHangMoi] = useState('');

  const [sdtNCCMoi, setSdtNCCMoi] = useState('');
  const [diaChiNCCMoi, setDiaChiNCCMoi] = useState('');

  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/data?action=getAll');
      const data = await res.json();
      // 🔥 RESET TOÀN BỘ STATE (QUAN TRỌNG NHẤT)
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
        setDsNhap(parsed.filter(gd => gd.type === 'NHAP').map(gd => ({ maHang: gd.maHang, soLuong: gd.soLuong, maNCC: gd.doiTac })));
        setDsBan(parsed.filter(gd => gd.type === 'BAN').map(gd => ({ maHang: gd.maHang, soLuong: gd.soLuong, maKH: gd.doiTac })));
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
    GiaBan: Number(item.GiaBan || 0)
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
      //inventoryService.nhapHang(dsNhap, { maHang: nhapMaHang, soLuong: Number(nhapSoLuong), maNCC: nhapMaNCC });

      const tenH = hangHoa.find(h => h.MaHang === nhapMaHang)?.TenHang || nhapMaHang;
      const tenN = dsNhaCungCap.find(n => n.MaNCC === nhapMaNCC)?.TenNCC || nhapMaNCC;
      
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
        newTransaction.doiTac,
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
      inventoryService.banHang(dsNhap, dsBan, { maHang: banMaHang, soLuong: Number(banSoLuong), maKH: banMaKH });

      const tk = hangHoa.find(h => h.MaHang === banMaHang);
      const tenH = tk?.TenHang || banMaHang;
      const tenK = dsKhachHang.find(k => k.MaKH === banMaKH)?.TenKH || banMaKH;

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
        newTransaction.doiTac,
        newTransaction.thoiGian.toISOString()
      ];

      const res = await fetch('/api/data?action=addGiaoDich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row })
      });

      if (!res.ok) throw new Error('Lỗi lưu giao dịch lên server');

      await loadData();

      setBanSoLuong('');
      setBanGia('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleThemKH = () => {
    if (!tenKhachHangMoi.trim() || !sdtKhachHangMoi.trim() || !diaChiKhachHangMoi.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin khách hàng');
      return;
    }
    const nextIdNum = dsKhachHang.length + 1;
    const newMaKH = `KH${nextIdNum.toString().padStart(3, '0')}`;
    const newKH = { MaKH: newMaKH, TenKH: tenKhachHangMoi, SoDienThoai: sdtKhachHangMoi, DiaChi: diaChiKhachHangMoi };
    setDsKhachHang([...dsKhachHang, newKH]);
    setTenKhachHangMoi('');
    setSdtKhachHangMoi('');
    setDiaChiKhachHangMoi('');
    setError('');
  };

  const handleThemNCC = () => {
    if (!tenNCCMoi.trim() || !sdtNCCMoi.trim() || !diaChiNCCMoi.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin nhà cung cấp');
      return;
    }
    const nextIdNum = dsNhaCungCap.length + 1;
    const newMaNCC = `NCC${nextIdNum.toString().padStart(3, '0')}`;
    const newNCC = { MaNCC: newMaNCC, TenNCC: tenNCCMoi, SoDienThoai: sdtNCCMoi, DiaChi: diaChiNCCMoi };
    setDsNhaCungCap([...dsNhaCungCap, newNCC]);
    setTenNCCMoi('');
    setSdtNCCMoi('');
    setDiaChiNCCMoi('');
    setError('');
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

  const tongNhap = filteredGiaoDich.filter(gd => gd.type === 'NHAP').reduce((sum, current) => sum + (current.soLuong * (current.gia || 0)), 0);
  const tongBan = filteredGiaoDich.filter(gd => gd.type === 'BAN').reduce((sum, current) => sum + current.soLuong, 0);
  
  const doanhThu = filteredGiaoDich.filter(gd => gd.type === 'BAN').reduce((sum, current) => {
    return sum + (current.soLuong * (current.gia || 0));
  }, 0);

  const soGiaoDich = filteredGiaoDich.length;

  const chartNhapVsBan = [
    { name: 'Nhập (SL)', value: filteredGiaoDich.filter(gd => gd.type === 'NHAP').reduce((sum, current) => sum + current.soLuong, 0) },
    { name: 'Bán (SL)', value: tongBan }
  ];

  const getChartDoanhThu = () => {
    const data: Record<string, number> = {};
    const banGiaoDich = [...filteredGiaoDich].filter(gd => gd.type === 'BAN').sort((a, b) => a.thoiGian.getTime() - b.thoiGian.getTime());
    banGiaoDich.forEach(gd => {
      const dateStr = `${gd.thoiGian.getDate()}/${gd.thoiGian.getMonth() + 1}`;
      data[dateStr] = (data[dateStr] || 0) + (gd.soLuong * (gd.gia || 0));
    });
    return Object.keys(data).map(date => ({ date, value: data[date] }));
  };
  const chartDoanhThu = getChartDoanhThu();

  const getTopKhachHang = () => {
    const data: Record<string, number> = {};
    filteredGiaoDich.filter(gd => gd.type === 'BAN').forEach(gd => {
      data[gd.doiTac] = (data[gd.doiTac] || 0) + (gd.soLuong * (gd.gia || 0));
    });
    return Object.keys(data)
      .map(name => ({ name, value: data[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };
  const chartTopKhachHang = getTopKhachHang();
  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans">
      <header className="px-8 py-5 bg-white border-b border-[#E2E8F0] flex justify-between items-center">
        <h1 className="text-[18px] font-bold tracking-[-0.02em] uppercase text-[#0F172A]">
          Sales Management <span className="text-[#64748B] font-light">System</span>
        </h1>
        <div className="bg-[#E2E8F0] px-2.5 py-1 rounded-md text-[12px] font-semibold text-[#1E293B]">
          Frontend Local Mode
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <main className="flex-1 p-6 flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-65px)] overflow-hidden">
        
        {/* LEFT COLUMN - 70% */}
        <div className="w-full lg:w-[70%] flex flex-col gap-6 h-full overflow-y-auto pr-1">
          
          {/* Dashboard Controls */}
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 flex flex-col sm:flex-row gap-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 items-center justify-between">
            <div className="text-[14px] font-semibold text-[#64748B] uppercase tracking-[0.05em] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              Bộ lọc
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold text-[#475569]">Từ ngày</label>
                <input type="date" className="px-3 py-2 border-[1.5px] border-[#E2E8F0] rounded-lg text-[13px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500" value={tuNgay} onChange={(e) => setTuNgay(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-semibold text-[#475569]">Đến ngày</label>
                <input type="date" className="px-3 py-2 border-[1.5px] border-[#E2E8F0] rounded-lg text-[13px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500" value={denNgay} onChange={(e) => setDenNgay(e.target.value)} />
              </div>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-l-4 border-l-blue-500">
              <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">Tổng nhập</div>
              <div className="text-[24px] font-bold text-[#1E293B] mt-1">{tongNhap.toLocaleString()}đ</div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-l-4 border-l-green-500">
              <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">Tổng bán</div>
              <div className="text-[24px] font-bold text-[#1E293B] mt-1">{tongBan}</div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-l-4 border-l-purple-500">
              <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">Doanh thu</div>
              <div className="text-[24px] font-bold text-[#1E293B] mt-1">{doanhThu.toLocaleString()}đ</div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border-l-4 border-l-orange-500">
              <div className="text-[12px] font-semibold text-[#64748B] uppercase tracking-wide">Số giao dịch</div>
              <div className="text-[24px] font-bold text-[#1E293B] mt-1">{soGiaoDich}</div>
            </div>
          </div>

          {/* Thống kê (Charts) */}
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 flex flex-col shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
            <div className="text-[14px] font-semibold mb-5 text-[#64748B] uppercase tracking-[0.05em] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path></svg>
              Thống kê
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Chart 1: BarChart - Nhập vs Bán */}
              <div className="flex flex-col border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC]">
                <div className="text-[12px] font-semibold text-[#64748B] mb-4 text-center">Số lượng Nhập vs Bán</div>
                <div className="h-[200px] w-full relative">
                  {chartNhapVsBan.every(item => item.value === 0) ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[#94A3B8]">Chưa có dữ liệu</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartNhapVsBan} margin={{ top: 20 }}>
                        <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748B'}} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={40}>
                          {chartNhapVsBan.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name.includes('Nhập') ? '#3B82F6' : '#10B981'} />
                          ))}
                          <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fill: '#64748B', fontWeight: 600 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 2: LineChart - Doanh thu theo ngày */}
              <div className="flex flex-col border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC]">
                <div className="text-[12px] font-semibold text-[#64748B] mb-4 text-center">Doanh thu theo ngày</div>
                <div className="h-[200px] w-full relative">
                  {chartDoanhThu.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[#94A3B8]">Chưa có dữ liệu</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartDoanhThu} margin={{ top: 20 }}>
                        <XAxis dataKey="date" tick={{fontSize: 11, fill: '#64748B'}} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(val: number) => val.toLocaleString('vi-VN') + 'đ'} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#E2E8F0', strokeWidth: 2, strokeDasharray: '4 4' }} />
                        <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981'}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Chart 3: PieChart - Top khách hàng */}
              <div className="flex flex-col border border-[#E2E8F0] rounded-xl p-4 bg-[#F8FAFC]">
                <div className="text-[12px] font-semibold text-[#64748B] mb-4 text-center">Top Doanh thu Khách hàng</div>
                <div className="h-[200px] w-full relative">
                  {chartTopKhachHang.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[13px] text-[#94A3B8]">Chưa có dữ liệu</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip formatter={(val: number) => val.toLocaleString('vi-VN') + 'đ'} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Pie
                          data={chartTopKhachHang}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                          nameKey="name"
                          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          style={{ fontSize: '11px', fontWeight: 600, fill: '#475569' }}
                        >
                          {chartTopKhachHang.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tồn Kho */}
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 flex flex-col shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 max-h-[50vh]">
            <div className="text-[14px] font-semibold mb-5 text-[#64748B] uppercase tracking-[0.05em] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
              Tình trạng tồn kho
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full border-collapse relative">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">MÃ HÀNG</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">TÊN SẢN PHẨM</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">SỐ LƯỢNG TỒN</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {hangHoa.map(h => {
                    const ton = inventoryService.getTonByMaHang(dsNhap, dsBan, h.MaHang);
  
                    return (
                      <tr key={h.MaHang}>
                        <td className="py-4 text-[14px] text-[#1E293B] border-b border-[#F1F5F9]">{h.MaHang}</td>
                        <td className="py-4 text-[14px] text-[#1E293B] border-b border-[#F1F5F9]">{h.TenHang}</td>
                        <td className="py-4 text-[16px] font-bold font-mono text-[#1E293B] border-b border-[#F1F5F9]">{ton}</td>
                        <td className="py-4 border-b border-[#F1F5F9]">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${ton > 0 ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEF9C3] text-[#854D0E]'}`}>
                            {ton > 0 ? 'CÒN HÀNG' : 'SẮP HẾT'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lịch Sử Giao Dịch */}
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 flex flex-col shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 max-h-[50vh]">
            <div className="text-[14px] font-semibold mb-5 text-[#64748B] uppercase tracking-[0.05em] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Lịch sử giao dịch
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full border-collapse relative">
                <thead className="sticky top-0 bg-white">
                  <tr>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">THỜI GIAN</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">LOẠI</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">MẶT HÀNG</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">SỐ LƯỢNG</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">GIÁ</th>
                    <th className="text-left text-[12px] font-normal text-[#94A3B8] pb-3 border-b border-[#F1F5F9] uppercase">ĐỐI TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGiaoDich.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-[13px] text-[#94A3B8] border-b border-[#F1F5F9]">
                        Chưa có giao dịch nào
                      </td>
                    </tr>
                  ) : (
                    filteredGiaoDich.map(gd => (
                      <tr key={gd.id}>
                        <td className="py-3 text-[13px] text-[#475569] border-b border-[#F1F5F9]">
                          {gd.thoiGian.toLocaleTimeString('vi-VN')} - {gd.thoiGian.toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3 border-b border-[#F1F5F9]">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${gd.type === 'NHAP' ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'bg-[#FCE7F3] text-[#9D174D]'}`}>
                            {gd.type === 'NHAP' ? 'NHẬP' : 'BÁN'}
                          </span>
                        </td>
                        <td className="py-3 text-[13px] text-[#1E293B] border-b border-[#F1F5F9]">{gd.tenHang}</td>
                        <td className="py-3 text-[14px] font-semibold font-mono text-[#1E293B] border-b border-[#F1F5F9]">{gd.soLuong}</td>
                        <td className="py-3 text-[14px] font-semibold font-mono text-[#1E293B] border-b border-[#F1F5F9]">{gd.gia?.toLocaleString('vi-VN')}đ</td>
                        <td className="py-3 text-[13px] text-[#475569] border-b border-[#F1F5F9]">{gd.doiTac}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Danh Sách Đối Tác Wrapper */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 shrink-0">
            {/* DS KH */}
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col max-h-[40vh]">
                <div className="text-[13px] font-semibold mb-3 text-[#475569] uppercase tracking-[0.05em]">Danh sách khách hàng</div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <table className="w-full border-collapse relative">
                    <thead className="sticky top-0 bg-white">
                      <tr>
                        <th className="text-left text-[11px] font-normal text-[#94A3B8] pb-2 border-b border-[#F1F5F9] uppercase">MÃ KH</th>
                        <th className="text-left text-[11px] font-normal text-[#94A3B8] pb-2 border-b border-[#F1F5F9] uppercase">TÊN KH</th>
                        <th className="text-right text-[11px] font-normal text-[#94A3B8] pb-2 border-b border-[#F1F5F9] uppercase">HÀNH ĐỘNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsKhachHang.map(kh => (
                        <tr key={kh.MaKH}>
                          <td className="py-2 text-[12px] text-[#1E293B] border-b border-[#F1F5F9]">{kh.MaKH}</td>
                          <td className="py-2 text-[12px] text-[#1E293B] border-b border-[#F1F5F9]">{kh.TenKH}</td>
                          <td className="py-2 text-right border-b border-[#F1F5F9]">
                            <button onClick={() => handleDeleteKH(kh.MaKH)} className="text-red-500 hover:text-red-700 text-[11px] font-semibold cursor-pointer border-none bg-transparent">Xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>

            {/* DS NCC */}
            <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] flex flex-col max-h-[40vh]">
                <div className="text-[13px] font-semibold mb-3 text-[#475569] uppercase tracking-[0.05em]">Danh sách nhà cung cấp</div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  <table className="w-full border-collapse relative">
                    <thead className="sticky top-0 bg-white">
                      <tr>
                        <th className="text-left text-[11px] font-normal text-[#94A3B8] pb-2 border-b border-[#F1F5F9] uppercase">MÃ NCC</th>
                        <th className="text-left text-[11px] font-normal text-[#94A3B8] pb-2 border-b border-[#F1F5F9] uppercase">TÊN NCC</th>
                        <th className="text-right text-[11px] font-normal text-[#94A3B8] pb-2 border-b border-[#F1F5F9] uppercase">HÀNH ĐỘNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsNhaCungCap.map(ncc => (
                        <tr key={ncc.MaNCC}>
                          <td className="py-2 text-[12px] text-[#1E293B] border-b border-[#F1F5F9]">{ncc.MaNCC}</td>
                          <td className="py-2 text-[12px] text-[#1E293B] border-b border-[#F1F5F9]">{ncc.TenNCC}</td>
                          <td className="py-2 text-right border-b border-[#F1F5F9]">
                            <button onClick={() => handleDeleteNCC(ncc.MaNCC)} className="text-red-500 hover:text-red-700 text-[11px] font-semibold cursor-pointer border-none bg-transparent">Xóa</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - 30% */}
        <div className="w-full lg:w-[30%] flex flex-col gap-6 h-full overflow-y-auto pr-1 pb-6 custom-scrollbar shrink-0">
          
          {/* Form Nhập Hàng */}
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 flex flex-col shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
            <div className="text-[14px] font-semibold mb-5 text-[#64748B] uppercase tracking-[0.05em] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
              Nhập hàng mới
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Chọn nhà cung cấp</label>
                <select
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={nhapMaNCC}
                  onChange={(e) => setNhapMaNCC(e.target.value)}
                >
                  {dsNhaCungCap.map(ncc => (
                    <option key={ncc.MaNCC} value={ncc.MaNCC}>{ncc.TenNCC} ({ncc.SoDienThoai})</option>
                  ))}
                </select>
                <div className="mt-1 text-[12px] text-[#64748B]">Mã NCC: {nhapMaNCC}</div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Chọn mặt hàng</label>
                <select
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={nhapMaHang}
                  onChange={(e) => setNhapMaHang(e.target.value)}
                >
                  {hangHoa.map(h => (
                    <option key={h.MaHang} value={h.MaHang}>{h.MaHang} - {h.TenHang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Số lượng nhập</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={nhapSoLuong}
                  onChange={(e) => setNhapSoLuong(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Giá nhập</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={nhapGia}
                  onChange={(e) => setNhapGia(e.target.value)}
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleNhap}
                className="w-full p-3 bg-[#10B981] hover:bg-[#059669] text-white border-none rounded-lg font-semibold text-[14px] mt-2 transition-colors cursor-pointer"
              >
                Xác nhận nhập
              </button>
            </div>
          </div>

          {/* Form Bán Hàng */}
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 flex flex-col shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
            <div className="text-[14px] font-semibold mb-5 text-[#64748B] uppercase tracking-[0.05em] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              Giao dịch bán hàng
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Chọn khách hàng</label>
                <select
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={banMaKH}
                  onChange={(e) => setBanMaKH(e.target.value)}
                >
                  {dsKhachHang.map(kh => (
                    <option key={kh.MaKH} value={kh.MaKH}>{kh.TenKH} ({kh.SoDienThoai})</option>
                  ))}
                </select>
                <div className="mt-1 text-[12px] text-[#64748B]">Mã KH: {banMaKH}</div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Mặt hàng</label>
                <select
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={banMaHang}
                  onChange={(e) => setBanMaHang(e.target.value)}
                >
                  {hangHoa.map(h => (
                    <option key={h.MaHang} value={h.MaHang}>{h.MaHang} - {h.TenHang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Số lượng bán</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={banSoLuong}
                  onChange={(e) => setBanSoLuong(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Giá bán</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                  value={banGia}
                  onChange={(e) => setBanGia(e.target.value)}
                  placeholder="0"
                />
              </div>
              <button
                onClick={handleBan}
                className="w-full p-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none rounded-lg font-semibold text-[14px] mt-2 transition-colors cursor-pointer"
              >
                Xác nhận bán
              </button>
            </div>
          </div>

          {/* Form Thêm Đối Tác */}
          <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 flex flex-col shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0">
            <div className="text-[14px] font-semibold mb-5 text-[#64748B] uppercase tracking-[0.05em] flex items-center gap-2">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"></path></svg>
              Quản lý đối tác
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Thêm khách hàng</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                      value={tenKhachHangMoi}
                      onChange={(e) => setTenKhachHangMoi(e.target.value)}
                      placeholder="Nhập tên KH"
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                      value={sdtKhachHangMoi}
                      onChange={(e) => setSdtKhachHangMoi(e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                      value={diaChiKhachHangMoi}
                      onChange={(e) => setDiaChiKhachHangMoi(e.target.value)}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
                <button
                  onClick={handleThemKH}
                  className="w-full p-3 bg-[#6366f1] hover:bg-[#4f46e5] text-white border-none rounded-lg font-semibold text-[14px] mt-2 transition-colors cursor-pointer"
                >
                  Thêm KH
                </button>
              </div>
              
              <div className="w-full h-px bg-[#E2E8F0]"></div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold mb-[6px] text-[#475569]">Thêm nhà cung cấp</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                      value={tenNCCMoi}
                      onChange={(e) => setTenNCCMoi(e.target.value)}
                      placeholder="Nhập tên NCC"
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                      value={sdtNCCMoi}
                      onChange={(e) => setSdtNCCMoi(e.target.value)}
                      placeholder="Nhập số điện thoại"
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2.5 border-[1.5px] border-[#E2E8F0] rounded-lg text-[14px] bg-[#F8FAFC] focus:outline-none focus:border-blue-500 transition-colors"
                      value={diaChiNCCMoi}
                      onChange={(e) => setDiaChiNCCMoi(e.target.value)}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
                <button
                  onClick={handleThemNCC}
                  className="w-full p-3 bg-[#a855f7] hover:bg-[#9333ea] text-white border-none rounded-lg font-semibold text-[14px] mt-2 transition-colors cursor-pointer"
                >
                  Thêm NCC
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
