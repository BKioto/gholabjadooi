"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const trackedPath = useRef("");

  useEffect(() => {
    // جلوگیری از ثبت دوباره در صورت رفرش‌های تکراری سریع در یک صفحه
    if (trackedPath.current === pathname) return;
    trackedPath.current = pathname;

    const trackView = async () => {
      // ایجاد یک شناسه سشن موقت برای هر کاربر (جهت محاسبه بازدیدکننده یکتا)
      let sessionId = sessionStorage.getItem("gholab_session_id");
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem("gholab_session_id", sessionId);
      }

      // ارسال اطلاعات به سوپابیس در پس‌زمینه
      await supabase.from("page_views").insert([
        { 
          page_path: pathname, 
          session_id: sessionId 
        }
      ]);
    };

    trackView();
  }, [pathname]);

  return null; // این کامپوننت اصلاً در ظاهر سایت چیزی رندر نمی‌کند
}