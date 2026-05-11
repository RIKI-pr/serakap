import React, { useState, useMemo, useEffect, useRef } from "react";
import { GoogleGenAI, Type } from "@google/genai";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Wallet,
  Plus,
  Search,
  Bell,
  ChevronLeft,
  PieChart,
  Home,
  ListTodo,
  User,
  Building2,
  Smartphone,
  Banknote,
  Briefcase,
  Coffee,
  ShoppingBag,
  Car,
  Film,
  Wifi,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Clock,
  Folder,
  ChevronRight,
  Settings,
  ShieldCheck,
  Lock,
  LogOut,
  Target,
  Calendar as CalendarIcon,
  FileText,
  AlertCircle,
  Camera,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  BarChart3,
  Archive,
  X,
  CreditCard,
  MapPin,
  AlignLeft,
  ChevronDown,
  Filter,
  Maximize,
  Minimize,
  Sunrise,
  Sun,
  Moon,
  Mountain,
  Globe,
  BookOpen,
  Bike,
  Footprints,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart as RePieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";
import { Map, MapMarker, MarkerContent, MarkerLabel, MapRoute, MapControls, useMap as useMapLibre } from "./components/ui/map";
import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
} from "./lib/firebase";

// ==========================================
// 1. UTILS & DATA HELPERS
// ==========================================
const cn = (...classes) => classes.filter(Boolean).join(" ");

const formatDate = (dateString: any) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  if (amount === undefined || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCompactCurrency = (amount) => {
  if (amount === undefined || isNaN(amount)) return "Rp 0";
  if (Math.abs(amount) >= 1000000000)
    return `Rp ${(amount / 1000000000).toFixed(1)} M`;
  if (Math.abs(amount) >= 1000000)
    return `Rp ${(amount / 1000000).toFixed(1)} jt`;
  if (Math.abs(amount) >= 1000) return `Rp ${(amount / 1000).toFixed(0)}k`;
  return formatCurrency(amount);
};

const getPercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return Math.min(Math.round((part / total) * 100), 100);
};

// ==========================================
// 2. INITIAL DUMMY DATA (FULL)
// ==========================================
const INITIAL_DATA = {
  user: {
    name: "Riki",
    email: "riki@example.com",
    job: "Product Designer",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    tier: "Pro Member",
  },
  summary: {
    incomeMonth: 15500000,
    expenseMonth: 4200000,
    lastMonthIncome: 14000000,
    lastMonthExpense: 5000000,
  },
  pockets: [
    {
      id: "p1",
      name: "SeaBank",
      type: "Tabungan",
      balance: 15300000,
      in: 12000000,
      out: 1500000,
      trxCount: 12,
      lastTrx: "2 Jam lalu",
      status: "Aman",
      color: "text-blue-500",
      bg: "bg-blue-50",
      icon: "building",
    },
    {
      id: "p2",
      name: "Bank BSI",
      type: "Operasional",
      balance: 8500000,
      in: 3000000,
      out: 2100000,
      trxCount: 28,
      lastTrx: "Hari ini",
      status: "Paling Aktif",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      icon: "building",
    },
    {
      id: "p3",
      name: "DANA",
      type: "E-Wallet",
      balance: 1200000,
      in: 500000,
      out: 600000,
      trxCount: 15,
      lastTrx: "Kemarin",
      status: "Boros",
      color: "text-sky-500",
      bg: "bg-sky-50",
      icon: "smartphone",
    },
  ],
  transactions: [
    {
      id: "t1",
      title: "Gaji Freelance UI/UX",
      amount: 12500000,
      type: "income",
      date: new Date().toISOString(),
      time: "09:00",
      category: "Pekerjaan",
      method: "Transfer Bank",
      pocket: "SeaBank",
      icon: "briefcase",
      isToday: true,
      important: true,
      dateInt: 4,
    },
    {
      id: "t2",
      title: "Makan Siang Nasi Padang",
      amount: 45000,
      type: "expense",
      date: new Date().toISOString(),
      time: "12:30",
      category: "Makan",
      method: "QRIS",
      pocket: "DANA",
      icon: "coffee",
      isToday: true,
      important: false,
      dateInt: 4,
    },
    {
      id: "t3",
      title: "Topup E-Money",
      amount: 100000,
      type: "transfer",
      date: new Date().toISOString(),
      time: "14:00",
      category: "Transportasi",
      method: "Transfer",
      pocket: "Bank BSI",
      icon: "car",
      isToday: true,
      important: false,
      dateInt: 4,
    },
    {
      id: "t4",
      title: "Langganan Netflix",
      amount: 185000,
      type: "expense",
      date: "2026-05-03T19:30:00",
      time: "19:30",
      category: "Tagihan",
      method: "Auto-Debit",
      pocket: "SeaBank",
      icon: "film",
      isToday: false,
      routine: true,
      dateInt: 3,
    },
    {
      id: "t6",
      title: "Belanja Bulanan",
      amount: 1850000,
      type: "expense",
      date: "2026-05-02T10:00:00",
      time: "10:00",
      category: "Belanja",
      method: "Debit Card",
      pocket: "Bank BSI",
      icon: "shopping-bag",
      isToday: false,
      important: true,
      dateInt: 2,
    },
  ],
  budgets: [
    {
      id: "b1",
      name: "Makan & Minum",
      category: "Konsumsi",
      spent: 1800000,
      limit: 2000000,
      period: "Bulan Ini",
      color: "text-orange-500",
      bg: "bg-orange-50",
      icon: "coffee",
    },
    {
      id: "b2",
      name: "Transportasi",
      category: "Transport",
      spent: 400000,
      limit: 1000000,
      period: "Bulan Ini",
      color: "text-violet-500",
      bg: "bg-violet-50",
      icon: "car",
    },
    {
      id: "b3",
      name: "Tagihan & Utilitas",
      category: "Tagihan",
      spent: 2600000,
      limit: 2500000,
      period: "Bulan Ini",
      color: "text-rose-500",
      bg: "bg-rose-50",
      icon: "wifi",
    },
  ],
  targets: [
    {
      id: "tg1",
      name: "Dana Darurat",
      target: 50000000,
      current: 20000000,
      startDate: "2026-01-01",
      endDate: "2027-01-01",
      status: "Dalam Proses",
      pocket: "SeaBank",
    },
    {
      id: "tg2",
      name: "Laptop Baru",
      target: 25000000,
      current: 23500000,
      startDate: "2026-02-01",
      endDate: "2026-06-01",
      status: "Hampir Tercapai",
      pocket: "SeaBank",
    },
  ],
  tasks: [
    {
      id: "tk0",
      title: "Follow up Email Vendor",
      date: "2026-05-02T09:00:00",
      time: "10:00",
      status: "belum",
      priority: "tinggi",
      category: "Pekerjaan",
      isToday: false,
      desc: "Tanyakan progres cetak stiker.",
      dateInt: 2,
    },
    {
      id: "tk1",
      title: "Kirim Invoice Klien",
      date: new Date().toISOString(),
      time: "09:00",
      status: "selesai",
      priority: "tinggi",
      category: "Keuangan",
      isToday: true,
      desc: "Invoice proyek Redesign App.",
      dateInt: 4,
    },
    {
      id: "tk2",
      title: "Bayar Tagihan Internet",
      date: new Date().toISOString(),
      time: "14:00",
      status: "proses",
      priority: "mendesak",
      category: "Tagihan",
      isToday: true,
      desc: "Batas akhir pembayaran hari ini.",
      dateInt: 4,
    },
    {
      id: "tk3",
      title: "Olahraga Sore",
      date: new Date().toISOString(),
      time: "17:30",
      status: "belum",
      priority: "rendah",
      category: "Kesehatan",
      isToday: true,
      desc: "Jogging 30 menit keliling taman.",
      dateInt: 4,
    },
    {
      id: "tk4",
      title: "Review Draft Fitur Baru",
      date: "2026-05-05T10:00:00",
      time: "10:00",
      status: "belum",
      priority: "sedang",
      category: "Pekerjaan",
      isToday: false,
      desc: "Cek file Figma fitur terbaru.",
      dateInt: 5,
    },
  ],
  activities: [
    {
      id: "a1",
      title: "Weekly Sync & UI Review",
      timeStart: "10:00",
      timeEnd: "11:30",
      location: "Google Indonesia HQ",
      type: "Pekerjaan",
      desc: "Membahas progress sprint minggu ini bersama tim developer dan PM.",
      color: "bg-blue-500",
      dateInt: 4,
      lat: -6.2235,
      lng: 106.8228,
      transport: "Motor",
    },
    {
      id: "a2",
      title: "Makan Siang Bersama Tim",
      timeStart: "12:00",
      timeEnd: "13:00",
      location: "Sate Khas Senayan",
      type: "Sosial",
      desc: "Makan siang santai untuk merayakan rilis fitur.",
      color: "bg-orange-500",
      dateInt: 4,
      lat: -6.2155,
      lng: 106.822,
      transport: "Jalan Kaki",
    },
    {
      id: "a3",
      title: "Workshop Design System",
      timeStart: "15:00",
      timeEnd: "17:00",
      location: "Pacific Place Meeting Room",
      type: "Edukasi",
      desc: "Sesi sharing tentang komponen Figma terbaru dengan seluruh tim UI/UX.",
      color: "bg-purple-500",
      dateInt: 4,
      lat: -6.2248,
      lng: 106.8098,
      transport: "Mobil",
    },
    {
      id: "a4",
      title: "Perpanjang STNK",
      timeStart: "09:00",
      timeEnd: "11:00",
      location: "Samsat Keliling",
      type: "Pribadi",
      desc: "Jangan lupa bawa KTP dan BPKB asli.",
      color: "bg-rose-500",
      dateInt: 10,
      lat: -6.23,
      lng: 106.815,
      transport: "Motor",
    },
  ],
  debts: [
    {
      id: "d1",
      person: "Budi",
      amount: 500000,
      type: "Piutang",
      status: "Belum Lunas",
      dueDate: "2026-05-15T00:00:00",
      desc: "Patungan makan siang",
    },
    {
      id: "d2",
      person: "Andi",
      amount: 250000,
      type: "Hutang",
      status: "Belum Lunas",
      dueDate: "2026-05-10T00:00:00",
      desc: "Pinjam untuk beli bensin",
    }
  ],
  archives: [
    {
      id: "ar1",
      name: "Kontrak Kerja PT. Tech",
      category: "Pekerjaan",
      docNumber: "CTR/2026/001",
      date: "2026-01-15",
      exp: "2027-01-15",
      status: "Aktif",
      important: true,
      secret: true,
    },
    {
      id: "ar2",
      name: "Sertifikat Vaksin",
      category: "Kesehatan",
      docNumber: "VAC-9921",
      date: "2021-08-10",
      exp: "2026-08-10",
      status: "Perlu Diperbarui",
      important: false,
      secret: false,
    },
  ],
  notes: [
    {
      id: "n1",
      title: "Ide Fitur Split Bill",
      category: "Ide & Konsep",
      date: "4 Mei 2026",
      preview: "Tambahkan opsi pembagian tagihan otomatis dengan scan struk...",
      color: "bg-amber-100 text-amber-700",
    },
    {
      id: "n2",
      title: "Daftar Belanja Bulanan",
      category: "Pribadi",
      date: "1 Mei 2026",
      preview: "1. Susu cair\n2. Kopi bubuk\n3. Roti tawar...",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: "n3",
      title: "Catatan Meeting Q2",
      category: "Pekerjaan",
      date: "28 Apr 2026",
      preview:
        "Target Q2: Meningkatkan retensi user sebesar 15%. Fokus pada onboar...",
      color: "bg-purple-100 text-purple-700",
    },
    {
      id: "n4",
      title: "Daftar Tempat Liburan",
      category: "Pribadi",
      date: "20 Apr 2026",
      preview: "- Bali (Canggu)\n- Jepang (Kyoto)\n- Lombok...",
      color: "bg-emerald-100 text-emerald-700",
    },
  ],
};

// ==========================================
// 3. DESIGN SYSTEM & SHARED COMPONENTS
// ==========================================

const IconRenderer = ({ name, size = 20, className = "" }) => {
  const icons = {
    wallet: Wallet,
    briefcase: Briefcase,
    coffee: Coffee,
    activity: Activity,
    building: Building2,
    smartphone: Smartphone,
    banknote: Banknote,
    "shopping-bag": ShoppingBag,
    car: Car,
    film: Film,
    wifi: Wifi,
    target: Target,
    file: FileText,
  };
  const IconComponent = icons[name] || Wallet;
  return <IconComponent size={size} className={className} />;
};

