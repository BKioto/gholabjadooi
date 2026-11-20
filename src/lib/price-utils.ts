// مسیر فایل: src/lib/price-utils.ts
// ابزارهای قیمت: تبدیل ارقام، خواندن قیمتی که اسما می‌نویسد، تبدیل عدد به حروف، اعتبارسنجی کارت.
// این فایل هیچ وابستگی‌ای ندارد و هم در سرور و هم در مرورگر قابل استفاده است.

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** ارقام فارسی و عربی را به انگلیسی تبدیل می‌کند. */
export function normalizeDigits(input: string): string {
  return String(input ?? "")
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/** ارقام انگلیسی را فارسی می‌کند. */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** مثلاً 2500000 => ۲٬۵۰۰٬۰۰۰ */
export function formatNumber(n: number): string {
  const rounded = Math.round(Number(n) || 0);
  const sign = rounded < 0 ? "-" : "";
  const grouped = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
  return sign + toPersianDigits(grouped);
}

/** مثلاً 2500000 => ۲٬۵۰۰٬۰۰۰ تومان */
export function formatToman(n: number): string {
  return `${formatNumber(n)} تومان`;
}

// ---------------------------------------------------------------------------
// عدد به حروف: 2600000 => «دو میلیون و ششصد هزار»
// ---------------------------------------------------------------------------
const ONES = [
  "", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه", "ده",
  "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده",
];
const TENS = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const SCALES = ["", "هزار", "میلیون", "میلیارد", "هزار میلیارد"];

function threeDigits(n: number): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (rest) {
    if (rest < 20) {
      parts.push(ONES[rest]);
    } else {
      const t = Math.floor(rest / 10);
      const o = rest % 10;
      parts.push(o ? `${TENS[t]} و ${ONES[o]}` : TENS[t]);
    }
  }
  return parts.join(" و ");
}

export function numberToPersianWords(num: number): string {
  if (!Number.isFinite(num)) return "";
  let n = Math.floor(Math.abs(num));
  if (n === 0) return "صفر";
  const groups: number[] = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  if (groups.length > SCALES.length) return String(num);
  const out: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (!g) continue;
    if (i === 1 && g === 1) out.push("هزار"); // «هزار» نه «یک هزار»
    else if (i === 0) out.push(threeDigits(g));
    else out.push(`${threeDigits(g)} ${SCALES[i]}`);
  }
  return (num < 0 ? "منفی " : "") + out.join(" و ");
}

/** 2600000 => «دو میلیون و ششصد هزار تومان» */
export function tomanInWords(n: number): string {
  return `${numberToPersianWords(n)} تومان`;
}

// ---------------------------------------------------------------------------
// خواندن قیمتی که اسما می‌نویسد
// ---------------------------------------------------------------------------
export const MIN_PRICE = 10_000;
export const MAX_PRICE = 100_000_000;

export type ParsedPrice =
  | { ok: true; value: number }
  | { ok: false; reason: "not_a_price" | "out_of_range" | "rial" };

/**
 * قیمت‌هایی که پذیرفته می‌شود (همه به تومان):
 *   2.600.000  |  2,600,000  |  2600000  |  2.600  |  2600  |  2.6  |  ۲٫۶۰۰
 *   2 میلیون و 600 هزار  |  600 هزار  |  2.5 میلیون  |  2600000 تومان
 * اگر قیمت فعلیِ محصول (reference) داده شود، مقیاس درست (×۱، ×۱۰۰۰، ×۱۰۰۰۰۰۰)
 * بر اساس نزدیک‌ترین گزینه به قیمت فعلی انتخاب می‌شود.
 * متن‌هایی که قیمت نیستند (مثل «سلام» یا «۵ دقیقه دیگه») رد می‌شوند تا گفتگوی عادی گروه اشتباه برداشت نشود.
 */
