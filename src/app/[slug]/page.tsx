// مسیر فایل: src/app/[slug]/page.tsx
// مسیر پویا برای ۳۰ صفحه‌ی لندینگ سئو. با generateStaticParams هر صفحه در زمان بیلد «استاتیک» ساخته می‌شود
// و با اسلاگ اختصاصی خودش (مثلاً /buy-crochet-bouquet) در دسترس است. هر ۱ ساعت یک‌بار محصولات داخلش تازه می‌شوند.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { landingPages, getLandingPage } from "@/data/landing/pages";
import { getCatalog } from "@/lib/landing-catalog";
import LandingView from "@/components/landing/LandingView";

export const dynamicParams = false; // هر آدرسی جز ۳۰ اسلاگ تعریف‌شده، ۴۰۴ می‌دهد
export const revalidate = 3600;

export function generateStaticParams() {
  return landingPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  const image = { url: `/landing/${page.slug}.webp`, width: 1672, height: 941, alt: page.imageAlt };
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { type: "website", locale: "fa_IR", siteName: "قلاب جادویی", url: `/${page.slug}`, title: page.metaTitle, description: page.metaDescription, images: [image] },
    twitter: { card: "summary_large_image", title: page.metaTitle, description: page.metaDescription, images: [image.url] },
  };
}

export default async function LandingRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();
  const catalog = await getCatalog();
  return <LandingView page={page} catalog={catalog} />;
}