// Header
const AppHeader = ({ user, title, onBack, onProfileClick }: any) => (
  <header className="sticky top-0 w-full bg-slate-50/90 backdrop-blur-xl px-5 sm:px-6 py-4 flex justify-between items-center z-40 border-b border-slate-200/60 transition-all">
    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
      {title ? (
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-full active:scale-95 transition-all shrink-0"
        >
          <ChevronLeft size={22} />
        </button>
      ) : (
        <button className="p-2 -ml-2 opacity-0 pointer-events-none w-0 overflow-hidden shrink-0">
          <ChevronLeft size={22} />
        </button>
      )}

      {title ? (
        <h1 className="text-[17px] sm:text-[18px] font-black text-slate-900 leading-tight tracking-tight truncate">
          {title}
        </h1>
      ) : (
        <>
          <div
            onClick={onProfileClick}
            className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-slate-200 shrink-0 cursor-pointer hover:border-slate-300 transition-colors"
          >
            <img
              src={user.avatar}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0 pr-2">
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight mb-0.5 truncate">
              Welcome back
            </p>
            <p className="text-[13px] sm:text-[14px] font-black text-slate-900 leading-tight truncate">
              {user.name}
            </p>
          </div>
        </>
      )}
    </div>
    <div className="flex gap-2 shrink-0">
      {!title && (
        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
          <Search size={18} strokeWidth={2.5} />
        </button>
      )}
      <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all relative">
        <Bell size={18} strokeWidth={2.5} />
        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm"></span>
      </button>
    </div>
  </header>
);

const SectionHeader = ({ title, action, onAction, subtitle }: any) => (
  <div className="flex justify-between items-end mb-4 mt-8 px-1 gap-4">
    <div className="min-w-0">
      <h3 className="text-[17px] sm:text-[18px] font-black text-slate-900 tracking-tight truncate">
        {title}
      </h3>
      {subtitle && (
        <p className="text-[12px] sm:text-[13px] font-medium text-slate-500 mt-0.5 truncate">
          {subtitle}
        </p>
      )}
    </div>
    {action && (
      <button
        onClick={onAction}
        className="text-blue-600 font-bold text-[13px] flex items-center hover:text-blue-700 active:scale-95 transition-all border border-transparent hover:border-blue-100 hover:bg-blue-50 px-2 py-1 rounded-lg -mr-2 shrink-0"
      >
        {action} <ChevronRight size={16} className="ml-0.5" />
      </button>
    )}
  </div>
);

const Badge = ({ children, variant = "default", className }: any) => {
  const variants: any = {
    default: "bg-slate-100/50 text-slate-600 border-slate-200/60",
    success: "bg-emerald-100/50 text-emerald-700 border-emerald-200/60",
    danger: "bg-rose-100/50 text-rose-700 border-rose-200/60",
    warning: "bg-amber-100/50 text-amber-700 border-amber-200/60",
    info: "bg-blue-100/50 text-blue-700 border-blue-200/60",
    purple: "bg-purple-100/50 text-purple-700 border-purple-200/60",
  };
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest whitespace-nowrap border backdrop-blur-sm",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
};

const ProgressBar = ({ percent, colorClass = "bg-blue-500", label }: any) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between text-[11px] font-medium mb-1.5">
        <span className="text-slate-500">{label}</span>
        <span className={cn("font-bold", colorClass.replace("bg-", "text-"))}>
          {percent}%
        </span>
      </div>
    )}
    <div className="w-full bg-slate-200/50 rounded-full overflow-hidden h-2 border border-slate-200/50">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-1000 ease-out shadow-sm",
          colorClass,
        )}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  </div>
);

