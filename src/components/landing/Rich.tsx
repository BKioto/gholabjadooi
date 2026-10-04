// مسیر فایل: src/components/landing/Rich.tsx
// نمایش امن متن با پشتیبانی از **ضخیم** و [متن لینک](/مسیر) — بدون هیچ HTML خام.

import { Fragment } from "react";
import Link from "next/link";

export default function Rich({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, href] = link;
          return /^https?:/.test(href) ? (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-primary-pink font-bold hover:underline">{label}</a>
          ) : (
            <Link key={i} href={href} className="text-primary-pink font-bold hover:underline">{label}</Link>
          );
        }
        const bold = p.match(/^\*\*([^*]+)\*\*$/);
        if (bold) return <strong key={i} className="text-text-dark">{bold[1]}</strong>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}
