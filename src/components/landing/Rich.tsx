// مسیر فایل: src/components/landing/Rich.tsx
// نمایش امن متن با پشتیبانی از **ضخیم** و [متن لینک](/مسیر) و ترکیب این دو
// (مثلاً **[متن](/مسیر):** یا [**متن**](/مسیر)) — بدون هیچ HTML خام.
// این کامپوننت سمت سرور است (بدون hook و state).

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { parseRich, type RichNode } from "@/lib/rich-text";

const LINK_CLASS = "text-primary-pink font-bold hover:underline";

function render(nodes: RichNode[], inLink: boolean): ReactNode[] {
  return nodes.map((n, i) => {
    if (n.type === "text") return <Fragment key={i}>{n.value}</Fragment>;

    if (n.type === "bold") {
      // داخل لینک، ضخیم رنگ خودِ لینک را حفظ می‌کند
      return (
        <strong key={i} className={inLink ? undefined : "text-text-dark"}>
          {render(n.children, inLink)}
        </strong>
      );
    }

    const kids = render(n.children, true);
    const href = n.href;
    if (/^\/(?!\/)|^#/.test(href)) {
      return (
        <Link key={i} href={href} className={LINK_CLASS}>
          {kids}
        </Link>
      );
    }
    if (/^https?:\/\//i.test(href)) {
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
          {kids}
        </a>
      );
    }
    if (/^(mailto|tel):/i.test(href)) {
      return (
        <a key={i} href={href} className={LINK_CLASS}>
          {kids}
        </a>
      );
    }
    // آدرس نامعتبر یا خالی: فقط متن نمایش داده می‌شود (هیچ علامت خامی دیده نمی‌شود)
    return <Fragment key={i}>{render(n.children, inLink)}</Fragment>;
  });
}

export default function Rich({ text }: { text: string }) {
  return <>{render(parseRich(text), false)}</>;
}
