// مسیر فایل: src/app/admin/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Lock,
  User,
  Upload,
  Trash2,
  Sparkles,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  LogOut,
  FileCheck2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ShowcaseItem {
  id: string;
  title?: string | null;
  image_url: string;
  storage_path: string;
  width?: number | null;
  height?: number | null;
  file_size_kb?: number | null;
  created_at: string;
}

interface CompressedPreview {
  blob: Blob;
  previewUrl: string;
  fileName: string;
  width: number;
  height: number;
  originalSizeKB: number;
  compressedSizeKB: number;
  orientationLabel: string;
}

/**
 * فرمول تولید نام انگلیسی یکتا و غیرقابل تکرار تا ابد
 * خروجی نمونه: qj-craft-20261018-235012-1792367412991-a94f1c8e.webp
 */
function generateUniqueEnglishFileName(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const min = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  const ms = now.getTime();

  const randomBytes = new Uint8Array(4);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 4; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `qj-craft-${yyyy}${mm}${dd}-${hh}${min}${ss}-${ms}-${randomHex}.webp`;
}

/**
 * تبدیل هر نوع عکس به WebP و فشرده‌سازی هوشمند به زیر 50 تا 85 کیلوبایت با حفظ کیفیت بالا و کادر اصلی
 */
async function convertAndCompressToWebP(file: File): Promise<CompressedPreview> {
  const originalSizeKB = Math.max(1, Math.round(file.size / 1024));

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("خطا در خواندن فایل تصویر"));
    };
    image.src = objectUrl;
  });

  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;

  // تشخیص نوع کادر برای نمایش پینترستی
  const ratio = naturalWidth / naturalHeight;
  let orientationLabel = "مربعی";
  if (ratio < 0.92) orientationLabel = "عمودی (پینترستی)";
  else if (ratio > 1.08) orientationLabel = "افقی";

  let maxDimension = 1050;

  const scaleToMax = (maxDim: number) => {
    if (naturalWidth <= maxDim && naturalHeight <= maxDim) {
      return { w: naturalWidth, h: naturalHeight };
    }
    if (naturalWidth > naturalHeight) {
      return {
        w: maxDim,
        h: Math.round((naturalHeight * maxDim) / naturalWidth),
      };
    } else {
      return {
        w: Math.round((naturalWidth * maxDim) / naturalHeight),
        h: maxDim,
      };
    }
  };

  const encodeCanvas = (w: number, h: number, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("خطا در پردازش تصویر"));

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("خطا در تبدیل به فرمت WebP"));
          resolve(blob);
        },
        "image/webp",
        quality
      );
    });
  };

  const TARGET_BYTES = 68 * 1024;
  const MAX_BYTES = 90 * 1024;

  let { w, h } = scaleToMax(maxDimension);
  let bestBlob = await encodeCanvas(w, h, 0.82);

  const qualities = [0.76, 0.7, 0.64, 0.58];
  for (const q of qualities) {
    if (bestBlob.size <= TARGET_BYTES) break;
    bestBlob = await encodeCanvas(w, h, q);
  }

  if (bestBlob.size > MAX_BYTES) {
    maxDimension = 860;
    const scaled = scaleToMax(maxDimension);
    w = scaled.w;
    h = scaled.h;
    for (const q of [0.74, 0.66, 0.58]) {
      bestBlob = await encodeCanvas(w, h, q);
      if (bestBlob.size <= TARGET_BYTES) break;
    }
  }

  const compressedSizeKB = Math.max(1, Math.round(bestBlob.size / 1024));
  const fileName = generateUniqueEnglishFileName();
  const previewUrl = URL.createObjectURL(bestBlob);

  return {
    blob: bestBlob,
    previewUrl,
    fileName,
    width: w,
    height: h,
    originalSizeKB,
    compressedSizeKB,
    orientationLabel,
  };
}