export function parsePriceInput(raw: string, reference?: number | null): ParsedPrice {
  const s = normalizeDigits(String(raw ?? ""))
    .replace(/[\u200c\u200f\u200e\u00a0]/g, " ")
    .replace(/[٬،]/g, ",")
    .replace(/٫/g, ".")
    .trim();

  if (!s) return { ok: false, reason: "not_a_price" };
  if (/ریال/.test(s)) return { ok: false, reason: "rial" };

  const inRange = (v: number) => Number.isFinite(v) && v >= MIN_PRICE && v <= MAX_PRICE;

  // حالت حروفی: «2 میلیون و 600 هزار»
  if (/میلیون|هزار/.test(s)) {
    const leftover = s
      .replace(/[\d.,\s]/g, "")
      .replace(/میلیون|هزار|تومان|تومن|و/g, "");
    if (leftover) return { ok: false, reason: "not_a_price" };

    let total = 0;
    const mil = s.match(/(\d+(?:[.,]\d+)?)\s*میلیون/);
    const th = s.match(/(\d+(?:[.,]\d+)?)\s*هزار/);
    if (mil) total += parseFloat(mil[1].replace(",", ".")) * 1_000_000;
    if (th) total += parseFloat(th[1].replace(",", ".")) * 1_000;
    if (mil && !th) {
      const tail = s.slice(s.indexOf("میلیون") + "میلیون".length).match(/(\d{1,3})\s*$/);
      if (tail) total += parseInt(tail[1], 10) * 1_000; // «2 میلیون و 600» => 600 هزار
    }
    total = Math.round(total);
    if (!mil && !th) return { ok: false, reason: "not_a_price" };
    return inRange(total) ? { ok: true, value: total } : { ok: false, reason: "out_of_range" };
  }

  // حالت عددی
  const cleaned = s.replace(/(تومان|تومن|toman)/gi, "").replace(/\s+/g, "");
  if (!/^[\d.,]+$/.test(cleaned)) return { ok: false, reason: "not_a_price" };

  let candidates: number[];
  if (/^\d{1,3}([.,]\d{3})+$/.test(cleaned)) {
    // گروه‌بندی سه‌رقمی: 2.600.000 | 2,600 | 850.000
    const n = parseInt(cleaned.replace(/[.,]/g, ""), 10);
    candidates = n >= 100 ? [n, n * 1_000] : [];
  } else if (/^\d+[.,]\d{1,2}$/.test(cleaned)) {
    // اعشاری به‌معنای میلیون: 2.5 | 2.55
    const n = Math.round(parseFloat(cleaned.replace(",", ".")) * 1_000_000);
    candidates = [n];
  } else if (/^\d+$/.test(cleaned)) {
    const n = parseInt(cleaned, 10);
    // عددهای کوچک (مثل «۵» یا «۲۶») قیمت حساب نمی‌شوند تا گفتگوی عادی گروه اشتباه برداشت نشود
    candidates = n >= 100 ? [n, n * 1_000] : [];
  } else {
    return { ok: false, reason: "not_a_price" };
  }

  const valid = candidates.filter(inRange);
  if (valid.length === 0) return { ok: false, reason: "out_of_range" };

  const ref = Number(reference);
  if (Number.isFinite(ref) && ref > 0) {
    valid.sort((a, b) => Math.abs(Math.log(a / ref)) - Math.abs(Math.log(b / ref)));
    return { ok: true, value: valid[0] };
  }
  // بدون قیمت مرجع: کمتر از ۱۰۰ هزار را هزارتومان فرض می‌کنیم
  const pick = valid.find((v) => v >= 100_000) ?? valid[0];
  return { ok: true, value: pick };
}

// ---------------------------------------------------------------------------
// شماره کارت
// ---------------------------------------------------------------------------
export function isValidCardNumber(num: string): boolean {
  const d = normalizeDigits(num).replace(/\D/g, "");
  if (!/^\d{16}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let digit = Number(d[15 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

/** 6037991234567890 => 6037 9912 3456 7890 */
export function formatCardNumber(num: string): string {
  const d = normalizeDigits(num).replace(/\D/g, "");
  return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/** از متن «/card 6037... نام صاحب کارت» شماره و نام را جدا می‌کند. */
export function parseCardInput(arg: string): { number: string; owner: string } | null {
  const text = normalizeDigits(String(arg ?? ""));
  const m = text.match(/(\d[\d\s-]{14,22}\d)/);
  if (!m) return null;
  const number = m[1].replace(/\D/g, "");
  if (number.length !== 16) return null;
  const owner = text.replace(m[1], " ").replace(/\s+/g, " ").trim();
  return { number, owner };
}

// ---------------------------------------------------------------------------
// شماره موبایل ایران
// ---------------------------------------------------------------------------
export function normalizeIranMobile(input: string): string {
  let d = normalizeDigits(String(input ?? "")).replace(/\D/g, "");
  if (d.startsWith("0098")) d = "0" + d.slice(4);
  else if (d.startsWith("98") && d.length === 12) d = "0" + d.slice(2);
  else if (d.length === 10 && d.startsWith("9")) d = "0" + d;
  return d;
}

export function isValidIranMobile(input: string): boolean {
  return /^09\d{9}$/.test(normalizeIranMobile(input));
}
