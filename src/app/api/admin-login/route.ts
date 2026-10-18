// مسیر فایل: src/app/api/admin-login/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUsername =
      process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME;
    const validPassword =
      process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "متغیرهای ADMIN_USERNAME و ADMIN_PASSWORD در تنظیمات سرور (Vercel / .env.local) تعریف نشده‌اند.",
        },
        { status: 500 }
      );
    }

    if (username === validUsername && password === validPassword) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, message: "نام کاربری یا رمز عبور اشتباه است." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, message: "خطا در بررسی اطلاعات ورود." },
      { status: 400 }
    );
  }
}