export default function AdminShowcasePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // استیت‌های آپلود و مدیریت
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [title, setTitle] = useState("");
  const [compressedData, setCompressedData] = useState<CompressedPreview | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem("gholab_showcase_admin_auth");
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true);
      fetchShowcaseItems();
    }
    setAuthChecking(false);
  }, []);

  const fetchShowcaseItems = async () => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from("showcase_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data as ShowcaseItem[]);
    }
    setLoadingItems(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        localStorage.setItem("gholab_showcase_admin_auth", "authenticated");
        setIsAuthenticated(true);
        setLoginError("");
        fetchShowcaseItems();
      } else {
        setLoginError(data.message || "نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch {
      setLoginError("خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gholab_showcase_admin_auth");
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setIsCompressing(true);

    try {
      if (compressedData?.previewUrl) {
        URL.revokeObjectURL(compressedData.previewUrl);
      }
      const result = await convertAndCompressToWebP(file);
      setCompressedData(result);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "خطا در پردازش عکس. لطفاً عکس دیگری امتحان کنید.",
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compressedData) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const storagePath = `items/${compressedData.fileName}`;

      // ۱. آپلود فایل WebP فشرده‌شده با نام انگلیسی یکتا در باکت showcase
      const { error: uploadError } = await supabase.storage
        .from("showcase")
        .upload(storagePath, compressedData.blob, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // ۲. دریافت لینک عمومی تصویر
      const { data: publicUrlData } = supabase.storage
        .from("showcase")
        .getPublicUrl(storagePath);

      const publicUrl = publicUrlData.publicUrl;

      // ۳. ذخیره رکورد در جدول دیتابیس
      const { data: insertedRow, error: dbError } = await supabase
        .from("showcase_items")
        .insert([
          {
            title: title.trim() || null,
            image_url: publicUrl,
            storage_path: storagePath,
            width: compressedData.width,
            height: compressedData.height,
            file_size_kb: compressedData.compressedSizeKB,
          },
        ])
        .select("*")
        .single();

      if (dbError) throw dbError;

      // ۴. بروزرسانی لیست در لحظه
      if (insertedRow) {
        setItems((prev) => [insertedRow as ShowcaseItem, ...prev]);
      }

      // پاکسازی فرم
      URL.revokeObjectURL(compressedData.previewUrl);
      setCompressedData(null);
      setTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setStatusMessage({
        type: "success",
        text: "عکس با موفقیت به WebP تبدیل، فشرده و در صفحه اصلی منتشر شد!",
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setStatusMessage({
        type: "error",
        text:
          "خطا در آپلود به سوپابیس. مطمئن شوید کد SQL را در Supabase اجرا کرده‌اید.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: ShowcaseItem) => {
    if (!confirm("آیا از حذف این تصویر از صفحه اصلی مطمئن هستید؟")) return;

    setDeletingId(item.id);
    try {
      // ۱. حذف فایل از Storage برای جلوگیری از پر شدن فضای رایگان سوپابیس
      if (item.storage_path) {
        await supabase.storage.from("showcase").remove([item.storage_path]);
      }

      // ۲. حذف رکورد از دیتابیس
      const { error } = await supabase
        .from("showcase_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("خطا در حذف تصویر.");
    } finally {
      setDeletingId(null);
    }
  };

  if (authChecking) return null;

  // صفحه ورود با نام کاربری و رمز عبور
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 sm:p-10 shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-primary-pink/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary-pink" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-display text-text-dark text-center mb-2">
            پنل مدیریت دست‌بافت‌ها
          </h1>
          <p className="text-sm text-gray-500 font-sans text-center mb-8">
            بخش «آخرین دست‌بافت‌های آماده شده» در صفحه اصلی
          </p>

          <form onSubmit={handleLogin} className="space-y-5 font-sans">
            <div>
              <label className="block text-xs font-bold text-text-dark mb-2">
                نام کاربری
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  dir="ltr"
                  placeholder="Username"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pr-11 pl-4 text-left text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-pink/40"
                />
                <User className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-dark mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  dir="ltr"
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pr-11 pl-4 text-left text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-pink/40"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-primary-pink text-white font-bold py-4 rounded-2xl shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال بررسی...</span>
                </>
              ) : (
                <span>ورود به پنل</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // داشبورد اصلی مدیریت آخرین دست‌بافت‌های آماده شده
  return (
    <div className="min-h-screen bg-gray-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* نوار بالای پنل */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-pink/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-pink" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display text-text-dark">
                آخرین دست‌بافت‌های آماده شده
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-sans">
                هر عکسی که اینجا آپلود کنید، خودکار به WebP کم‌حجم تبدیل شده و در گالری پینترستی صفحه اصلی نمایش داده می‌شود.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-pink bg-primary-pink/10 px-4 py-2.5 rounded-xl hover:bg-primary-pink hover:text-white transition-colors"
            >
              <span>مشاهده در صفحه اصلی</span>
              <ExternalLink className="w-4 h-4" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-red-500 bg-gray-100 px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>

        {/* باکس آپلود عکس جدید */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-text-dark mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary-pink" />
            <span>آپلود عکس دست‌بافت جدید (عمودی، افقی یا مربعی)</span>
          </h2>

          <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* ستون انتخاب فایل */}
            <div className="space-y-5">
              <label className="block border-2 border-dashed border-primary-pink/30 hover:border-primary-pink rounded-3xl p-8 text-center cursor-pointer bg-soft-blue/10 hover:bg-primary-pink/5 transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
                  {isCompressing ? (
                    <Loader2 className="w-8 h-8 text-primary-pink animate-spin" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-primary-pink" />
                  )}
                </div>
                <p className="font-bold text-text-dark text-sm sm:text-base mb-1">
                  {isCompressing
                    ? "در حال تبدیل به WebP و فشرده‌سازی فوق‌العاده..."
                    : "برای انتخاب عکس از گوشی یا کامپیوتر کلیک کنید"}
                </p>
                <p className="text-xs text-gray-400 font-sans">
                  فرمت و اسم عکس مهم نیست؛ سیستم خودکار نام انگلیسی یکتا می‌سازد و حجم را زیر ۱۰۰ کیلوبایت می‌آورد
                </p>
              </label>

              <div>
                <label className="block text-xs font-bold text-text-dark mb-2 font-sans">
                  توضیح کوتاه روی عکس (اختیاری - مثلاً: عروسک خرگوش سفارش مشتری)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="اگر خالی بگذارید، عبارت «بافته شده با دست» نمایش داده می‌شود"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-sans text-text-dark focus:outline-none focus:ring-2 focus:ring-primary-pink/40"
                />
              </div>

              {statusMessage && (
                <div
                  className={`p-4 rounded-2xl text-sm font-bold font-sans flex items-center gap-2.5 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!compressedData || isUploading || isCompressing}
                className="w-full bg-primary-pink text-white font-bold py-4 rounded-2xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>در حال آپلود و انتشار در صفحه اصلی...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>انتشار در بخش آخرین دست‌بافت‌ها</span>
                  </>
                )}
              </button>
            </div>

            {/* ستون پیش‌نمایش و گزارش فشرده‌سازی */}
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              {compressedData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-200/70 pb-3">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      آماده آپلود (WebP بهینه‌شده)
                    </span>
                    <span className="text-xs font-bold text-primary-pink bg-primary-pink/10 px-3 py-1 rounded-full">
                      کادر: {compressedData.orientationLabel}
                    </span>
                  </div>

                  <div className="max-h-80 overflow-hidden rounded-2xl bg-white border border-gray-200 flex items-center justify-center p-2">
                    <img
                      src={compressedData.previewUrl}
                      alt="پیش‌نمایش"
                      className="max-h-72 w-auto h-auto object-contain rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-sans bg-white p-4 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-gray-400 block mb-0.5">حجم اولیه عکس:</span>
                      <strong className="text-gray-600 line-through">
                        {compressedData.originalSizeKB.toLocaleString("fa-IR")} کیلوبایت
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-0.5">حجم نهایی WebP:</span>
                      <strong className="text-emerald-600 text-sm">
                        {compressedData.compressedSizeKB.toLocaleString("fa-IR")} کیلوبایت ✨
                      </strong>
                    </div>
                    <div className="col-span-2 pt-2 border-t border-gray-50">
                      <span className="text-gray-400 block mb-1">
                        نام انگلیسی یکتا برای ذخیره در سوپابیس:
                      </span>
                      <code
                        dir="ltr"
                        className="block text-[11px] bg-gray-50 text-gray-700 p-2 rounded-lg break-all font-mono"
                      >
                        {compressedData.fileName}
                      </code>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 font-sans p-6">
                  <ImageIcon className="w-12 h-12 mb-3 opacity-40" />
                  <p className="text-sm font-bold text-gray-500 mb-1">
                    هنوز عکسی انتخاب نشده است
                  </p>
                  <p className="text-xs">
                    پس از انتخاب عکس، پیش‌نمایش کادر پینترستی و حجم فشرده‌شده اینجا نمایش داده می‌شود.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* لیست عکس‌های منتشر شده */}
        <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-text-dark">
              تصاویر منتشر شده در صفحه اصلی ({items.length.toLocaleString("fa-IR")})
            </h2>
          </div>

          {loadingItems ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-8 h-8 text-primary-pink animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-14 text-gray-400 font-sans">
              هنوز هیچ عکسی در این بخش آپلود نشده است.
            </div>
          ) : (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="break-inside-avoid bg-gray-50 rounded-2xl overflow-hidden border border-gray-200/80 relative group"
                >
                  <img
                    src={item.image_url}
                    alt={item.title || "دست‌بافت آماده شده"}
                    className="w-full h-auto block"
                  />

                  <div className="p-3 bg-white flex items-center justify-between gap-2">
                    <div className="truncate">
                      <p className="text-xs font-bold text-text-dark truncate">
                        {item.title || "بافته شده با دست"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-sans">
                        {item.file_size_kb
                          ? `${item.file_size_kb.toLocaleString("fa-IR")} کیلوبایت`
                          : "WebP"}{" "}
                        • {new Date(item.created_at).toLocaleDateString("fa-IR")}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      title="حذف تصویر"
                      className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0 cursor-pointer"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}