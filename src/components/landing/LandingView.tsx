// مسیر فایل: src/components/landing/LandingView.tsx
// قالب مشترک همه‌ی صفحات لندینگ سئو (سمت سرور، بدون جاوااسکریپت اضافه برای کاربر)

import Link from "next/link";
import Image from "next/image";
import type { Block, LandingPage } from "@/data/landing/types";
import { SITE_URL, chipOf } from "@/data/landing/meta";
import { getLandingPage } from "@/data/landing/pages";
import { categoryPriceTable, formatToman, pickProducts, priceSummary, type CatalogProduct } from "@/lib/landing-catalog";
import Rich from "./Rich";

const plain = (s: string) => s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\*\*/g, "");

function BlockView({ b }: { b: Block }) {
  if (typeof b === "string") return <p className="text-gray-600 leading-8 font-sans"><Rich text={b} /></p>;
  if ("h3" in b) return <h3 className="text-xl font-bold text-text-dark pt-2">{b.h3}</h3>;
  if ("ul" in b) return <ul className="list-disc pr-6 space-y-2 text-gray-600 leading-8 font-sans marker:text-primary-pink">{b.ul.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ul>;
  if ("ol" in b) return <ol className="list-decimal pr-6 space-y-2 text-gray-600 leading-8 font-sans marker:text-primary-pink marker:font-bold">{b.ol.map((t, i) => <li key={i}><Rich text={t} /></li>)}</ol>;
  if ("tip" in b) return <div className="bg-soft-blue/30 border-r-4 border-primary-pink rounded-2xl p-5 text-gray-700 leading-8 font-sans"><Rich text={b.tip} /></div>;
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
      <table className="w-full text-sm font-sans text-right">
        <thead className="bg-soft-blue/30 text-text-dark"><tr>{b.table.head.map((h, i) => <th key={i} className="px-4 py-3 font-bold whitespace-nowrap">{h}</th>)}</tr></thead>
        <tbody>{b.table.rows.map((r, i) => <tr key={i} className="border-t border-gray-100">{r.map((c, j) => <td key={j} className="px-4 py-3 text-gray-600 leading-7"><Rich text={c} /></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function ProductCard({ p }: { p: CatalogProduct }) {
  return (
    <Link href={`/shop/${p.slug}`} className="bg-white rounded-3xl p-3 border border-gray-100 hover:border-primary-pink/30 hover:shadow-xl transition-all group flex flex-col">
      <div className="aspect-square rounded-2xl overflow-hidden bg-soft-blue/20 mb-3">
        {p.image && <img src={p.image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
      </div>
      <h3 className="text-sm font-bold text-text-dark leading-6 line-clamp-2">{p.title}</h3>
      <span className="mt-auto pt-2 text-primary-pink font-bold">{formatToman(p.price)} <small className="text-xs text-gray-400 font-normal">تومان</small></span>
    </Link>
  );
}

export default function LandingView({ page, catalog }: { page: LandingPage; catalog: CatalogProduct[] }) {
  const url = `${SITE_URL}/${page.slug}`;
  const products = pickProducts(catalog, page.match);
  const summary = priceSummary(products);
  const cats = [...new Map(products.filter((p) => p.categorySlug && p.categoryName).map((p) => [p.categorySlug!, p.categoryName!])).entries()];
  const priceRows = page.showPriceTable ? categoryPriceTable(catalog) : [];
  const date = new Date(page.updated).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });

  const graph = [
    {
      "@type": "WebPage", "@id": `${url}#webpage`, url, name: page.h1, description: page.metaDescription, inLanguage: "fa-IR",
      isPartOf: { "@type": "WebSite", name: "قلاب جادویی", url: SITE_URL },
      publisher: { "@type": "Organization", name: "قلاب جادویی", url: SITE_URL },
      primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/landing/${page.slug}.webp`, width: 1672, height: 941 },
      dateModified: page.updated, breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "راهنمای خرید", item: `${SITE_URL}/guides` },
        { "@type": "ListItem", position: 3, name: page.chip, item: url },
      ],
    },
    { "@type": "FAQPage", mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: plain(f.a) } })) },
    ...(products.length ? [{ "@type": "ItemList", name: page.productsTitle, itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/shop/${p.slug}`, name: p.title })) }] : []),
  ];
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

  const toc = [...page.sections.map((s) => ({ id: s.id, t: s.h2 })), { id: "faq", t: "سوالات متداول" }];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav aria-label="مسیر صفحه" className="text-xs text-gray-400 font-sans flex flex-wrap items-center gap-2">
          <Link href="/" className="hover:text-primary-pink">خانه</Link><span>›</span>
          <Link href="/guides" className="hover:text-primary-pink">راهنمای خرید</Link><span>›</span>
          <span className="text-gray-600">{page.chip}</span>
        </nav>

        <header className="mt-6 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl text-text-dark leading-tight">{page.h1}</h1>
            <div className="mt-5 space-y-4">{page.intro.map((t, i) => <p key={i} className="text-gray-600 leading-8 font-sans"><Rich text={t} /></p>)}</div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#products" className="px-6 py-3 rounded-2xl bg-primary-pink text-white font-bold hover:opacity-90 transition-opacity">مشاهده و خرید</a>
              <Link href="/contact" className="px-6 py-3 rounded-2xl border-2 border-primary-pink/40 text-primary-pink font-bold hover:bg-primary-pink/10 transition-colors">سفارش اختصاصی</Link>
            </div>
            <p className="mt-4 text-xs text-gray-400 font-sans">آخرین به‌روزرسانی: {date} · تهیه‌شده توسط تیم هنرمندان قلاب جادویی</p>
          </div>
          <Image src={`/landing/${page.slug}.webp`} alt={page.imageAlt} width={1200} height={675} priority sizes="(min-width: 1024px) 480px, 100vw" className="w-full h-auto rounded-3xl shadow-lg bg-soft-blue/20" />
        </header>

        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          <nav aria-label="فهرست مطالب" className="bg-white rounded-3xl border border-gray-100 p-6">
            <h2 className="font-bold text-text-dark mb-3">در این صفحه می‌خوانید</h2>
            <ol className="space-y-2 text-sm font-sans text-gray-600 list-decimal pr-5 marker:text-primary-pink">
              {toc.map((t) => <li key={t.id}><a href={`#${t.id}`} className="hover:text-primary-pink">{t.t}</a></li>)}
            </ol>
          </nav>
          <div className="bg-white rounded-3xl border border-gray-100 p-6">
            <h2 className="font-bold text-text-dark mb-3">خلاصه‌ی سریع</h2>
            <ul className="space-y-2 text-sm font-sans text-gray-600 leading-7">
              {summary && <li>📦 <strong>{summary.count.toLocaleString("fa-IR")}</strong> مدل آماده‌ی ارسال در همین صفحه</li>}
              {summary && summary.max > summary.min && <li>💰 قیمت از <strong>{formatToman(summary.min)}</strong> تا <strong>{formatToman(summary.max)}</strong> تومان</li>}
              <li>🚚 ارسال با پست پیشتاز به سراسر ایران (هزینه‌ی پستی به‌صورت پس‌کرایه)</li>
              <li>🎨 امکان سفارش اختصاصی با رنگ و طرح دلخواه</li>
            </ul>
          </div>
        </div>

        {products.length > 0 && (
          <section id="products" className="mt-14 scroll-mt-24">
            <h2 className="text-2xl font-bold text-text-dark mb-6">{page.productsTitle}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
              {cats.map(([slug, name]) => <Link key={slug} href={`/category/${slug}`} className="text-primary-pink hover:underline">همه‌ی محصولات «{name}» ←</Link>)}
              <Link href="/shop" className="text-gray-500 hover:text-primary-pink">مشاهده‌ی کل فروشگاه ←</Link>
            </div>
          </section>
        )}

        <article className="mt-14 space-y-14">
          {page.sections.map((s, si) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-text-dark">{s.h2}</h2>
              {s.blocks.map((b, i) => <BlockView key={i} b={b} />)}
              {si === 0 && priceRows.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                  <table className="w-full text-sm font-sans text-right">
                    <thead className="bg-soft-blue/30 text-text-dark"><tr><th className="px-4 py-3">دسته‌بندی</th><th className="px-4 py-3">تعداد مدل</th><th className="px-4 py-3">ارزان‌ترین</th><th className="px-4 py-3">گران‌ترین</th></tr></thead>
                    <tbody>{priceRows.map((r) => <tr key={r.name} className="border-t border-gray-100"><td className="px-4 py-3 font-bold text-text-dark">{r.name}</td><td className="px-4 py-3">{r.count.toLocaleString("fa-IR")}</td><td className="px-4 py-3">{formatToman(r.min)} تومان</td><td className="px-4 py-3">{formatToman(r.max)} تومان</td></tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </article>

        <section id="faq" className="mt-14 scroll-mt-24">
          <h2 className="text-2xl font-bold text-text-dark mb-6">سوالات متداول</h2>
          <div className="space-y-3">
            {page.faqs.map((f, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-gray-100 p-5">
                <summary className="cursor-pointer list-none flex justify-between items-center gap-4">
                  <h3 className="text-base font-bold text-text-dark">{f.q}</h3>
                  <span aria-hidden className="text-primary-pink text-2xl leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-gray-600 leading-8 font-sans"><Rich text={f.a} /></p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-14 bg-primary-pink/10 border border-primary-pink/20 rounded-3xl p-8 text-center">
          <h2 className="font-display text-3xl text-text-dark mb-3">طرح دلخواهت رو برامون بفرست</h2>
          <p className="text-gray-600 font-sans leading-8 max-w-2xl mx-auto">عکس یا ایده‌ات را در پیام‌رسان بله برای پشتیبانی بفرست؛ پیش از ثبت سفارش، مشاوره‌ی رایگان می‌گیری و قیمت و زمان دقیق را اعلام می‌کنیم.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <a href="https://ble.ir/gholabjadooi" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-2xl bg-primary-pink text-white font-bold hover:opacity-90 transition-opacity">گفتگو در بله</a>
            <Link href="/faq" className="px-6 py-3 rounded-2xl bg-white text-primary-pink font-bold border border-primary-pink/30 hover:bg-primary-pink/5 transition-colors">سوالات متداول فروشگاه</Link>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-text-dark mb-6">راهنماهای مرتبط</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.related.map((s) => {
              const r = getLandingPage(s);
              return (
                <Link key={s} href={`/${s}`} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-primary-pink/30 hover:shadow-lg transition-all">
                  <h3 className="font-bold text-text-dark mb-2">{chipOf(s)}</h3>
                  {r && <p className="text-xs text-gray-500 font-sans leading-6 line-clamp-3">{r.metaDescription}</p>}
                </Link>
              );
            })}
          </div>
          <p className="mt-6 text-sm font-sans"><Link href="/guides" className="text-primary-pink font-bold hover:underline">مشاهده‌ی همه‌ی راهنماهای خرید بافتنی دست‌ساز ←</Link></p>
        </section>
      </div>
    </div>
  );
}
