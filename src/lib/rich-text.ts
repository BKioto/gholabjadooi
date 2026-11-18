// مسیر فایل: src/lib/rich-text.ts
// تجزیه‌ی متن صفحات لندینگ: **ضخیم** و [متن لینک](/مسیر) و ترکیب این دو
// (لینک داخل ضخیم مثل **[متن](/مسیر):** و ضخیم داخل لینک مثل [**متن**](/مسیر)).
// فایل خالص است (بدون React) تا هم در Rich.tsx و هم برای ساخت متن ساده‌ی JSON-LD استفاده شود.

export type RichNode =
  | { type: "text"; value: string }
  | { type: "bold"; children: RichNode[] }
  | { type: "link"; href: string; children: RichNode[] };

// لینک مارک‌داون در یک موقعیت مشخص (sticky)
const LINK_AT = /\[([^\]]+)\]\(([^)]*)\)/y;
// آدرس مطلق دامنه‌ی خودمان (با www یا بدون آن)
const OWN_SITE = /^https?:\/\/(?:www\.)?gholabjadooi\.ir(?=[/?#]|$)/i;

// آدرس مطلق دامنه‌ی خودمان را به مسیر نسبی تبدیل می‌کند
export function normalizeHref(raw: string): string {
  let href = raw.trim();
  const own = href.match(OWN_SITE);
  if (own) {
    href = href.slice(own[0].length);
    if (href === "") href = "/";
    else if (href.startsWith("?") || href.startsWith("#")) href = `/${href}`;
  }
  return href;
}

function matchLinkAt(s: string, i: number): RegExpExecArray | null {
  LINK_AT.lastIndex = i;
  return LINK_AT.exec(s);
}

// پایان یک بخش ضخیم را پیدا می‌کند و لینک‌های داخل آن را رد می‌کند (تا ** داخل برچسب لینک اشتباه گرفته نشود)
function findBoldEnd(s: string, from: number): number {
  let j = from;
  while (j < s.length) {
    if (s[j] === "[") {
      const m = matchLinkAt(s, j);
      if (m) {
        j += m[0].length;
        continue;
      }
    }
    if (s.startsWith("**", j)) return j;
    j++;
  }
  return -1;
}

export function parseRich(s: string): RichNode[] {
  const out: RichNode[] = [];
  let buf = "";
  let i = 0;
  const flush = () => {
    if (buf) {
      out.push({ type: "text", value: buf });
      buf = "";
    }
  };

  while (i < s.length) {
    const ch = s[i];

    if (ch === "[") {
      const m = matchLinkAt(s, i);
      if (m) {
        flush();
        out.push({ type: "link", href: normalizeHref(m[2]), children: parseRich(m[1]) });
        i += m[0].length;
        continue;
      }
      i++; // براکت ناقص: حذف می‌شود
      continue;
    }

    if (ch === "]") {
      i++; // براکت بسته‌ی بی‌جفت: حذف می‌شود
      continue;
    }

    if (ch === "*" && s.startsWith("**", i)) {
      const end = findBoldEnd(s, i + 2);
      if (end === -1) {
        i += 2; // ** بدون جفت: حذف می‌شود
        continue;
      }
      const inner = s.slice(i + 2, end);
      if (inner.trim()) {
        flush();
        out.push({ type: "bold", children: parseRich(inner) });
      }
      i = end + 2;
      continue;
    }

    buf += ch;
    i++;
  }

  flush();
  return out;
}

// متن ساده (بدون هیچ علامت): برای JSON-LD و جاهایی که فقط متن لازم است
export function richPlain(s: string): string {
  const walk = (nodes: RichNode[]): string =>
    nodes.map((n) => (n.type === "text" ? n.value : walk(n.children))).join("");
  return walk(parseRich(s));
}