// Filter Tanggal Dropdown (Mendorong konten ke bawah, Tidak menimpa)
const DailyDateSelector = ({
  dateLabel,
  selectedDate,
  onPrev,
  onNext,
  onSelectDate,
  itemsMap = {},
}: any) => {
  const [isOpen, setIsOpen] = useState(false);

  const totalItems = Object.values(itemsMap).reduce(
    (sum: any, items: any) => sum + items.length,
    0,
  );

  const renderCalendar = () => {
    const daysInMonth = 31;
    const startOffset = 4; // Jumat (1 Mei 2026 adalah Jumat)
    const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;
    const cells = [];
    const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const TODAY = 4;

    dayNames.forEach((day, idx) => {
      cells.push(
        <div
          key={`header-${day}`}
          className={cn(
            "text-[10px] font-bold uppercase text-center mb-2",
            idx === 6 ? "text-rose-500" : "text-slate-400",
          )}
        >
          {day}
        </div>,
      );
    });

    for (let i = 0; i < totalCells; i++) {
      const date = i - startOffset + 1;
      const isCurrentMonth = date > 0 && date <= daysInMonth;
      const isSelected = date === selectedDate;
      const isToday = date === TODAY;
      const isSunday = i % 7 === 6;
      const items = isCurrentMonth ? itemsMap[date] || [] : [];

      cells.push(
        <div
          key={i}
          onClick={() => {
            if (isCurrentMonth) {
              onSelectDate(date);
              // setIsOpen(false) dihilangkan agar kalender tidak menutup saat klik tanggal
            }
          }}
          className={cn(
            "h-[42px] rounded-xl flex flex-col items-center justify-start pt-1.5 relative cursor-pointer transition-all border",
            !isCurrentMonth ? "opacity-0 pointer-events-none" : "",
            isSelected
              ? "bg-slate-900 text-white shadow-md border-slate-900"
              : isToday
                ? "bg-blue-50/80 border-blue-200"
                : "bg-transparent border-transparent hover:bg-slate-50",
          )}
        >
          <span
            className={cn(
              "text-[13px] font-bold leading-none z-10",
              isSelected
                ? "text-white"
                : isToday
                  ? "text-blue-700"
                  : isSunday
                    ? "text-rose-500"
                    : "text-slate-700",
            )}
          >
            {isCurrentMonth ? date : ""}
          </span>

          {items.length > 0 && (
            <div className="absolute bottom-1.5 flex w-full px-2 gap-0.5 h-1 justify-center opacity-90">
              {items.slice(0, 3).map((col, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex-1 rounded-full",
                    isSelected ? "bg-white/80" : col,
                  )}
                ></div>
              ))}
              {items.length > 3 && (
                <div
                  className={cn(
                    "w-1 h-1 rounded-full shrink-0",
                    isSelected ? "bg-white/80" : "bg-slate-400",
                  )}
                ></div>
              )}
            </div>
          )}
        </div>,
      );
    }
    return cells;
  };

  return (
    <div className="mb-4 flex flex-col gap-2 relative">
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-[16px] p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button
          onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-colors active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex justify-center items-center gap-2 px-3 hover:bg-slate-50 py-1.5 rounded-lg transition-colors"
        >
          <CalendarIcon size={14} className="text-blue-600" />
          <span className="text-[13px] font-bold text-slate-800">
            {dateLabel}
          </span>
          <ChevronDown
            size={14}
            className={cn(
              "text-slate-400 transition-transform duration-300",
              isOpen ? "rotate-180" : "",
            )}
          />
        </button>

        <button
          onClick={onNext}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-xl transition-colors active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isOpen && (
        <div className="bg-white border border-slate-200 rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-in fade-in slide-in-from-top-2 duration-200 w-full mt-1">
          <div className="flex justify-between items-center mb-4 px-2 border-b border-slate-100 pb-3">
            <h4 className="text-[14px] font-black text-slate-900">Mei 2026</h4>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Hari Ini: Tgl 4
            </span>
          </div>
          <div className="grid grid-cols-7 gap-y-2 mb-4">
            {renderCalendar()}
          </div>
          <div className="text-center pt-3 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500">
              Terdapat <span className="text-slate-800">{totalItems} data</span>{" "}
              tercatat di bulan ini.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. TAB VIEWS
// ==========================================

const HomeView = ({ data }) => {
  const totalBalance = data.pockets.reduce((sum, p) => sum + p.balance, 0);
  const tasksPending = data.tasks.filter((a) => a.status !== "selesai").length;

  return (
    <div className="pb-32">
      <div className="px-6 mt-6 mb-2">
        <h2 className="text-[22px] font-black text-slate-900 leading-tight">
          Hari ini,
        </h2>
        <p className="text-[14px] font-medium text-slate-600 mt-1 leading-relaxed">
          Ada{" "}
          <b className="text-blue-600">
            {data.activities.filter((a) => a.dateInt === 4).length} aktivitas
          </b>{" "}
          dan{" "}
          <b className="text-emerald-600">
            {data.transactions.filter((t) => t.isToday).length} transaksi
          </b>{" "}
          terjadwal. Anda memiliki{" "}
          <b className="text-rose-500">{tasksPending} tugas</b> yang belum
          selesai.
        </p>
      </div>

      <div className="px-6 mt-5">
        <div className="rounded-[24px] shadow-lg shadow-blue-500/20 bg-blue-600 relative overflow-hidden p-6 border border-blue-500">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-[50px] translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 gap-4">
              <button className="bg-white/20 hover:bg-white/30 active:scale-95 transition-all backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold shadow-sm">
                <CalendarIcon size={14} /> Mei 2026 <ChevronDown size={14} />
              </button>
              <Badge
                variant="default"
                className="shrink-0 mt-1 bg-white text-emerald-600 border border-emerald-100 shadow-sm px-2.5 py-1 tracking-wide font-black"
              >
                +12% vs Apr
              </Badge>
            </div>
            <div className="mb-5">
              <p className="text-blue-100 text-[13px] font-medium mb-1 tracking-wide truncate flex items-center gap-1.5">
                <Wallet size={14} /> Total Kekayaan (Gabungan Semua Kantong)
              </p>
              <h2 className="text-[32px] sm:text-[38px] font-black tracking-tight leading-none text-white break-all sm:break-normal drop-shadow-sm">
                {formatCurrency(totalBalance)}
              </h2>
              <p className="text-blue-200 text-[11px] font-medium mt-1.5">
                Kekayaan Bulan Lalu: {formatCurrency(totalBalance * 0.88)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-5 pb-5 border-t border-blue-400/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
                  <TrendingUp size={16} strokeWidth={3} />
                </div>
                <div className="min-w-0">
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-0.5 mt-0.5 truncate">
                    Pemasukan
                  </p>
                  <p className="text-[14px] font-black text-white truncate">
                    +{formatCompactCurrency(data.summary.incomeMonth)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-400/20 flex items-center justify-center text-rose-300 shrink-0">
                  <TrendingDown size={16} strokeWidth={3} />
                </div>
                <div className="min-w-0">
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-wider mb-0.5 mt-0.5 truncate">
                    Pengeluaran
                  </p>
                  <p className="text-[14px] font-black text-white truncate">
                    -{formatCompactCurrency(data.summary.expenseMonth)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-5 border-t border-blue-400/30">
              <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/10 shadow-sm min-w-0 relative overflow-hidden">
                <p className="text-[14px] font-black text-white truncate">
                  {formatCompactCurrency(
                    data.summary.incomeMonth - data.summary.expenseMonth,
                  )}
                </p>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-0.5 truncate">
                  Netto Bln Ini
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-[16px] p-3 text-center border border-white/10 shadow-sm min-w-0 relative overflow-hidden">
                <p className="text-[14px] font-black text-white truncate">
                  {data.transactions.length} Transaksi
                </p>
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mt-0.5 truncate">
                  Aktivitas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="px-5">
          <SectionHeader
            title="Daftar Kantong (Rekening & E-Wallet)"
            action="Semua"
            subtitle="Tempat menyimpan uang Anda"
          />
        </div>
        <div className="flex overflow-x-auto gap-4 px-5 pb-4 hide-scrollbar snap-x">
          {data.pockets.map((pocket) => (
            <div
              key={pocket.id}
              className="snap-start shrink-0 w-[290px] bg-white rounded-[24px] p-5 border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.03)] flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        pocket.bg,
                        pocket.color,
                      )}
                    >
                      <IconRenderer name={pocket.icon} size={24} />
                    </div>
                    <div>
                      <p className="text-slate-900 text-[15px] font-bold leading-tight">
                        {pocket.name}
                      </p>
                      <p className="text-slate-500 text-[12px] font-medium">
                        {pocket.type}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      pocket.status === "Aman"
                        ? "success"
                        : pocket.status === "Boros"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {pocket.status}
                  </Badge>
                </div>
                <div className="mb-4">
                  <p className="text-[11px] font-semibold text-slate-400 capitalize mb-0.5">
                    Saldo Tersedia
                  </p>
                  <p className="text-slate-900 text-[26px] font-black tracking-tight leading-none">
                    {formatCompactCurrency(pocket.balance)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl py-2 px-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Trx Bln Ini
                    </span>
                    <span className="text-[13px] font-black text-slate-800">
                      {pocket.trxCount} Kali
                    </span>
                  </div>
                  <div className="w-[1px] h-6 bg-slate-200"></div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Update
                    </span>
                    <span className="text-[13px] font-black text-slate-800">
                      {pocket.lastTrx}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Masuk
                    </p>
                    <p className="text-[13px] font-bold text-emerald-600">
                      {formatCompactCurrency(pocket.in)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      Keluar
                    </p>
                    <p className="text-[13px] font-bold text-rose-600">
                      {formatCompactCurrency(pocket.out)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-2">
        <SectionHeader
          title="Tugas Hari Ini"
          action="Lihat Semua"
          subtitle="Tugas yang perlu diselesaikan"
        />
        <div className="flex flex-col gap-3">
          {data.tasks
            .filter((t) => t.dateInt === 4)
            .map((act) => (
              <div
                key={act.id}
                className="bg-white p-4 rounded-[20px] border border-slate-200 flex items-start gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 border",
                    act.status === "selesai"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                      : "bg-slate-50 border-slate-200 text-slate-500",
                  )}
                >
                  <span className="text-[10px] font-bold uppercase">
                    {act.time.split(":")[0]}
                  </span>
                  <span className="text-[9px] font-bold">
                    {act.time.split(":")[1]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p
                      className={cn(
                        "text-[15px] font-bold truncate pr-2",
                        act.status === "selesai"
                          ? "text-slate-400 line-through"
                          : "text-slate-900",
                      )}
                    >
                      {act.title}
                    </p>
                    <Badge
                      variant={
                        act.priority === "mendesak"
                          ? "danger"
                          : act.priority === "tinggi"
                            ? "warning"
                            : "default"
                      }
                      className="shrink-0"
                    >
                      {act.priority}
                    </Badge>
                  </div>
                  <p className="text-[12px] font-medium text-slate-500 mb-2 truncate">
                    {act.desc}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="px-5 mt-2">
        <SectionHeader
          title="Progress Target"
          subtitle="Pantau tujuan keuangan Anda"
        />
        <div className="flex flex-col gap-4">
          {data.targets.map((target) => {
            const pct = getPercentage(target.current, target.target);
            return (
              <div
                key={target.id}
                className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900">
                      {target.name}
                    </h4>
                    <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                      Tenggat: {formatDate(target.endDate)}{" "}
                      <span className="text-slate-300 mx-1">•</span> Di{" "}
                      {target.pocket}
                    </p>
                  </div>
                  <Badge
                    variant={
                      pct >= 100 ? "success" : pct > 80 ? "warning" : "info"
                    }
                  >
                    {target.status}
                  </Badge>
                </div>
                <ProgressBar
                  percent={pct}
                  colorClass="bg-blue-500"
                  label={`Progress: ${formatCompactCurrency(target.current)} dari ${formatCompactCurrency(target.target)}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 mt-2">
        <SectionHeader
          title="Keuangan Hari Ini"
          action="Riwayat"
          subtitle="Transaksi terbaru hari ini"
        />
        <div className="flex flex-col gap-3">
          {data.transactions
            .filter((t) => t.isToday)
            .map((trx) => (
              <div
                key={trx.id}
                className="bg-white p-4 rounded-[20px] border border-slate-200 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                    trx.type === "income"
                      ? "bg-emerald-50 text-emerald-600"
                      : trx.type === "transfer"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-rose-50 text-rose-600",
                  )}
                >
                  <IconRenderer name={trx.icon} size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14.5px] font-bold text-slate-900 truncate">
                    {trx.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <p className="text-[12px] font-medium text-slate-500">
                      {trx.time}
                    </p>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <p className="text-[12px] font-medium text-slate-500">
                      {trx.pocket}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-[15px] font-black mb-1.5",
                      trx.type === "income"
                        ? "text-emerald-600"
                        : trx.type === "transfer"
                          ? "text-blue-600"
                          : "text-slate-900",
                    )}
                  >
                    {trx.type === "income"
                      ? "+"
                      : trx.type === "transfer"
                        ? ""
                        : "-"}
                    {formatCurrency(trx.amount)}
                  </p>
                  <Badge
                    variant={
                      trx.type === "income"
                        ? "success"
                        : trx.type === "transfer"
                          ? "info"
                          : "danger"
                    }
                    className="text-[9px] px-2 py-0.5"
                  >
                    {trx.type === "income"
                      ? "Masuk"
                      : trx.type === "transfer"
                        ? "Transfer"
                        : "Keluar"}
                  </Badge>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// --- Transaction Detail Modal ---
const TransactionDetailModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="absolute inset-0 z-[110] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-[32px] p-6 pt-8 pb-12 shadow-2xl animate-in fade-in slide-in-from-bottom-full duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm",
              transaction.type === "income"
                ? "bg-emerald-50 text-emerald-600"
                : transaction.type === "transfer"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-rose-50 text-rose-600",
            )}
          >
            <IconRenderer name={transaction.icon} size={32} />
          </div>
          <h3 className="text-[20px] font-black text-slate-900 leading-tight">
            {transaction.title}
          </h3>
          <p className="text-[14px] font-medium text-slate-500 mt-1">
            {transaction.category}
          </p>
        </div>

        <div className="bg-slate-50 rounded-[24px] p-5 border border-slate-100 mb-6">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200/60 pb-4">
            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
              Jumlah
            </span>
            <span
              className={cn(
                "text-[20px] font-black",
                transaction.type === "income"
                  ? "text-emerald-600"
                  : transaction.type === "transfer"
                    ? "text-blue-600"
                    : "text-slate-900",
              )}
            >
              {transaction.type === "income"
                ? "+"
                : transaction.type === "transfer"
                  ? ""
                  : "-"}
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Kantong
              </p>
              <p className="text-[14px] font-bold text-slate-800">
                {transaction.pocket}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Metode
              </p>
              <p className="text-[14px] font-bold text-slate-800">
                {transaction.method || "Transfer"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Waktu
              </p>
              <p className="text-[14px] font-bold text-slate-800">
                {transaction.time || "00:00"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Tanggal
              </p>
              <p className="text-[14px] font-bold text-slate-800">
                {formatDate(transaction.date)}
              </p>
            </div>
          </div>
        </div>

        {transaction.photoUrl ? (
          <div className="mb-6">
            <p className="text-[12px] font-bold text-slate-900 mb-3 px-1">
              Lampiran Foto / Bukti
            </p>
            <div className="w-full aspect-video rounded-[20px] overflow-hidden border border-slate-200 shadow-sm relative group">
              <img
                src={transaction.photoUrl}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <a
                href={transaction.photoUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute top-3 right-3 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"
              >
                <Maximize size={16} />
              </a>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <p className="text-[12px] font-bold text-slate-900 mb-3 px-1">
              Foto Belum Ditambahkan
            </p>
            <ImageUploader
              collectionName="transactions"
              docId={transaction.id}
              currentUrl={transaction.photoUrl}
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all active:scale-95 shadow-lg"
          >
            Tutup
          </button>
          <button className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-100 hover:bg-rose-100 transition-colors">
            <AlertCircle size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FinanceView = ({ data }) => {
  const [finTab, setFinTab] = useState("transaksi");
  const tabs = ["transaksi", "kantong", "budget", "target", "hutang_piutang", "analisis"];
  const [selectedTrxDate, setSelectedTrxDate] = useState(4); // Default 4 Mei
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [filters, setFilters] = useState({
    type: "all",
    category: "all",
    method: "all",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Map transaksi ke warna untuk kalender: Pemasukan Hijau, Pengeluaran Merah
  const trxDensityMap = useMemo(() => {
    const map = {};
    data.transactions.forEach((t) => {
      if (!map[t.dateInt]) map[t.dateInt] = [];
      map[t.dateInt].push(
        t.type === "income" ? "bg-emerald-500" : "bg-rose-500",
      );
    });
    return map;
  }, [data.transactions]);

  const handlePrevTrxDate = () =>
    setSelectedTrxDate((prev) => Math.max(1, prev - 1));
  const handleNextTrxDate = () =>
    setSelectedTrxDate((prev) => Math.min(31, prev + 1));
  const handleSelectTrxDate = (date) => setSelectedTrxDate(date);

  const baseFilteredTrx = data.transactions.filter(
    (t) => t.dateInt === selectedTrxDate,
  );

  const dailyIncome = baseFilteredTrx
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const dailyExpense = baseFilteredTrx
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const dailyTotal = dailyIncome - dailyExpense;

  const filteredTrx = baseFilteredTrx.filter((t) => {
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.category !== "all" && t.category !== filters.category)
      return false;
    if (filters.method !== "all" && t.method !== filters.method) return false;
    return true;
  });

  const categories = useMemo(
    () => Array.from(new Set(data.transactions.map((t) => t.category))),
    [data.transactions],
  );
  const methods = useMemo(
    () => Array.from(new Set(data.transactions.map((t) => t.method))),
    [data.transactions],
  );

  const chartMonthlyData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const monthData = months.map(m => ({ name: m, in: 0, out: 0 }));

    data.transactions.forEach(t => {
      let dObj = new Date();
      if (t.createdAt && t.createdAt.toDate) {
        dObj = t.createdAt.toDate();
      } else if (t.date) {
        dObj = new Date(t.date);
      }
      
      if (dObj.getFullYear() === currentYear) {
         const m = dObj.getMonth();
         if (t.type === "income") monthData[m].in += t.amount;
         if (t.type === "expense") monthData[m].out += t.amount;
      }
    });
    return monthData;
  }, [data.transactions]);

  return (
    <div className="pb-32">
      <div className="px-5 pt-6 mb-6">
        <div className="bg-[#0b132b] rounded-[24px] shadow-xl shadow-blue-900/10 border border-blue-900/50 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4 gap-2">
              <p className="text-[12px] sm:text-[13px] font-bold text-blue-200/80 uppercase tracking-wider truncate">
                Total Keuangan
              </p>
              <button className="text-[11px] sm:text-[12px] font-bold text-blue-300 bg-blue-900/50 px-2 sm:px-3 py-1.5 rounded-lg flex items-center gap-1 border border-blue-800 shrink-0">
                Mei 2026 <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex flex-col items-start gap-2.5 mb-4">
              <h2 className="text-[28px] sm:text-[32px] font-black text-white tracking-tight leading-none break-all sm:break-normal">
                {formatCurrency(
                  data.pockets.reduce((sum, p) => sum + p.balance, 0),
                )}
              </h2>
              <span className="text-[10px] sm:text-[11px] font-black py-0.5 px-2 bg-emerald-400 text-emerald-950 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)] border border-emerald-300 whitespace-nowrap">
                +12% vs Saldo Bulan Lalu
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/5 rounded-xl p-2.5 sm:p-3 border border-white/10 flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5 text-emerald-400">
                  <TrendingUp
                    size={14}
                    strokeWidth={2.5}
                    className="shrink-0"
                  />
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase truncate tracking-wider text-emerald-400/80">
                    Masuk
                  </p>
                </div>
                <p className="text-[12px] sm:text-[14px] font-black text-white truncate">
                  +{formatCompactCurrency(data.summary.incomeMonth)}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-2.5 sm:p-3 border border-white/10 flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5 text-rose-400">
                  <TrendingDown
                    size={14}
                    strokeWidth={2.5}
                    className="shrink-0"
                  />
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase truncate tracking-wider text-rose-400/80">
                    Keluar
                  </p>
                </div>
                <p className="text-[12px] sm:text-[14px] font-black text-white truncate">
                  -{formatCompactCurrency(data.summary.expenseMonth)}
                </p>
              </div>
              <div className="bg-blue-600/20 rounded-xl p-2.5 sm:p-3 border border-blue-500/30 flex flex-col min-w-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-8 bg-blue-400/20 rounded-full blur-md -mt-2 -mr-2"></div>
                <div className="flex items-center gap-1.5 mb-1.5 text-blue-400 relative z-10">
                  <CalendarIcon
                    size={14}
                    strokeWidth={2.5}
                    className="shrink-0"
                  />
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase truncate tracking-wider text-blue-400/80">
                    Sisa
                  </p>
                </div>
                <p className="text-[12px] sm:text-[14px] font-black text-white truncate relative z-10">
                  {formatCompactCurrency(
                    data.summary.incomeMonth - data.summary.expenseMonth,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mb-4">
        <div className="flex overflow-x-auto gap-2 hide-scrollbar pb-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFinTab(t)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[13px] font-bold capitalize whitespace-nowrap transition-all border",
                finTab === t
                  ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
              )}
            >
              {t.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5">
        {finTab === "transaksi" && (
          <div className="flex flex-col gap-3">
            <DailyDateSelector
              dateLabel={`${selectedTrxDate} Mei 2026`}
              selectedDate={selectedTrxDate}
              onPrev={handlePrevTrxDate}
              onNext={handleNextTrxDate}
              onSelectDate={handleSelectTrxDate}
              itemsMap={trxDensityMap}
            />

            {/* Rekapan Harian Bolder Style (Card Putih Standard, Boder Tipis, tanpa glow) */}
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-white rounded-[16px] p-2 sm:p-3 border border-emerald-200 shadow-sm text-center min-w-0 flex flex-col items-center justify-center">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-0.5 w-full truncate">
                  Masuk
                </p>
                <p className="text-[12px] sm:text-[13px] font-black text-emerald-600 w-full truncate">
                  +{formatCompactCurrency(dailyIncome)}
                </p>
              </div>
              <div className="bg-white rounded-[16px] p-2 sm:p-3 border border-rose-200 shadow-sm text-center min-w-0 flex flex-col items-center justify-center">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-0.5 w-full truncate">
                  Keluar
                </p>
                <p className="text-[12px] sm:text-[13px] font-black text-rose-600 w-full truncate">
                  -{formatCompactCurrency(dailyExpense)}
                </p>
              </div>
              <div className="bg-white rounded-[16px] p-2 sm:p-3 border border-slate-200 shadow-sm text-center min-w-0 flex flex-col items-center justify-center">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase mb-0.5 w-full truncate">
                  Total
                </p>
                <p
                  className={cn(
                    "text-[12px] sm:text-[13px] font-black w-full truncate",
                    dailyTotal >= 0 ? "text-slate-900" : "text-rose-600",
                  )}
                >
                  {dailyTotal > 0 ? "+" : ""}
                  {formatCompactCurrency(dailyTotal)}
                </p>
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="flex flex-col gap-2 mb-2 relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-between w-full bg-white border border-slate-200 rounded-[12px] px-4 py-2.5 shadow-sm text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-blue-500" />
                  <span>Filter Transaksi</span>
                  {(filters.type !== "all" ||
                    filters.category !== "all" ||
                    filters.method !== "all") && (
                    <span className="bg-blue-100 text-blue-700 w-4 h-4 rounded-full flex items-center justify-center text-[9px] -ml-1">
                      {
                        [
                          filters.type !== "all",
                          filters.category !== "all",
                          filters.method !== "all",
                        ].filter(Boolean).length
                      }
                    </span>
                  )}
                </div>
                <ChevronDown
                  size={14}
                  className={cn(
                    "text-slate-400 transition-transform",
                    isFilterOpen ? "rotate-180" : "",
                  )}
                />
              </button>

              {isFilterOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 shadow-lg rounded-[16px] p-4 z-20 flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Tipe
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {["all", "income", "expense", "transfer"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setFilters((f) => ({ ...f, type: t }))}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                            filters.type === t
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {t === "all"
                            ? "Semua"
                            : t === "income"
                              ? "Pemasukan"
                              : t === "expense"
                                ? "Pengeluaran"
                                : "Transfer"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Kategori
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setFilters((f) => ({ ...f, category: "all" }))
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                          filters.category === "all"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        Semua
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c as string}
                          onClick={() =>
                            setFilters((f) => ({ ...f, category: c as string }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                            filters.category === c
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {c as string}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Metode
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setFilters((f) => ({ ...f, method: "all" }))
                        }
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                          filters.method === "all"
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        Semua
                      </button>
                      {methods.map((m) => (
                        <button
                          key={m as string}
                          onClick={() =>
                            setFilters((f) => ({ ...f, method: m as string }))
                          }
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                            filters.method === m
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                          )}
                        >
                          {m as string}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(filters.type !== "all" ||
                    filters.category !== "all" ||
                    filters.method !== "all") && (
                    <button
                      onClick={() => {
                        setFilters({
                          type: "all",
                          category: "all",
                          method: "all",
                        });
                        setIsFilterOpen(false);
                      }}
                      className="mt-2 w-full py-2 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredTrx.length > 0 ? (
              filteredTrx.map((trx) => (
                <div
                  key={trx.id}
                  onClick={() => setSelectedTransaction(trx)}
                  className="bg-white p-4 rounded-[20px] border border-slate-200 flex items-start gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1",
                      trx.type === "income"
                        ? "bg-emerald-50 text-emerald-600"
                        : trx.type === "transfer"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-rose-50 text-rose-600",
                    )}
                  >
                    <IconRenderer name={trx.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14.5px] font-bold text-slate-900 truncate">
                      {trx.title}
                    </p>
                    <p className="text-[12px] font-medium text-slate-500 mb-2">
                      {trx.pocket} • {trx.method}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge
                        variant={
                          trx.type === "income"
                            ? "success"
                            : trx.type === "transfer"
                              ? "info"
                              : "danger"
                        }
                        className="text-[9px] px-2 py-0.5"
                      >
                        {trx.type === "income"
                          ? "Pemasukan"
                          : trx.type === "transfer"
                            ? "Transfer"
                            : "Pengeluaran"}
                      </Badge>
                      {trx.important && (
                        <Badge
                          variant="warning"
                          className="text-[9px] px-2 py-0.5"
                        >
                          Penting
                        </Badge>
                      )}
                    </div>
                    <ImageUploader
                      collectionName="transactions"
                      docId={trx.id}
                      currentUrl={trx.photoUrl}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        "text-[15px] font-black mb-1",
                        trx.type === "income"
                          ? "text-emerald-600"
                          : trx.type === "transfer"
                            ? "text-blue-600"
                            : "text-slate-900",
                      )}
                    >
                      {trx.type === "income"
                        ? "+"
                        : trx.type === "transfer"
                          ? ""
                          : "-"}
                      {formatCurrency(trx.amount)}
                    </p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {trx.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50 mt-2">
                <p className="text-[13px] font-bold text-slate-600">
                  Tidak ada transaksi
                </p>
                <p className="text-[12px] font-medium text-slate-500 mt-1">
                  Belum ada transaksi pada tanggal ini.
                </p>
              </div>
            )}
          </div>
        )}

        {finTab === "kantong" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between cursor-pointer hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Plus size={20} />
                </div>
                <p className="text-[14px] font-bold text-slate-900">
                  Tambah Kantong Baru
                </p>
              </div>
            </div>
            {data.pockets.map((pocket) => (
              <div
                key={pocket.id}
                className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        pocket.bg,
                        pocket.color,
                      )}
                    >
                      <IconRenderer name={pocket.icon} size={24} />
                    </div>
                    <div>
                      <p className="text-[16px] font-bold text-slate-900">
                        {pocket.name}
                      </p>
                      <p className="text-[12px] font-medium text-slate-500">
                        {pocket.type}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      pocket.status === "Aman"
                        ? "success"
                        : pocket.status === "Boros"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {pocket.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-[12px] font-medium text-slate-500 mb-0.5">
                    Saldo Saat Ini
                  </p>
                  <p className="text-[24px] font-black text-slate-900 tracking-tight">
                    {formatCurrency(pocket.balance)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Masuk ({getPercentage(pocket.in, pocket.in + pocket.out)}
                      %)
                    </p>
                    <p className="text-[14px] font-bold text-emerald-600">
                      {formatCompactCurrency(pocket.in)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Keluar (
                      {getPercentage(pocket.out, pocket.in + pocket.out)}%)
                    </p>
                    <p className="text-[14px] font-bold text-rose-600">
                      {formatCompactCurrency(pocket.out)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {finTab === "budget" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase">
                  Sisa Budget
                </p>
                <p className="text-[16px] font-black text-emerald-600 mt-1">
                  Rp 1.1 jt
                </p>
              </div>
              <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase">
                  Paling Boros
                </p>
                <p className="text-[16px] font-black text-rose-600 mt-1">
                  Tagihan
                </p>
              </div>
            </div>
            {data.budgets.map((budget) => {
              const percent = getPercentage(budget.spent, budget.limit);
              let statusVariant = "success";
              let statusText = "Aman";
              let colorClass = "bg-emerald-500";
              if (percent >= 100) {
                statusVariant = "danger";
                statusText = "Overbudget";
                colorClass = "bg-rose-500";
              } else if (percent >= 80) {
                statusVariant = "warning";
                statusText = "Hampir Habis";
                colorClass = "bg-amber-500";
              }
              return (
                <div
                  key={budget.id}
                  className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center",
                          budget.bg,
                          budget.color,
                        )}
                      >
                        <IconRenderer name={budget.icon} size={24} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-bold text-slate-900">
                          {budget.name}
                        </h3>
                        <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                          {budget.category} • {budget.period}
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusVariant}>{statusText}</Badge>
                  </div>
                  <ProgressBar
                    percent={percent}
                    colorClass={colorClass}
                    label={`Batas: ${formatCurrency(budget.limit)}`}
                  />
                  <div className="grid grid-cols-2 gap-2 mt-4 text-[12px] font-bold border-t border-slate-100 pt-3">
                    <div className="flex flex-col">
                      <span className="text-slate-400 font-medium">
                        Terpakai
                      </span>
                      <span className="text-slate-900 text-[14px]">
                        {formatCurrency(budget.spent)}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-slate-400 font-medium">Sisa</span>
                      <span
                        className={cn(
                          "text-[14px]",
                          percent >= 100 ? "text-rose-600" : "text-emerald-600",
                        )}
                      >
                        {formatCurrency(
                          Math.max(0, budget.limit - budget.spent),
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {finTab === "target" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Plus size={20} />
                </div>
                <p className="text-[14px] font-bold text-slate-900">
                  Buat Target Baru
                </p>
              </div>
            </div>
            {data.targets.map((target) => {
              const pct = getPercentage(target.current, target.target);
              return (
                <div
                  key={target.id}
                  className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-[16px] font-bold text-slate-900">
                        {target.name}
                      </h4>
                      <p className="text-[12px] font-medium text-slate-500 mt-0.5">
                        Tenggat: {formatDate(target.endDate)}{" "}
                        <span className="text-slate-300 mx-1">•</span> Saldo dr:{" "}
                        {target.pocket}
                      </p>
                    </div>
                    <Badge
                      variant={
                        pct >= 100 ? "success" : pct > 80 ? "warning" : "info"
                      }
                    >
                      {target.status}
                    </Badge>
                  </div>
                  <ProgressBar
                    percent={pct}
                    colorClass="bg-blue-500"
                    label={`Terkumpul: ${formatCompactCurrency(target.current)} / ${formatCompactCurrency(target.target)}`}
                  />
                  <div className="mt-4 flex justify-between text-[12px] font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-500">Sisa Kurang:</span>
                    <span className="text-slate-900">
                      {formatCurrency(target.target - target.current)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {finTab === "hutang_piutang" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Plus size={20} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900">
                    Catat Hutang/Piutang Baru
                  </p>
                  <p className="text-[12px] text-slate-500">
                    Pantau tagihan atau pinjaman
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div className="bg-rose-50/50 p-4 rounded-[20px] border border-rose-100 text-center">
                <p className="text-[11px] font-bold text-rose-500 uppercase">
                  Total Hutang
                </p>
                <p className="text-[16px] font-black text-rose-700 mt-1">
                  {formatCurrency((data.debts || []).filter(d => d.type === 'Hutang').reduce((sum, d) => sum + d.amount, 0))}
                </p>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-[20px] border border-emerald-100 text-center">
                <p className="text-[11px] font-bold text-emerald-600 uppercase">
                  Total Piutang
                </p>
                <p className="text-[16px] font-black text-emerald-700 mt-1">
                  {formatCurrency((data.debts || []).filter(d => d.type === 'Piutang').reduce((sum, d) => sum + d.amount, 0))}
                </p>
              </div>
            </div>

            {(data.debts || []).map((debt) => (
              <div
                key={debt.id}
                className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-[16px] font-bold text-slate-900">
                      {debt.person} - {debt.desc}
                    </h4>
                    <p className="text-[12px] font-medium text-slate-500 mt-1">
                      Tenggat: {formatDate(debt.dueDate)}
                    </p>
                  </div>
                  <Badge variant={debt.type === 'Hutang' ? 'danger' : 'success'}>
                    {debt.type}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[18px] font-black text-slate-900">
                      {formatCurrency(debt.amount)}
                    </p>
                    <Badge variant={debt.status === 'Lunas' ? 'success' : 'warning'}>
                      {debt.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {finTab === "analisis" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Ringkasan Keuangan Bulanan */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h4 className="text-[15px] font-black text-slate-900 mb-4">
                Ringkasan Bulanan ({new Date().getFullYear()})
              </h4>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartMonthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val / 1000000}M`} tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '12px' }} formatter={(val) => formatCurrency(val)} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', fontWeight: 700, marginTop: '10px' }} />
                    <Bar dataKey="in" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="out" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend Pemasukan & Pengeluaran */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h4 className="text-[15px] font-black text-slate-900 mb-4">
                Tren Keuangan (7 Hari Terakhir)
              </h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: "Sen", in: 1200000, out: 800000 },
                      { name: "Sel", in: 900000, out: 1200000 },
                      { name: "Rab", in: 2500000, out: 950000 },
                      { name: "Kam", in: 1500000, out: 1100000 },
                      { name: "Jum", in: 1800000, out: 1300000 },
                      { name: "Sab", in: 800000, out: 2000000 },
                      { name: "Min", in: 3000000, out: 1100000 },
                    ]}
                  >
                    <defs>
                      <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#f43f5e"
                          stopOpacity={0.1}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f43f5e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#94a3b8" }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      itemStyle={{ fontSize: "12px", fontWeight: 800 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="in"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorIn)"
                      name="Pemasukan"
                    />
                    <Area
                      type="monotone"
                      dataKey="out"
                      stroke="#f43f5e"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOut)"
                      name="Pengeluaran"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Masuk
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Keluar
                  </span>
                </div>
              </div>
            </div>

            {/* Alokasi Pengeluaran */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h4 className="text-[15px] font-black text-slate-900 mb-4">
                Alokasi Pengeluaran
              </h4>
              <div className="h-[220px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={[
                        { name: "Makan", value: 450000, color: "#f97316" },
                        { name: "Belanja", value: 1250000, color: "#3b82f6" },
                        { name: "Tagihan", value: 2500000, color: "#f43f5e" },
                        { name: "Transport", value: 300000, color: "#8b5cf6" },
                        { name: "Lainnya", value: 150000, color: "#94a3b8" },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {[
                        { name: "Makan", value: 450000, color: "#f97316" },
                        { name: "Belanja", value: 1250000, color: "#3b82f6" },
                        { name: "Tagihan", value: 2500000, color: "#f43f5e" },
                        { name: "Transport", value: 300000, color: "#8b5cf6" },
                        { name: "Lainnya", value: 150000, color: "#94a3b8" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                    Total
                  </p>
                  <p className="text-[18px] font-black text-slate-900 leading-tight">
                    Rp 4.6jt
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-y-2 mt-2">
                {[
                  { name: "Makan", value: 450000, color: "#f97316", pct: 10 },
                  {
                    name: "Belanja",
                    value: 1250000,
                    color: "#3b82f6",
                    pct: 27,
                  },
                  {
                    name: "Tagihan",
                    value: 2500000,
                    color: "#f43f5e",
                    pct: 54,
                  },
                  {
                    name: "Transport",
                    value: 300000,
                    color: "#8b5cf6",
                    pct: 7,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <p className="text-[11px] font-bold text-slate-600">
                      {item.name}{" "}
                      <span className="text-slate-400 font-medium ml-1">
                        {item.pct}%
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart Budget vs Actual */}
            <div className="bg-white rounded-[24px] p-5 border border-slate-200 shadow-sm">
              <h4 className="text-[15px] font-black text-slate-900 mb-4">
                Budget vs Realisasi
              </h4>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Makan", budget: 2000000, actual: 1800000 },
                      { name: "Trans", budget: 1000000, actual: 400000 },
                      { name: "Tagihan", budget: 2500000, actual: 2600000 },
                    ]}
                    layout="vertical"
                    margin={{ left: 0, right: 30 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }}
                      width={60}
                    />
                    <Tooltip cursor={{ fill: "transparent" }} />
                    <Bar
                      dataKey="budget"
                      fill="#e2e8f0"
                      radius={[0, 10, 10, 0]}
                      name="Target"
                      barSize={10}
                    />
                    <Bar
                      dataKey="actual"
                      fill="#3b82f6"
                      radius={[0, 10, 10, 0]}
                      name="Realisasi"
                      barSize={10}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Target
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Realisasi
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <TransactionDetailModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
};

const DirectionsRendererComponent = ({ dailyActs }: { dailyActs: any[] }) => {
  const [routeSegments, setRouteSegments] = useState<
    { index: number; path: [number, number][]; color: string }[]
  >([]);

  useEffect(() => {
    if (dailyActs.length < 2) {
      setRouteSegments([]);
      return;
    }
    const fetchRoutes = async () => {
      try {
        const segments: { index: number; path: [number, number][]; color: string }[] = [];
        
        for (let i = 0; i < dailyActs.length - 1; i++) {
          const act1 = dailyActs[i];
          const act2 = dailyActs[i + 1];
          const coordinates = `${act1.lng},${act1.lat};${act2.lng},${act2.lat}`;
          
          let colorHex = "#3b82f6";
          if (act1.color.includes("blue")) colorHex = "#3b82f6";
          else if (act1.color.includes("orange")) colorHex = "#f97316";
          else if (act1.color.includes("purple")) colorHex = "#a855f7";
          else if (act1.color.includes("rose")) colorHex = "#f43f5e";
          else if (act1.color.includes("emerald")) colorHex = "#10b981";
          
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            segments.push({
              index: i,
              path: data.routes[0].geometry.coordinates,
              color: colorHex,
            });
          }
        }
        setRouteSegments(segments);
      } catch (e) {
        console.error("OSRM routing error", e);
      }
    };
    fetchRoutes();
  }, [dailyActs]);

  if (routeSegments.length === 0) return null;

  return (
    <>
      {routeSegments.map((segment) => (
        <MapRoute
          key={segment.index}
          coordinates={segment.path}
          color={segment.color}
          width={5}
          opacity={0.9}
        />
      ))}
    </>
  );
};

const MapController = ({ center }: { center: {lat: number, lng: number, timestamp?: number} }) => {
  const { map } = useMapLibre();
  useEffect(() => {
    if (map) {
      map.flyTo({ center: [center.lng, center.lat], zoom: 14, duration: 1000 });
    }
  }, [center.lat, center.lng, center.timestamp, map]);
  return null;
};

const getMapStyle = (styleType: string, isDark: boolean): string | any => {
  if (styleType === "satellite") {
    return {
      version: 8,
      sources: {
        "esri-satellite": {
          type: "raster",
          tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          tileSize: 256,
          attribution: "Esri"
        }
      },
      layers: [
        {
          id: "satellite",
          type: "raster",
          source: "esri-satellite",
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };
  }
  if (styleType === "terrain") {
    return {
      version: 8,
      sources: {
        "opentopomap": {
          type: "raster",
          tiles: ["https://a.tile.opentopomap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "OpenTopoMap"
        }
      },
      layers: [
        {
          id: "terrain",
          type: "raster",
          source: "opentopomap",
          minzoom: 0,
          maxzoom: 17
        }
      ]
    };
  }
  // roadmap
  return isDark
    ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
    : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
};

// --- Komponen Peta Rute (RouteMap) ---
const RouteMap = ({
  activities,
  selectedActDate,
  isFullscreen,
  onToggleFullscreen,
  focusedLocation,
  onLocationFocus,
  timeFilter,
  setTimeFilter,
}: {
  activities: any[];
  selectedActDate: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  focusedLocation: { lat: number; lng: number; timestamp?: number } | null;
  onLocationFocus?: (lat: number, lng: number, timestamp?: number) => void;
  timeFilter: string;
  setTimeFilter: (v: string) => void;
}) => {
  const [mapStyleType, setMapStyleType] = useState("roadmap");

  const mapStyleOptions = [
    { id: "roadmap", label: "Standar" },
    { id: "satellite", label: "Satelit" },
    { id: "terrain", label: "Medan" },
  ];

  const dailyActs = useMemo(() => {
    let filtered = activities.filter(
      (a) => a.dateInt === selectedActDate && a.lat && a.lng,
    );

    if (timeFilter !== "Semua") {
      filtered = filtered.filter((a) => {
        const hour = parseInt(a.timeStart.split(":")[0]);
        if (timeFilter === "Pagi") return hour < 12;
        if (timeFilter === "Siang") return hour >= 12 && hour < 17;
        if (timeFilter === "Sore") return hour >= 17;
        return true;
      });
    }

    return filtered.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }, [activities, selectedActDate, timeFilter]);

  const [userLocation, setUserLocation] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  const center = useMemo(() => {
    if (focusedLocation)
      return { lat: focusedLocation.lat, lng: focusedLocation.lng, timestamp: focusedLocation.timestamp };
    if (dailyActs.length === 0) return { lng: 106.8228, lat: -6.2235 };
    const lat = dailyActs.reduce((sum, a) => sum + a.lat, 0) / dailyActs.length;
    const lng = dailyActs.reduce((sum, a) => sum + a.lng, 0) / dailyActs.length;
    return { lng, lat };
  }, [dailyActs, focusedLocation]);

  useEffect(() => {
    if (focusedLocation && isFullscreen) {
      const act = dailyActs.find((a) => a.lat === focusedLocation.lat && a.lng === focusedLocation.lng);
      if (act) {
        const el = document.getElementById(`route-card-${act.id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [focusedLocation?.timestamp, isFullscreen, dailyActs]);

  return (
    <div
      className={cn(
        "transition-all flex flex-col",
        isFullscreen
          ? "fixed inset-0 z-[100] bg-white"
          : "relative overflow-hidden rounded-[16px] border border-slate-200 h-[260px] mb-4 group-hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className={cn("absolute z-[1000] flex flex-col gap-2 pointer-events-none", isFullscreen ? "top-4 left-4" : "top-3 left-3")}>
        <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200/60 transition-all pointer-events-auto w-fit">
          {[
            { id: "Semua", label: "Semua", icon: Filter },
            { id: "Pagi", label: "Pagi", icon: Sunrise },
            { id: "Siang", label: "Siang", icon: Sun },
            { id: "Sore", label: "Sore", icon: Moon },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={cn(
                "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all",
                timeFilter === f.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50",
              )}
            >
              <f.icon size={14} strokeWidth={3} />
              {(!isFullscreen || timeFilter === f.id) && <span className="hidden sm:inline">{f.label}</span>}
            </button>
          ))}
        </div>

        {isFullscreen && (
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto w-fit mt-1">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 shadow-sm shrink-0">
              <MapPin size={18} strokeWidth={2.5} />
            </div>
            <div className="pr-2">
              <h3 className="text-[15px] font-black text-slate-900 tracking-tight leading-none mb-1">
                Rute Linimasa
              </h3>
              <p className="text-[11px] font-bold text-slate-500">
                {timeFilter !== "Semua" ? timeFilter : "Hari ini"} • {dailyActs.length} Lokasi
              </p>
            </div>
          </div>
        )}
      </div>

      {isFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-4 right-4 z-[1000] p-3 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl text-slate-700 shadow-lg border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 shrink-0"
        >
          <Minimize size={20} strokeWidth={3} />
        </button>
      )}

      <div className={cn("absolute right-3 z-[1000] flex flex-col gap-2 pointer-events-none", isFullscreen ? "bottom-[180px]" : "bottom-6")}>
        {!isFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="w-11 h-11 bg-white/95 backdrop-blur-md text-slate-700 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.1)] border border-slate-200/60 flex flex-col items-center justify-center hover:bg-slate-50 transition-all active:scale-95 mb-1 pointer-events-auto self-end"
          >
            <Maximize size={16} strokeWidth={3} />
          </button>
        )}
        <div className="bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-white/50 flex flex-col gap-1.5 origin-bottom-right pointer-events-auto">
          {[
            {
              id: "roadmap",
              label: "Peta",
              img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=100&h=100&fit=crop",
            },
            {
              id: "satellite",
              label: "Satelit",
              img: "https://images.unsplash.com/photo-1518331647614-7a1f04cd3474?w=100&h=100&fit=crop",
            },
            {
              id: "terrain",
              label: "Medan",
              img: "https://images.unsplash.com/photo-1628100511874-9b2f6efd515a?w=100&h=100&fit=crop",
            },
          ].map((style) => {
            const isActive = mapStyleType === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setMapStyleType(style.id)}
                className={cn(
                  "relative w-10 h-10 rounded-xl overflow-hidden transition-all duration-300 border-2",
                  isActive
                    ? "border-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.3)] scale-100"
                    : "border-transparent scale-95 opacity-70 hover:opacity-100 hover:scale-100"
                )}
              >
                <img
                  src={style.img}
                  alt={style.label}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div
                  className={cn(
                    "absolute inset-0 flex items-end justify-center pb-1 transition-all pointer-events-none",
                    isActive ? "bg-gradient-to-t from-blue-900/80 to-transparent" : "bg-gradient-to-t from-black/60 to-transparent"
                  )}
                >
                  <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none drop-shadow-md">
                    {style.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {isFullscreen && dailyActs.length > 0 && (
        <div id="route-cards-container" className="absolute bottom-6 left-0 right-0 z-[1000] flex overflow-x-auto hide-scrollbar gap-4 px-4 pb-2 pointer-events-auto snap-x mx-0 scroll-smooth">
          {dailyActs.map((act) => {
            const isFocused = focusedLocation?.lat === act.lat && focusedLocation?.lng === act.lng;
            return (
              <div 
                key={act.id} 
                id={`route-card-${act.id}`}
                className={cn(
                  "min-w-[220px] max-w-[260px] rounded-2xl border flex flex-col shrink-0 snap-center cursor-pointer transition-all active:scale-95 shadow-lg overflow-hidden",
                  isFocused ? "bg-white border-blue-400 ring-4 ring-blue-500/20" : "bg-white/95 backdrop-blur-md border-slate-200 hover:bg-slate-50"
                )}
                onClick={() => {
                  onLocationFocus?.(act.lat, act.lng, Date.now());
                  const el = document.getElementById(`route-card-${act.id}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }}
              >
                {act.photoUrl && (
                  <div className="w-full h-24 border-b border-slate-100/50 bg-slate-100">
                    <img src={act.photoUrl} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[11px] font-black px-2.5 py-1 rounded-md tracking-tight", 
                      isFocused ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {act.timeStart}
                    </span>
                  </div>
                  <div>
                    <h4 className={cn("text-[14px] font-black truncate tracking-tight text-slate-800")}>
                      {act.title}
                    </h4>
                    <p className={cn("text-[12px] font-bold truncate flex items-center gap-1 mt-1", isFocused ? "text-blue-500" : "text-slate-500")}>
                      <MapPin size={12} className="shrink-0" /> {act.location}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {dailyActs.length === 0 ? (
        <div className="flex-1 w-full h-full bg-[#eaf0f6] flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 animate-in fade-in zoom-in-95">
            Tidak ada rute{" "}
            {timeFilter !== "Semua" ? timeFilter.toLowerCase() : ""} ini
          </div>
        </div>
      ) : (
        <div className="relative flex-1 w-full h-full">
          <Map
            center={[center.lng, center.lat]}
            zoom={14}
            attributionControl={false}
            styles={useMemo(() => ({
              light: getMapStyle(mapStyleType, false),
              dark: getMapStyle(mapStyleType, true),
            }), [mapStyleType])}
          >
            <MapController center={center} />
            <DirectionsRendererComponent dailyActs={dailyActs} />

            {userLocation && (
              <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
                <MarkerContent>
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-ping" />
                    <div className="w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
            )}

            {dailyActs.map((act) => {
              const isFocused = focusedLocation?.lat === act.lat && focusedLocation?.lng === act.lng;
              const markerColor = act.color.includes('blue') ? 'bg-blue-500' :
                act.color.includes('orange') ? 'bg-orange-500' :
                act.color.includes('purple') ? 'bg-purple-500' :
                act.color.includes('rose') ? 'bg-rose-500' : 'bg-slate-500';
              return (
                <MapMarker
                  key={act.id}
                  longitude={act.lng}
                  latitude={act.lat}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLocationFocus?.(act.lat, act.lng, Date.now());
                  }}
                >
                  <MarkerContent className="flex flex-col items-center group cursor-pointer">
                    <div className={cn(
                      "mb-1 pointer-events-none transition-all duration-300 origin-bottom",
                      isFocused ? "opacity-100 -translate-y-1 scale-100" : "opacity-0 translate-y-2 scale-90"
                    )}>
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 flex flex-col gap-1.5 min-w-[140px] items-center text-center">
                        {act.photoUrl && (
                          <div className="w-full aspect-video rounded-xl overflow-hidden mb-1 relative border border-slate-100 shadow-inner">
                            <img src={act.photoUrl} className="absolute inset-0 w-full h-full object-cover" />
                          </div>
                        )}
                        <span className="text-[12px] font-black text-slate-800 tracking-tight leading-loose w-full overflow-hidden text-ellipsis whitespace-nowrap px-1">
                          {act.title}
                        </span>
                        <div className="flex items-center gap-1.5 w-full justify-center">
                          <span className={cn(
                            "text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm shrink-0",
                            act.color.includes('blue') ? "bg-blue-50 text-blue-600" :
                            act.color.includes('orange') ? "bg-orange-50 text-orange-600" :
                            act.color.includes('purple') ? "bg-purple-50 text-purple-600" :
                            act.color.includes('rose') ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-600"
                          )}>
                            {act.timeStart}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">
                            {act.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "w-8 h-8 rounded-full border-2 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all", 
                      markerColor,
                      isFocused ? "border-blue-400 ring-4 ring-blue-500/30 scale-110" : "border-white"
                    )}>
                      <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                    </div>
                  </MarkerContent>
                </MapMarker>
              );
            })}
          </Map>
        </div>
      )}
    </div>
  );
};

// --- View Aktivitas Lengkap ---
const ActivityView = ({ tasks, activities }) => {
  const [actTab, setActTab] = useState("tugas");
  const [selectedTaskDate, setSelectedTaskDate] = useState(4);
  const [selectedActDate, setSelectedActDate] = useState(4);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("Semua");
  const [focusedLocation, setFocusedLocation] = useState<{
    lng: number;
    lat: number;
    timestamp?: number;
  } | null>(null);

  // Mapping Warna untuk Garis Indikator Kalender (Tugas=Hijau/Kuning, Aktivitas=Warna Kegiatan)
  const tasksDensityMap = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!map[t.dateInt]) map[t.dateInt] = [];
      map[t.dateInt].push(
        t.status === "selesai" ? "bg-emerald-500" : "bg-amber-500",
      );
    });
    return map;
  }, [tasks]);

  const actsDensityMap = useMemo(() => {
    const map = {};
    activities.forEach((a) => {
      if (!map[a.dateInt]) map[a.dateInt] = [];
      map[a.dateInt].push(a.color);
    });
    return map;
  }, [activities]);

  useEffect(() => {
    if (focusedLocation && !isMapFullscreen) {
      const act = activities.find((a) => a.lat === focusedLocation.lat && a.lng === focusedLocation.lng);
      if (act) {
        const el = document.getElementById(`activity-list-item-${act.id}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }
    }
  }, [focusedLocation?.timestamp, isMapFullscreen, activities]);

  const handlePrevTaskDate = () =>
    setSelectedTaskDate((prev) => Math.max(1, prev - 1));
  const handleNextTaskDate = () =>
    setSelectedTaskDate((prev) => Math.min(31, prev + 1));

  const handlePrevActDate = () =>
    setSelectedActDate((prev) => Math.max(1, prev - 1));
  const handleNextActDate = () =>
    setSelectedActDate((prev) => Math.min(31, prev + 1));

  // TUGAS TERTUNDA
  const pendingTasks = tasks.filter(
    (t) => t.status !== "selesai" && t.dateInt < selectedTaskDate,
  );
  const filteredTasks = tasks.filter((t) => t.dateInt === selectedTaskDate);
  const completedTasks = tasks.filter((t) => t.status === "selesai").length;
  const pct = getPercentage(completedTasks, tasks.length);

  const dailyActivities = useMemo(() => {
    let filtered = activities.filter((a) => a.dateInt === selectedActDate);
    if (timeFilter !== "Semua") {
      filtered = filtered.filter((a) => {
        const hour = parseInt(a.timeStart.split(":")[0]);
        if (timeFilter === "Pagi") return hour < 12;
        if (timeFilter === "Siang") return hour >= 12 && hour < 17;
        if (timeFilter === "Sore") return hour >= 17;
        return true;
      });
    }
    return filtered.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  }, [activities, selectedActDate, timeFilter]);

  return (
    <div className="pb-32 pt-4">
      {/* Tab Navigasi Internal */}
      <div className="px-5 mb-6">
        <div className="flex bg-slate-100/80 p-1 rounded-[14px] border border-slate-200/50 shadow-inner">
          <button
            onClick={() => setActTab("tugas")}
            className={cn(
              "flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all",
              actTab === "tugas"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Daftar Tugas
          </button>
          <button
            onClick={() => setActTab("aktivitas")}
            className={cn(
              "flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all",
              actTab === "aktivitas"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Jadwal Aktivitas
          </button>
        </div>
      </div>

      {/* Tab Daftar Tugas */}
      {actTab === "tugas" && (
        <div className="px-5 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-200 p-5 mb-6 overflow-hidden">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[16px] font-black text-slate-900 tracking-tight">
                Performa & Progress
              </h3>
              <Badge
                variant="info"
                className="bg-blue-50 text-blue-600 border-transparent shadow-sm"
              >
                Bulan Ini
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-[20px] border border-slate-100 min-w-0">
                <div className="relative shrink-0">
                  <svg className="w-[42px] h-[42px] transform -rotate-90">
                    <circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      className="text-slate-200"
                    />
                    <circle
                      cx="50%"
                      cy="50%"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={
                        2 * Math.PI * 18 - (pct / 100) * (2 * Math.PI * 18)
                      }
                      className="text-blue-600 transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pt-0.5">
                    <span className="text-[10px] font-black text-slate-900">
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                    Success
                  </p>
                  <p className="text-[15px] font-black text-slate-900 leading-none">
                    {completedTasks}{" "}
                    <span className="text-[10px] font-bold text-slate-400">
                      / {tasks.length}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-[20px] border border-emerald-100 flex flex-col justify-center min-w-0">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1">
                  Poin XP
                </p>
                <p className="text-[15px] font-black text-emerald-900 leading-none">
                  +{Math.round(completedTasks * 15)}{" "}
                  <span className="text-[10px] font-bold text-emerald-600">
                    Levels
                  </span>
                </p>
              </div>
            </div>

            {/* Line Chart Task Completion Trend */}
            <div className="mb-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4 ml-1">
                Trend Penyelesaian (7 Hari)
              </p>
              <div className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { day: "01", tasks: 3 },
                      { day: "02", tasks: 5 },
                      { day: "03", tasks: 2 },
                      { day: "04", tasks: 6 },
                      { day: "05", tasks: 4 },
                      { day: "06", tasks: 7 },
                      { day: "07", tasks: 5 },
                    ]}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "10px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      labelStyle={{ display: "none" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tasks"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{
                        fill: "#3b82f6",
                        r: 4,
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-center flex flex-col items-center justify-center min-w-0">
                <p className="text-[16px] font-black text-slate-900 mb-0.5 truncate">
                  {
                    tasks.filter(
                      (t) =>
                        t.priority === "tinggi" || t.priority === "mendesak",
                    ).length
                  }
                </p>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest truncate">
                  Prioritas
                </p>
              </div>
              <div className="bg-rose-50 rounded-2xl p-3 border border-rose-100 flex flex-col items-center justify-center min-w-0">
                <p className="text-[16px] font-black text-rose-600 mb-0.5 truncate">
                  {pendingTasks.length}
                </p>
                <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest truncate">
                  Terlambat
                </p>
              </div>
            </div>
          </div>

          <DailyDateSelector
            dateLabel={`${selectedTaskDate} Mei 2026`}
            selectedDate={selectedTaskDate}
            onPrev={handlePrevTaskDate}
            onNext={handleNextTaskDate}
            onSelectDate={setSelectedTaskDate}
            itemsMap={tasksDensityMap}
          />

          {/* Tugas Tertunda (Tanpa Glow, Standard Border Card) */}
          {pendingTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[14px] font-black text-rose-600 mb-3 flex items-center gap-2">
                <AlertCircle size={16} /> Tugas Tertunda
              </h3>
              <div className="flex flex-col gap-3">
                {pendingTasks.map((act) => (
                  <div
                    key={`pend-${act.id}`}
                    className="bg-rose-50 p-4 rounded-[20px] border border-rose-200 shadow-sm flex items-start gap-4"
                  >
                    <button className="w-6 h-6 rounded-full border-2 border-rose-200 bg-white text-transparent shrink-0 mt-1 hover:border-emerald-400 hover:bg-emerald-50 transition-colors">
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-black text-rose-900 mb-1 leading-tight">
                        {act.title}
                      </p>
                      <p className="text-[12px] font-medium text-rose-700/80 mb-2">
                        {act.desc}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant="danger"
                          className="text-[9px] px-2 py-0.5 bg-white border-rose-200 text-rose-700 shadow-sm"
                        >
                          Belum Selesai
                        </Badge>
                        <span className="text-[11px] font-bold text-rose-500 ml-auto flex items-center gap-1">
                          <AlertCircle size={12} /> Dr tgl {act.dateInt}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[16px] font-black text-slate-900">
              Tugas Harian
            </h3>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((act) => {
                const isDone = act.status === "selesai";
                let prioVariant = "default";
                if (act.priority === "mendesak") prioVariant = "danger";
                if (act.priority === "tinggi") prioVariant = "warning";
                return (
                  <div
                    key={act.id}
                    className="bg-white p-4 rounded-[20px] border border-slate-200 flex items-start gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors"
                  >
                    <button
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors",
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "bg-slate-50 border-slate-300 text-transparent hover:border-emerald-300",
                      )}
                    >
                      <Check size={14} strokeWidth={3} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-[15px] font-bold truncate mb-1",
                          isDone
                            ? "text-slate-400 line-through"
                            : "text-slate-900",
                        )}
                      >
                        {act.title}
                      </p>
                      <p className="text-[12px] font-medium text-slate-500 mb-2.5 truncate">
                        {act.desc}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={prioVariant}
                          className="text-[9px] px-2 py-0.5"
                        >
                          {act.priority}
                        </Badge>
                        <Badge
                          variant="default"
                          className="text-[9px] px-2 py-0.5 border-none bg-slate-100"
                        >
                          {act.category}
                        </Badge>
                        <span className="text-[11px] font-bold text-slate-400 ml-auto flex items-center gap-1">
                          <Clock size={12} /> {act.time}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50/50">
                <p className="text-[13px] font-bold text-slate-600">
                  Tidak ada tugas
                </p>
                <p className="text-[12px] font-medium text-slate-500 mt-1">
                  Belum ada tugas yang dijadwalkan hari ini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Jadwal Aktivitas (Timeline) */}
      {actTab === "aktivitas" && (
        <div className="px-5 animate-in fade-in duration-300">
          <DailyDateSelector
            dateLabel={`${selectedActDate} Mei 2026`}
            selectedDate={selectedActDate}
            onPrev={handlePrevActDate}
            onNext={handleNextActDate}
            onSelectDate={setSelectedActDate}
            itemsMap={actsDensityMap}
          />

          <div className="mt-6">
            {dailyActivities.length > 0 ? (
              <>
                <div className="bg-white p-4 rounded-[28px] border border-slate-200 shadow-sm mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600 shadow-sm">
                        <MapPin size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-black text-slate-900 tracking-tight">
                          Rute Linimasa
                        </h3>
                        <p className="text-[11px] font-bold text-slate-400">
                          Hari ini • {dailyActivities.length} Lokasi
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Render the Map Component */}
                  <RouteMap
                    activities={activities}
                    selectedActDate={selectedActDate}
                    isFullscreen={isMapFullscreen}
                    onToggleFullscreen={() =>
                      setIsMapFullscreen(!isMapFullscreen)
                    }
                    focusedLocation={focusedLocation}
                    onLocationFocus={(lat, lng, timestamp) => {
                      if (focusedLocation?.lat === lat && focusedLocation?.lng === lng) {
                        setFocusedLocation(null);
                      } else {
                        setFocusedLocation({ lat, lng, timestamp });
                      }
                    }}
                    timeFilter={timeFilter}
                    setTimeFilter={setTimeFilter}
                  />

                  <div className="flex flex-col gap-2.5 mt-4">
                    {dailyActivities.map((act, i) => {
                      const startHour = parseInt(act.timeStart.split(":")[0]);
                      const startMin = parseInt(act.timeStart.split(":")[1]);
                      const endHour = parseInt(act.timeEnd.split(":")[0]);
                      const endMin = parseInt(act.timeEnd.split(":")[1]);

                      let durationMins =
                        endHour * 60 + endMin - (startHour * 60 + startMin);
                      if (durationMins < 0) durationMins += 24 * 60; // handle overnight
                      const hrs = Math.floor(durationMins / 60);
                      const mins = durationMins % 60;
                      const durStr =
                        hrs > 0
                          ? `${hrs}j ${mins > 0 ? `${mins}m` : ""}`
                          : `${mins}m`;

                      const isFocused =
                        focusedLocation?.lng === act.lng &&
                        focusedLocation?.lat === act.lat;

                      return (
                        <div
                          key={act.id}
                          id={`activity-list-item-${act.id}`}
                          onClick={() => {
                            setFocusedLocation({ lng: act.lng, lat: act.lat, timestamp: Date.now() });
                            const el = document.getElementById(`activity-list-item-${act.id}`);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                          }}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-[20px] border transition-all cursor-pointer group active:scale-98",
                            isFocused
                              ? "bg-blue-50 border-blue-200 shadow-md ring-1 ring-blue-100"
                              : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm",
                          )}
                        >
                          <div className="flex flex-col items-center mt-1 relative">
                            <div
                              className={cn(
                                "w-4 h-4 rounded-full border-2 border-white shadow-md z-10 transition-transform group-hover:scale-125",
                                act.color,
                                isFocused && "ring-4 ring-blue-500/20",
                              )}
                            ></div>
                            {i < dailyActivities.length - 1 && (
                              <div className="absolute top-4 w-[2px] h-[calc(100%+0.6rem)] bg-gradient-to-b from-slate-200 to-transparent my-1 rounded-full z-0"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex flex-col">
                                <p
                                  className={cn(
                                    "text-[15px] font-black pr-2 leading-tight transition-colors",
                                    isFocused
                                      ? "text-blue-700"
                                      : "text-slate-900 group-hover:text-blue-600",
                                  )}
                                >
                                  {act.location}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  {act.type === "Pekerjaan" && (
                                    <Briefcase
                                      size={10}
                                      className="text-slate-400"
                                    />
                                  )}
                                  {act.type === "Sosial" && (
                                    <Coffee
                                      size={10}
                                      className="text-slate-400"
                                    />
                                  )}
                                  {act.type === "Pribadi" && (
                                    <User
                                      size={10}
                                      className="text-slate-400"
                                    />
                                  )}
                                  {act.type === "Edukasi" && (
                                    <BookOpen
                                      size={10}
                                      className="text-slate-400"
                                    />
                                  )}
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                    {act.type}
                                  </span>
                                  {act.transport && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                        {act.transport.toLowerCase().includes('motor') ? <Bike size={10} className="text-slate-400" /> : 
                                         act.transport.toLowerCase().includes('jalan') ? <Footprints size={10} className="text-slate-400" /> :
                                         <Car size={10} className="text-slate-400" />}
                                        {act.transport}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-end shrink-0">
                                <span className="text-[10px] font-black text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-lg border border-blue-200/50 mb-1.5 shadow-sm whitespace-nowrap">
                                  {durStr}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full shadow-sm border border-slate-200/60 leading-none">
                                  <Clock size={10} /> {act.timeStart} -{" "}
                                  {act.timeEnd}
                                </div>
                              </div>
                            </div>
                            <p className="text-[13px] font-bold text-slate-700 mb-1 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                              {act.title}
                            </p>
                            <div className="bg-white/60 p-2.5 rounded-[12px] border border-slate-200/50 mt-2">
                              <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic line-clamp-2">
                                "{act.desc}"
                              </p>
                            </div>
                            <ImageUploader
                              collectionName="activities"
                              docId={act.id}
                              currentUrl={act.photoUrl}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 px-6 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-200 rotate-6">
                  <CalendarIcon
                    size={24}
                    className="text-slate-400 -rotate-6"
                  />
                </div>
                <p className="text-[16px] font-black text-slate-800">
                  Linimasa Kosong
                </p>
                <p className="text-[13px] font-medium text-slate-500 mt-2 max-w-[200px] mx-auto">
                  Tidak ada jejak perjalanan yang terekam pada tanggal ini.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- View Arsip Lengkap ---
const ArchiveView = ({ data }) => {
  const [arcTab, setArcTab] = useState("dokumen");
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = useMemo(() => {
    const cats = {};
    data.notes.forEach((n) => {
      if (!cats[n.category])
        cats[n.category] = { name: n.category, count: 0, color: n.color };
      cats[n.category].count++;
    });
    return Object.values(cats);
  }, [data.notes]);

  const filteredNotes = activeCategory
    ? data.notes.filter((n) => n.category === activeCategory)
    : [];

  return (
    <div className="pb-32 pt-4">
      <div className="px-5 mb-6">
        <div className="flex bg-slate-100/80 p-1 rounded-[14px] border border-slate-200/50 shadow-inner">
          <button
            onClick={() => {
              setArcTab("dokumen");
              setActiveCategory(null);
            }}
            className={cn(
              "flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all",
              arcTab === "dokumen"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Dokumen
          </button>
          <button
            onClick={() => setArcTab("catatan")}
            className={cn(
              "flex-1 py-2.5 rounded-[10px] text-[13px] font-bold transition-all",
              arcTab === "catatan"
                ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Catatan
          </button>
        </div>
      </div>

      {arcTab === "dokumen" && (
        <div className="px-5 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-black text-slate-900">
              Arsip Penting
            </h2>
            <button className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 border border-blue-100">
              Unggah <Plus size={14} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-900 text-white p-4 rounded-[20px] shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total
              </p>
              <p className="text-[24px] font-black mt-1">
                {data.archives.length} File
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-[20px] shadow-sm flex flex-col justify-center">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Peringatan
              </p>
              <p className="text-[14px] font-bold text-rose-600 mt-1 flex items-center gap-1">
                <AlertCircle size={14} /> 1 Perlu Update
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {data.archives.map((ar) => (
              <div
                key={ar.id}
                className="bg-white p-4 rounded-[20px] border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Archive size={18} />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-900 leading-tight">
                        {ar.name}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                        No: {ar.docNumber}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge
                    variant={ar.status === "Aktif" ? "success" : "danger"}
                    className="text-[9px] px-2 py-0.5"
                  >
                    {ar.status}
                  </Badge>
                  {ar.important && (
                    <Badge variant="warning" className="text-[9px] px-2 py-0.5">
                      Penting
                    </Badge>
                  )}
                  {ar.secret && (
                    <Badge variant="purple" className="text-[9px] px-2 py-0.5">
                      Rahasia
                    </Badge>
                  )}
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-[11px] font-bold text-slate-500">
                  <span>
                    Exp:{" "}
                    <span className="text-slate-800">{formatDate(ar.exp)}</span>
                  </span>
                  <span className="text-blue-600 cursor-pointer flex items-center gap-1">
                    Detail <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {arcTab === "catatan" && (
        <div className="px-5">
          {!activeCategory ? (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[20px] font-black text-slate-900">
                  Kategori Catatan
                </h2>
                <button className="text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-[12px] font-bold flex items-center gap-1 shadow-sm">
                  Baru <Plus size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveCategory(cat.name)}
                    className="bg-white border border-slate-200 p-5 rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.03)] cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between aspect-square"
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        cat.color.split(" ")[0],
                        cat.color.split(" ")[1],
                      )}
                    >
                      <Folder size={24} />
                    </div>
                    <div>
                      <p className="text-[16px] font-black text-slate-900 mb-1 leading-tight">
                        {cat.name}
                      </p>
                      <p className="text-[12px] font-bold text-slate-400">
                        {cat.count} Catatan
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 shadow-sm"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-[20px] font-black text-slate-900">
                    {activeCategory}
                  </h2>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-all">
                  <Plus size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white p-5 rounded-[20px] border border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors cursor-pointer group"
                  >
                    <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                      {note.title}
                    </h4>
                    <p className="text-[12px] font-medium text-slate-500 mb-4 leading-relaxed line-clamp-2">
                      {note.preview}
                    </p>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 pt-3 border-t border-slate-100">
                      <span className="flex items-center gap-1.5">
                        <AlignLeft size={12} /> Teks Lengkap
                      </span>
                      <span>{note.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- View Profile Lengkap ---
const ProfileView = ({ data, onLogout }) => {
  return (
    <div className="pb-32 pt-6 px-5">
      <div className="bg-white rounded-[24px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200 p-6 flex flex-col items-center text-center mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-50 shadow-md mb-4 relative">
          <img
            src={data.user.avatar}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-[20px] font-black text-slate-900 mb-1">
          {data.user.name}
        </h2>
        <p className="text-[13px] font-medium text-slate-500 mb-3">
          {data.user.email} • {data.user.job}
        </p>
        <div className="flex gap-2">
          <Badge variant="warning">{data.user.tier}</Badge>
          <Badge variant="success">Keuangan Aman</Badge>
        </div>
      </div>

      <div className="bg-white rounded-[20px] shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-200 overflow-hidden">
        {[
          {
            icon: <User size={20} />,
            label: "Informasi Pribadi",
            color: "text-blue-500",
            bg: "bg-blue-50",
          },
          {
            icon: <Lock size={20} />,
            label: "Keamanan Akun",
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
          {
            icon: <ShieldCheck size={20} />,
            label: "Verifikasi Identitas",
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
          {
            icon: <Settings size={20} />,
            label: "Pengaturan Aplikasi",
            color: "text-slate-500",
            bg: "bg-slate-100",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-slate-50 cursor-pointer transition-colors",
              i !== 3 && "border-b border-slate-100",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                item.bg,
                item.color,
              )}
            >
              {item.icon}
            </div>
            <p className="text-[15px] font-bold text-slate-800 flex-1">
              {item.label}
            </p>
            <ChevronRight size={18} className="text-slate-300" />
          </div>
        ))}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className="w-full bg-rose-50 text-rose-600 font-bold text-[14px] py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
          >
            <LogOut size={18} /> Keluar Akun
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Login View ---
const LoginView = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center px-5 font-sans">
      <div className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-[24px] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30">
          <Wallet size={40} className="text-white" />
        </div>
        <h1 className="text-[28px] font-black text-slate-900 tracking-tight mb-2">
          Finance & Activities
        </h1>
        <p className="text-[15px] font-medium text-slate-500 mb-8 leading-relaxed">
          Pantau keuangan, jadwal, dan aktivitas harian Anda dalam satu
          dashboard canggih.
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
        >
          <img
            src="https://www.gstatic.com/firebase/anonymous-scan.png"
            className="w-6 h-6 grayscale invert"
            alt="Google"
          />
          Lanjutkan dengan Google
        </button>

        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="flex gap-4 justify-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <Target size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Real-time
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Secure
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                <Activity size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Analytics
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Image Uploader Component ---
const ImageUploader = ({
  collectionName,
  docId,
  currentUrl,
  onUploadComplete,
}: {
  collectionName: string;
  docId: string;
  currentUrl?: string;
  onUploadComplete?: (url: string) => void;
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docId) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL("image/jpeg", 0.6);

          try {
            await updateDoc(doc(db, collectionName, docId), { photoUrl: dataUrl });
            if (onUploadComplete) onUploadComplete(dataUrl);
          } catch(err) {
            console.error(err);
            alert("Gagal menyimpan gambar (mungkin terlalu besar).");
          } finally {
            setUploading(false);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed", error);
      setUploading(false);
    }
  };

  return (
    <div className="mt-2 w-full" onClick={(e) => e.stopPropagation()}>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {currentUrl ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-200 group">
          <img
            src={currentUrl}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40"
            >
              <Camera size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-500 transition-all font-bold text-[12px]"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Camera size={16} />
          )}
          {uploading ? "Mengupload..." : "Tambah Foto"}
        </button>
      )}
    </div>
  );
};

// --- Modal Tambah Cepat (FAB) ---

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AddModal = ({ isOpen, onClose, user, activeTab }) => {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('selection');
  
  // Transaction fields
  const [trxTitle, setTrxTitle] = useState("");
  const [trxAmount, setTrxAmount] = useState("");
  const [trxType, setTrxType] = useState("expense");
  const [trxCategory, setTrxCategory] = useState("Makanan");

  // Activity fields
  const [actTitle, setActTitle] = useState("");
  const [actTimeStart, setActTimeStart] = useState("09:00");
  const [actTimeEnd, setActTimeEnd] = useState("10:00");
  const [actLocation, setActLocation] = useState("");
  const [actType, setActType] = useState("Pekerjaan");
  const [actTransport, setActTransport] = useState("Mobil");

  // Debt fields
  const [debtPerson, setDebtPerson] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtType, setDebtType] = useState("Hutang");
  const [debtDueDate, setDebtDueDate] = useState(new Date().toISOString().slice(0,10));

  useEffect(() => {
    if(isOpen) {
      setType('selection');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      if (type === 'transaction') {
        if(!trxTitle || !trxAmount) return;
        await addDoc(collection(db, "transactions"), {
          userId: user.uid,
          title: trxTitle,
          amount: parseFloat(trxAmount),
          type: trxType,
          category: trxCategory,
          dateInt: new Date().getDate(),
          isToday: true,
          method: "Tunai",
          status: "Selesai",
          createdAt: serverTimestamp(),
        });
      } else if (type === 'activity') {
        if(!actTitle || !actLocation) return;
        let color = "bg-blue-500";
        if(actType === "Sosial") color = "bg-orange-500";
        if(actType === "Edukasi") color = "bg-purple-500";
        if(actType === "Pribadi") color = "bg-rose-500";

        await addDoc(collection(db, "activities"), {
          userId: user.uid,
          title: actTitle,
          timeStart: actTimeStart,
          timeEnd: actTimeEnd,
          location: actLocation,
          type: actType,
          desc: "",
          lat: -6.2235 + (Math.random() * 0.02 - 0.01), // dummy offsets
          lng: 106.8228 + (Math.random() * 0.02 - 0.01),
          dateInt: new Date().getDate(),
          isToday: true,
          transport: actTransport,
          color,
          createdAt: serverTimestamp(),
        });
      } else if (type === 'debt') {
        if(!debtPerson || !debtAmount) return;
        await addDoc(collection(db, "debts"), {
          userId: user.uid,
          person: debtPerson,
          amount: parseFloat(debtAmount),
          type: debtType,
          status: "Belum Lunas",
          dueDate: new Date(debtDueDate).toISOString(),
          desc: "Pinjaman/Tagihan",
          createdAt: serverTimestamp(),
        });
      }
      onClose();
    } catch(err) {
      console.error(err);
      alert("Gagal menambahkan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-end justify-center bg-slate-900/40 backdrop-blur-sm overflow-hidden p-2 pb-6">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-[90%] md:max-w-md flex flex-col bg-slate-50 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
        <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {type !== 'selection' && (
              <button type="button" onClick={() => setType('selection')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronLeft size={20} />
              </button>
            )}
            <h3 className="text-[16px] font-black text-slate-900">
              {type === 'selection' ? "Tambah Data" : type === 'transaction' ? "Tambah Transaksi" : type === 'activity' ? "Tambah Aktivitas" : type === 'debt' ? "Tambah Hutang/Piutang" : "Tambah Data"}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {type === 'selection' ? (
            <div className="grid grid-cols-2 gap-3 pb-4">
              <button onClick={() => setType('transaction')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wallet size={24} />
                </div>
                <span className="text-[13px] font-black text-slate-800">Transaksi</span>
              </button>
              <button onClick={() => setType('activity')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar size={24} />
                </div>
                <span className="text-[13px] font-black text-slate-800">Aktivitas</span>
              </button>
              <button onClick={() => setType('debt')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-400 hover:shadow-md transition-all flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <span className="text-[13px] font-black text-slate-800">Hutang/Piutang</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {type === 'transaction' && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Nama Transaksi</label>
                    <input required value={trxTitle} onChange={e => setTrxTitle(e.target.value)} type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500" placeholder="Contoh: Makan Siang" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Nominal (Rp)</label>
                    <input required value={trxAmount} onChange={e => setTrxAmount(e.target.value)} type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500" placeholder="50000" />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">Tipe</label>
                      <select value={trxType} onChange={e => setTrxType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500">
                        <option value="expense">Pengeluaran</option>
                        <option value="income">Pemasukan</option>
                      </select>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-700">Kategori</label>
                      <select value={trxCategory} onChange={e => setTrxCategory(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500">
                        <option value="Makanan">Makanan</option>
                        <option value="Transportasi">Transportasi</option>
                        <option value="Pribadi">Pribadi</option>
                        <option value="Gaji">Gaji</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

            {type === 'activity' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Nama Aktivitas</label>
                  <input required value={actTitle} onChange={e => setActTitle(e.target.value)} type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500" placeholder="Contoh: Meeting PRD" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Mulai</label>
                    <input required value={actTimeStart} onChange={e => setActTimeStart(e.target.value)} type="time" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Selesai</label>
                    <input required value={actTimeEnd} onChange={e => setActTimeEnd(e.target.value)} type="time" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Lokasi</label>
                  <input required value={actLocation} onChange={e => setActLocation(e.target.value)} type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500" placeholder="Sate Khas Senayan" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Kategori</label>
                    <select value={actType} onChange={e => setActType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500">
                      <option value="Pekerjaan">Pekerjaan</option>
                      <option value="Sosial">Sosial</option>
                      <option value="Edukasi">Edukasi</option>
                      <option value="Pribadi">Pribadi</option>
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Transport</label>
                    <select value={actTransport} onChange={e => setActTransport(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500">
                      <option value="Mobil">Mobil</option>
                      <option value="Motor">Motor</option>
                      <option value="Jalan Kaki">Jalan Kaki</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {type === 'debt' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Nama Peminjam / Yang Diberi Pinjaman</label>
                  <input required value={debtPerson} onChange={e => setDebtPerson(e.target.value)} type="text" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500" placeholder="Contoh: Budi" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700">Nominal (Rp)</label>
                  <input required value={debtAmount} onChange={e => setDebtAmount(e.target.value)} type="number" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[14px] outline-none focus:border-blue-500" placeholder="100000" />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Tipe</label>
                    <select value={debtType} onChange={e => setDebtType(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500">
                      <option value="Hutang">Hutang (Saya Pinjam)</option>
                      <option value="Piutang">Piutang (Diberikan ke Orang)</option>
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700">Jatuh Tempo</label>
                    <input type="date" value={debtDueDate} onChange={e => setDebtDueDate(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-3 text-[14px] outline-none focus:border-blue-500" />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white font-bold py-3.5 rounded-xl text-[14px] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? "Menyimpan..." : "Simpan Data"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. APP CONTAINER
// ==========================================
const useFirebaseData = (user: FirebaseUser | null) => {
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const userId = user.uid;

    // Check and Sync Initial Data
    const initData = async () => {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        try {
          // Create user profile
          await setDoc(doc(db, "users", userId), {
            name: user.displayName || "User",
            email: user.email || "",
            job: "Product Designer",
            avatar:
              user.photoURL ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            tier: "Pro Member",
          });

          // Seed sub-collections
          for (const pocket of INITIAL_DATA.pockets) {
            await addDoc(collection(db, "pockets"), { ...pocket, userId });
          }
          for (const trx of INITIAL_DATA.transactions) {
            await addDoc(collection(db, "transactions"), {
              ...trx,
              userId,
              createdAt: serverTimestamp(),
            });
          }
          for (const task of INITIAL_DATA.tasks) {
            await addDoc(collection(db, "tasks"), { ...task, userId });
          }
          for (const act of INITIAL_DATA.activities) {
            await addDoc(collection(db, "activities"), { ...act, userId });
          }
          for (const target of INITIAL_DATA.targets) {
            await addDoc(collection(db, "targets"), { ...target, userId });
          }
          for (const budget of INITIAL_DATA.budgets) {
            await addDoc(collection(db, "budgets"), { ...budget, userId });
          }
          for (const note of INITIAL_DATA.notes) {
            await addDoc(collection(db, "notes"), { ...note, userId });
          }
          for (const arc of INITIAL_DATA.archives) {
            await addDoc(collection(db, "archives"), { ...arc, userId });
          }
          if (INITIAL_DATA.debts) {
            for (const debt of INITIAL_DATA.debts) {
              await addDoc(collection(db, "debts"), { ...debt, userId });
            }
          }
        } catch (e) {
          console.error("Initial sync failed", e);
        }
      }
    };
    initData();

    // Real-time listeners
    const unsubscibers: any[] = [];

    const setupListener = (colName: string, stateKey: string) => {
      const q = query(collection(db, colName), where("userId", "==", userId));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setData((prev) => ({ ...prev, [stateKey]: items }));
        },
        (err) => handleFirestoreError(err, OperationType.LIST, colName),
      );
      unsubscibers.push(unsubscribe);
    };

    // User profile listener
    const unsubUser = onSnapshot(doc(db, "users", userId), (doc) => {
      if (doc.exists()) {
        setData((prev) => ({
          ...prev,
          user: { id: doc.id, ...(doc.data() as any) },
        }));
      }
    });
    unsubscibers.push(unsubUser);

    setupListener("pockets", "pockets");
    setupListener("transactions", "transactions");
    setupListener("tasks", "tasks");
    setupListener("activities", "activities");
    setupListener("targets", "targets");
    setupListener("budgets", "budgets");
    setupListener("notes", "notes");
    setupListener("archives", "archives");
    setupListener("debts", "debts");

    setLoading(false);

    return () => {
      unsubscibers.forEach((unsub) => unsub());
    };
  }, [user]);

  return { data, loading };
};


export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data, loading: dataLoading } = useFirebaseData(user);

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-bold text-[14px] animate-pulse">
          Menghubungkan ke Database...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const getHeaderTitle = () => {
    if (activeTab === "finance") return "Keuangan Saya";
    if (activeTab === "activity") return "Aktivitas & Tugas";
    if (activeTab === "archive") return "Arsip & Dokumen";
    if (activeTab === "profile") return "Profil & Pengaturan";
    return null;
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div
      className="min-h-screen bg-slate-900 flex justify-center font-sans"
      id="app-root"
    >
      <div className="w-full max-w-2xl bg-slate-50 h-[100dvh] max-h-screen relative shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <AppHeader
          user={data.user}
          title={getHeaderTitle()}
          onBack={() => setActiveTab("home")}
          onProfileClick={() => setActiveTab("profile")}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto hide-scrollbar relative bg-slate-200/50 pb-20">
          {activeTab === "home" && <HomeView data={data} />}
          {activeTab === "finance" && <FinanceView data={data} />}
          {activeTab === "activity" && (
            <ActivityView tasks={data.tasks} activities={data.activities} />
          )}
          {activeTab === "archive" && <ArchiveView data={data} />}
          {activeTab === "profile" && (
            <ProfileView data={data} onLogout={handleLogout} />
          )}
        </main>

        <AddModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          user={user}
          activeTab={activeTab}
        />

        {/* NavBot Flat */}
        <div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-lg border-t border-slate-200/60 pb-safe pt-2 z-50">
          <div className="relative flex justify-around items-center h-16 px-2">
            <button
              onClick={() => setActiveTab("home")}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[50px] sm:w-[60px]",
                activeTab === "home"
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              <Home
                size={24}
                className={activeTab === "home" ? "fill-blue-100" : ""}
              />
              <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("finance")}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[50px] sm:w-[60px]",
                activeTab === "finance"
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              <CreditCard
                size={24}
                className={activeTab === "finance" ? "fill-blue-100" : ""}
              />
              <span className="text-[10px] font-bold truncate">Keuangan</span>
            </button>

            {/* Spacer FAB */}
            <div className="min-w-[50px] sm:w-[60px] h-10"></div>

            {/* Tombol FAB Tengah */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-6">
              <button
                onClick={() => setIsAddOpen(true)}
                className="w-[64px] h-[64px] bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all rounded-full flex items-center justify-center text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] border-[6px] border-slate-50"
              >
                <Plus size={32} strokeWidth={2.5} />
              </button>
            </div>

            <button
              onClick={() => setActiveTab("activity")}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[50px] sm:w-[60px]",
                activeTab === "activity"
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              <ListTodo
                size={24}
                className={activeTab === "activity" ? "fill-blue-100" : ""}
              />
              <span className="text-[10px] font-bold truncate">
                Aktivitas
              </span>
            </button>

            <button
              onClick={() => setActiveTab("archive")}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[50px] sm:w-[60px]",
                activeTab === "archive"
                  ? "text-blue-600"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              <Archive
                size={24}
                className={activeTab === "archive" ? "fill-blue-100" : ""}
              />
              <span className="text-[10px] font-bold">Arsip</span>
            </button>
          </div>
        </div>

        {/* CSS Helper */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px); }
        `,
          }}
        />
      </div>
    </div>
  );
}
