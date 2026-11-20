-- =====================================================================
--  قلاب جادویی — سیستم «استعلام قیمت لحظه‌ای از فروشنده»
--  این فایل فقط برای بایگانی است؛ روی دیتابیس قبلاً اجرا شده.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ۱) جدول‌های جدید (همه قفل هستند و فقط سرور سایت به آن‌ها دسترسی دارد)
-- ---------------------------------------------------------------------

-- تنظیمات ربات بله (فقط یک ردیف)
create table if not exists public.bale_settings (
  id            int primary key default 1 check (id = 1),
  chat_id       text,
  setup_code    text not null default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  registered_at timestamptz,
  pending_card  jsonb,
  updated_at    timestamptz not null default now()
);
insert into public.bale_settings (id) values (1) on conflict (id) do nothing;

-- اطلاعات کارت (محافظت‌شده؛ از طریق سرور و فقط بعد از نهایی شدن قیمت‌ها نمایش داده می‌شود)
create table if not exists public.payment_settings (
  id              int primary key default 1 check (id = 1),
  card_number     text not null default '',
  card_owner_name text not null default '',
  updated_at      timestamptz not null default now()
);
insert into public.payment_settings (id, card_number, card_owner_name)
select 1, coalesce(card_number, ''), coalesce(card_owner_name, '')
from public.store_settings where id = 1
on conflict (id) do nothing;
insert into public.payment_settings (id) values (1) on conflict (id) do nothing;

-- نسخه‌ی ذخیره‌شده‌ی سبد خرید (برای برگشت از روی لینک ذخیره‌شده)
create table if not exists public.cart_sessions (
  token              uuid primary key,
  items              jsonb not null default '[]'::jsonb,
  accept_fluctuation boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- هر بار که مشتری «استعلام» می‌زند یک بسته (batch) ساخته می‌شود
create table if not exists public.price_batches (
  id          bigint generated always as identity primary key,
  token       uuid not null,
  ip_hash     text,
  total_items int not null default 1,
  created_at  timestamptz not null default now()
);
create index if not exists price_batches_ip_idx    on public.price_batches (ip_hash, created_at desc);
create index if not exists price_batches_token_idx on public.price_batches (token, created_at desc);

-- صف استعلام قیمت
create table if not exists public.price_inquiries (
  id                bigint generated always as identity primary key,
  token             uuid not null,
  batch_id          bigint references public.price_batches(id) on delete set null,
  batch_index       int not null default 1,
  batch_total       int not null default 1,
  product_id        uuid not null references public.products(id) on delete cascade,
  product_title     text not null,
  product_image     text,
  cart_price        numeric not null default 0,
  shown_price       numeric,
  proposed_price    numeric,
  final_price       numeric,
  status            text not null default 'queued'
                    check (status in ('queued','sending','sent','awaiting_price','awaiting_confirm','answered','cancelled','expired')),
  attempts          int not null default 0,
  last_error        text,
  next_attempt_at   timestamptz not null default now(),
  chat_id           text,
  message_id        bigint,
  message_kind      text check (message_kind in ('photo','text')),
  prompt_message_id bigint,
  reminders         int not null default 0,
  last_reminder_at  timestamptz,
  created_at        timestamptz not null default now(),
  sent_at           timestamptz,
  answered_at       timestamptz,
  locked_until      timestamptz,
  updated_at        timestamptz not null default now()
);
create index if not exists price_inquiries_token_idx  on public.price_inquiries (token, product_id, id desc);
create index if not exists price_inquiries_status_idx on public.price_inquiries (status, id);
-- در هر لحظه فقط «یک» استعلام فعال (ارسال‌شده برای اسما) می‌تواند وجود داشته باشد => صف یکی‌یکی
create unique index if not exists price_inquiries_one_active
  on public.price_inquiries ((true))
  where status in ('sending','sent','awaiting_price','awaiting_confirm');
-- برای هر مشتری و هر محصول فقط یک استعلام باز
create unique index if not exists price_inquiries_one_open_per_product
  on public.price_inquiries (token, product_id)
  where status in ('queued','sending','sent','awaiting_price','awaiting_confirm');

-- جلوگیری از پردازش دوباره‌ی یک پیام بله
create table if not exists public.bale_processed_updates (
  update_id  bigint primary key,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- ۲) ستون‌های جدید سفارش
-- ---------------------------------------------------------------------
alter table public.orders      add column if not exists order_code   text;
alter table public.orders      add column if not exists price_mode   text;
alter table public.orders      add column if not exists client_token uuid;
alter table public.order_items add column if not exists inquiry_id   bigint references public.price_inquiries(id) on delete set null;
alter table public.order_items add column if not exists price_state  text;

create unique index if not exists orders_order_code_key on public.orders (order_code) where order_code is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_price_mode_check') then
    alter table public.orders add constraint orders_price_mode_check
      check (price_mode is null or price_mode in ('confirmed','fluctuation','mixed'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'order_items_price_state_check') then
    alter table public.order_items add constraint order_items_price_state_check
      check (price_state is null or price_state in ('confirmed','fluctuation'));
  end if;
end $$;

-- ---------------------------------------------------------------------
-- ۳) قفل کردن جدول‌های جدید (RLS روشن و بدون policy = فقط سرور)
-- ---------------------------------------------------------------------
alter table public.bale_settings          enable row level security;
alter table public.payment_settings       enable row level security;
alter table public.cart_sessions          enable row level security;
alter table public.price_batches          enable row level security;
alter table public.price_inquiries        enable row level security;
alter table public.bale_processed_updates enable row level security;

revoke all on table public.bale_settings, public.payment_settings, public.cart_sessions,
  public.price_batches, public.price_inquiries, public.bale_processed_updates
  from anon, authenticated;

-- ---------------------------------------------------------------------
-- ۴) توابع
-- ---------------------------------------------------------------------

-- شکل امنِ یک استعلام برای نمایش به مشتری
create or replace function public.pi_public(i public.price_inquiries)
returns jsonb
language sql
set search_path = public
as $$
  select jsonb_build_object(
    'id',            i.id,
    'productId',     i.product_id,
    'status',        case when i.status = 'answered'  then 'answered'
                          when i.status = 'cancelled' then 'cancelled'
                          when i.status = 'expired'   then 'expired'
                          else 'waiting' end,
    'stage',         case when i.status in ('queued','sending') then 'queued'
                          when i.status in ('sent','awaiting_price','awaiting_confirm') then 'asking'
                          else i.status end,
    'previousPrice', i.cart_price,
    'finalPrice',    i.final_price,
    'answeredAt',    i.answered_at,
    'lockedUntil',   i.locked_until,
    'lockExpired',   (i.status = 'answered' and i.locked_until is not null and i.locked_until <= now()),
    'queueAhead',    case when i.status in ('queued','sending')
                          then (select count(*) from public.price_inquiries q
                                where q.status in ('queued','sending','sent','awaiting_price','awaiting_confirm')
                                  and q.id < i.id)
                          else 0 end,
    'createdAt',     i.created_at,
    'batchIndex',    i.batch_index,
    'batchTotal',    i.batch_total
  );
$$;

-- ساخت استعلام برای محصولات سبد خرید
create or replace function public.create_price_inquiries(
  p_token   uuid,
  p_ip_hash text,
  p_items   jsonb,
  p_cart    jsonb default null,
  p_accept  boolean default false
) returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_open    boolean;
  v_item    jsonb;
  v_pid     uuid;
  v_price   numeric;
  v_prod    record;
  v_row     public.price_inquiries;
  v_batch   bigint;
  v_n       int;
  v_idx     int := 0;
  v_cnt     int;
  v_results jsonb := '[]'::jsonb;
  v_skipped jsonb := '[]'::jsonb;
  v_todo    jsonb := '[]'::jsonb;
  v_t       jsonb;
  v_seen    uuid[] := '{}';
begin
  select coalesce(is_open, true) into v_open from public.store_settings where id = 1;
  if not coalesce(v_open, true) then
    return jsonb_build_object('ok', false, 'reason', 'store_closed');
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 12 then
    return jsonb_build_object('ok', false, 'reason', 'bad_items');
  end if;

  -- محدودیت تعداد درخواست (جلوگیری از شلوغ‌کردن گروه)
  select count(*) into v_cnt from public.price_batches
   where token = p_token and created_at > now() - interval '1 hour';
  if v_cnt >= 25 then
    return jsonb_build_object('ok', false, 'reason', 'rate_limited');
  end if;
  if p_ip_hash is not null then
    select count(*) into v_cnt from public.price_batches
     where ip_hash = p_ip_hash and created_at > now() - interval '1 hour';
    if v_cnt >= 60 then
      return jsonb_build_object('ok', false, 'reason', 'rate_limited');
    end if;
  end if;

  -- ذخیره‌ی نسخه‌ی سبد برای برگشت از لینک ذخیره‌شده
  if p_cart is not null and jsonb_typeof(p_cart) = 'array' and jsonb_array_length(p_cart) <= 40 then
    insert into public.cart_sessions (token, items, accept_fluctuation)
    values (p_token, p_cart, coalesce(p_accept, false))
    on conflict (token) do update
      set items = excluded.items,
          accept_fluctuation = excluded.accept_fluctuation,
          updated_at = now();
  end if;

  -- مرحله‌ی اول: تشخیص اینکه برای کدام محصول‌ها استعلام تازه لازم است
  for v_item in select value from jsonb_array_elements(p_items) loop
    if coalesce(v_item ->> 'productId', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_skipped := v_skipped || jsonb_build_object('productId', v_item ->> 'productId', 'reason', 'bad_id');
      continue;
    end if;
    v_pid := (v_item ->> 'productId')::uuid;
    if v_pid = any(v_seen) then
      continue; -- همان محصول چند بار در یک درخواست آمده
    end if;
    v_seen := v_seen || v_pid;
    v_price := case when coalesce(v_item ->> 'cartPrice', '') ~ '^[0-9]{1,10}$' then (v_item ->> 'cartPrice')::numeric else null end;

    select id, title, price, images, is_available into v_prod from public.products where id = v_pid;
    if not found or coalesce(v_prod.is_available, true) = false then
      v_skipped := v_skipped || jsonb_build_object('productId', v_pid, 'reason', 'unavailable');
      continue;
    end if;

    -- استعلام باز دارد؟
    select * into v_row from public.price_inquiries
     where token = p_token and product_id = v_pid
       and status in ('queued','sending','sent','awaiting_price','awaiting_confirm')
     limit 1;
    if found then
      v_results := v_results || public.pi_public(v_row);
      continue;
    end if;

    -- جواب معتبر (قفل‌شده) دارد؟
    select * into v_row from public.price_inquiries
     where token = p_token and product_id = v_pid
       and status = 'answered' and locked_until > now()
     order by id desc limit 1;
    if found then
      v_results := v_results || public.pi_public(v_row);
      continue;
    end if;

    v_todo := v_todo || jsonb_build_object(
      'pid', v_pid,
      'title', v_prod.title,
      'image', coalesce(v_prod.images[1], ''),
      'cartPrice', coalesce(v_price, v_prod.price)
    );
  end loop;

  -- مرحله‌ی دوم: ساخت بسته و استعلام‌ها
  v_n := jsonb_array_length(v_todo);
  if v_n > 0 then
    insert into public.price_batches (token, ip_hash, total_items)
    values (p_token, p_ip_hash, v_n) returning id into v_batch;

    for v_t in select value from jsonb_array_elements(v_todo) loop
      v_idx := v_idx + 1;
      begin
        insert into public.price_inquiries
          (token, batch_id, batch_index, batch_total, product_id, product_title, product_image, cart_price)
        values
          (p_token, v_batch, v_idx, v_n, (v_t ->> 'pid')::uuid, v_t ->> 'title',
           nullif(v_t ->> 'image', ''), (v_t ->> 'cartPrice')::numeric)
        returning * into v_row;
      exception when unique_violation then
        select * into v_row from public.price_inquiries
         where token = p_token and product_id = (v_t ->> 'pid')::uuid
           and status in ('queued','sending','sent','awaiting_price','awaiting_confirm')
         limit 1;
      end;
      if v_row.id is not null then
        v_results := v_results || public.pi_public(v_row);
      end if;
    end loop;
  end if;

  return jsonb_build_object('ok', true, 'inquiries', v_results, 'skipped', v_skipped, 'storeOpen', true);
end;
$$;

-- وضعیت استعلام‌های یک مشتری (آخرین استعلام هر محصول)
create or replace function public.get_price_inquiries(p_token uuid)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_list jsonb;
  v_open boolean;
begin
  select coalesce(is_open, true) into v_open from public.store_settings where id = 1;
  select coalesce(jsonb_agg(public.pi_public(p) order by p.id), '[]'::jsonb) into v_list
  from public.price_inquiries p
  where p.id in (
    select distinct on (product_id) id
    from public.price_inquiries
    where token = p_token and created_at > now() - interval '3 days'
    order by product_id, id desc
  );
  return jsonb_build_object('ok', true, 'inquiries', v_list, 'storeOpen', coalesce(v_open, true), 'serverTime', now());
end;
$$;

-- لغو استعلام باز یک محصول (مثلاً مشتری محصول را از سبد حذف کرد)
create or replace function public.cancel_price_inquiry(p_token uuid, p_product_id uuid)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  r public.price_inquiries;
begin
  update public.price_inquiries
     set status = 'cancelled', updated_at = now()
   where token = p_token and product_id = p_product_id
     and status in ('queued','sending','sent','awaiting_price','awaiting_confirm')
  returning * into r;
  if not found then
    return null;
  end if;
  return to_jsonb(r);
end;
$$;

-- انتخاب استعلام بعدیِ صف برای ارسال به اسما (فقط وقتی هیچ استعلام فعالی نیست)
create or replace function public.dispatch_next_inquiry()
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  r        public.price_inquiries;
  v_price  numeric;
  v_remain int;
begin
  -- ارسال‌های نیمه‌کاره (بیش از ۲ دقیقه) را به صف برگردان
  update public.price_inquiries
     set status = 'queued', next_attempt_at = now(), updated_at = now()
   where status = 'sending' and updated_at < now() - interval '2 minutes';

  if exists (select 1 from public.price_inquiries
              where status in ('sending','sent','awaiting_price','awaiting_confirm')) then
    return null;
  end if;

  select * into r from public.price_inquiries
   where status = 'queued' and next_attempt_at <= now()
   order by id
   limit 1
   for update skip locked;
  if not found then
    return null;
  end if;

  select price into v_price from public.products where id = r.product_id;

  begin
    update public.price_inquiries
       set status = 'sending', shown_price = v_price, attempts = attempts + 1, updated_at = now()
     where id = r.id and status = 'queued'
    returning * into r;
  exception when unique_violation then
    return null;
  end;
  if r.status is distinct from 'sending' then
    return null;
  end if;

  select count(*) into v_remain from public.price_inquiries where status = 'queued';
  return to_jsonb(r) || jsonb_build_object('queueRemaining', v_remain);
end;
$$;

-- بعد از ارسال موفق پیام به بله
create or replace function public.mark_inquiry_sent(p_id bigint, p_chat_id text, p_message_id bigint, p_kind text)
returns boolean
language plpgsql
set search_path = public
as $$
begin
  update public.price_inquiries
     set status = 'sent', chat_id = p_chat_id, message_id = p_message_id, message_kind = p_kind,
         sent_at = now(), last_reminder_at = now(), last_error = null, updated_at = now()
   where id = p_id and status = 'sending';
  return found;
end;
$$;

-- اگر ارسال به بله شکست خورد، دوباره به صف برگرد (با کمی تأخیر)
create or replace function public.release_inquiry_send(p_id bigint, p_error text)
returns void
language plpgsql
set search_path = public
as $$
begin
  update public.price_inquiries
     set status = 'queued',
         last_error = left(coalesce(p_error, ''), 300),
         next_attempt_at = now() + (least(attempts, 6) * interval '30 seconds'),
         updated_at = now()
   where id = p_id and status = 'sending';
end;
$$;

-- اقدام‌های اسما روی استعلام فعال
create or replace function public.inquiry_apply(
  p_id                bigint,
  p_action            text,
  p_price             numeric default null,
  p_prompt_message_id bigint default null
) returns jsonb
language plpgsql
set search_path = public
as $$
declare
  r       public.price_inquiries;
  v_final numeric;
  v_old   numeric;
  v_yarn  numeric;
  v_base  numeric;
begin
  select * into r from public.price_inquiries where id = p_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;

  if p_action = 'request_edit' then
    if r.status not in ('sent','awaiting_price','awaiting_confirm') then
      return jsonb_build_object('ok', false, 'reason', 'not_active', 'status', r.status);
    end if;
    update public.price_inquiries
       set status = 'awaiting_price', proposed_price = null, updated_at = now()
     where id = p_id returning * into r;
    return jsonb_build_object('ok', true, 'inquiry', to_jsonb(r));

  elsif p_action = 'back' then
    if r.status not in ('awaiting_price','awaiting_confirm') then
      return jsonb_build_object('ok', false, 'reason', 'not_active', 'status', r.status);
    end if;
    update public.price_inquiries
       set status = 'sent', proposed_price = null, updated_at = now()
     where id = p_id returning * into r;
    return jsonb_build_object('ok', true, 'inquiry', to_jsonb(r));

  elsif p_action = 'propose' then
    if r.status not in ('sent','awaiting_price','awaiting_confirm') then
      return jsonb_build_object('ok', false, 'reason', 'not_active', 'status', r.status);
    end if;
    if p_price is null or p_price < 10000 or p_price > 100000000 or p_price <> trunc(p_price) then
      return jsonb_build_object('ok', false, 'reason', 'bad_price');
    end if;
    update public.price_inquiries
       set status = 'awaiting_confirm', proposed_price = p_price,
           prompt_message_id = p_prompt_message_id, updated_at = now()
     where id = p_id returning * into r;
    return jsonb_build_object('ok', true, 'inquiry', to_jsonb(r));

  elsif p_action = 'reject' then
    if r.status <> 'awaiting_confirm' then
      return jsonb_build_object('ok', false, 'reason', 'not_active', 'status', r.status);
    end if;
    update public.price_inquiries
       set status = 'awaiting_price', proposed_price = null, updated_at = now()
     where id = p_id returning * into r;
    return jsonb_build_object('ok', true, 'inquiry', to_jsonb(r));

  elsif p_action = 'accept' then
    if r.status <> 'awaiting_confirm' then
      return jsonb_build_object('ok', false, 'reason', 'not_active', 'status', r.status);
    end if;
    if r.proposed_price is distinct from p_price then
      return jsonb_build_object('ok', false, 'reason', 'stale');
    end if;
    v_final := p_price;

  elsif p_action = 'confirm_same' then
    if r.status not in ('sent','awaiting_price') then
      return jsonb_build_object('ok', false, 'reason', 'not_active', 'status', r.status);
    end if;
    v_final := coalesce(r.shown_price, (select price from public.products where id = r.product_id));

  else
    return jsonb_build_object('ok', false, 'reason', 'bad_action');
  end if;

  -- ثبت قیمت نهایی (accept و confirm_same)
  select price, yarn_usage into v_old, v_yarn from public.products where id = r.product_id for update;
  select base_yarn_price into v_base from public.store_settings where id = 1;

  if v_old is distinct from v_final then
    update public.products
       set price = v_final,
           labor_profit = greatest(0, v_final - round(coalesce(v_yarn, 0) * coalesce(v_base, 0)))
     where id = r.product_id;
  end if;

  update public.price_inquiries
     set status = 'answered', final_price = v_final, proposed_price = null,
         answered_at = now(), locked_until = now() + interval '3 hours', updated_at = now()
   where id = r.id returning * into r;

  return jsonb_build_object('ok', true, 'inquiry', to_jsonb(r),
                            'oldPrice', v_old, 'newPrice', v_final,
                            'changed', (v_old is distinct from v_final));
end;
$$;

-- قیمت‌گذاری سبد خرید (تنها منبع قابل‌اعتماد قیمت؛ هم برای نمایش و هم برای ثبت سفارش)
create or replace function public.quote_cart(p_token uuid, p_items jsonb, p_accept boolean default false)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  c_packaging constant numeric := 50000;
  v_open    boolean;
  v_item    jsonb;
  v_pid     uuid;
  v_qty     int;
  v_color   text;
  v_prod    record;
  v_lock    record;
  v_price   numeric;
  v_state   text;
  v_inq     bigint;
  v_until   timestamptz;
  v_min_until timestamptz;
  v_lines   jsonb := '[]'::jsonb;
  v_sub     numeric := 0;
  v_conf    int := 0;
  v_fluct   int := 0;
  v_needs   int := 0;
  v_unav    int := 0;
  v_reasons jsonb := '[]'::jsonb;
  v_mode    text;
  v_can     boolean;
begin
  select coalesce(is_open, true) into v_open from public.store_settings where id = 1;
  v_open := coalesce(v_open, true);

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('ok', false, 'reason', 'empty_cart');
  end if;
  if jsonb_array_length(p_items) > 40 then
    return jsonb_build_object('ok', false, 'reason', 'too_many_items');
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if coalesce(v_item ->> 'productId', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      return jsonb_build_object('ok', false, 'reason', 'bad_items');
    end if;
    v_pid   := (v_item ->> 'productId')::uuid;
    v_qty   := case when coalesce(v_item ->> 'quantity', '') ~ '^[0-9]{1,2}$'
                    then greatest(1, (v_item ->> 'quantity')::int) else 1 end;
    v_color := nullif(left(coalesce(v_item ->> 'color', ''), 60), '');
    v_inq   := null;
    v_until := null;

    select id, title, price, images, is_available into v_prod from public.products where id = v_pid;

    if not found or coalesce(v_prod.is_available, true) = false then
      v_state := 'unavailable';
      v_price := coalesce(v_prod.price, 0);
      v_unav  := v_unav + 1;
    else
      select id, final_price, locked_until into v_lock
        from public.price_inquiries
       where token = p_token and product_id = v_pid
         and status = 'answered' and locked_until > now()
       order by id desc limit 1;
      if found then
        v_state := 'confirmed';
        v_price := v_lock.final_price;
        v_inq   := v_lock.id;
        v_until := v_lock.locked_until;
        v_conf  := v_conf + 1;
        if v_min_until is null or v_until < v_min_until then v_min_until := v_until; end if;
      elsif coalesce(p_accept, false) then
        v_state := 'fluctuation';
        v_price := v_prod.price;
        v_fluct := v_fluct + 1;
      else
        v_state := 'needs_inquiry';
        v_price := v_prod.price;
        v_needs := v_needs + 1;
      end if;
    end if;

    v_sub := v_sub + (v_price * v_qty);
    v_lines := v_lines || jsonb_build_object(
      'productId',   v_pid,
      'title',       coalesce(v_prod.title, ''),
      'image',       coalesce(v_prod.images[1], ''),
      'color',       v_color,
      'quantity',    v_qty,
      'unitPrice',   v_price,
      'lineTotal',   v_price * v_qty,
      'state',       v_state,
      'inquiryId',   v_inq,
      'lockedUntil', v_until
    );
  end loop;

  if not v_open then v_reasons := v_reasons || to_jsonb('store_closed'::text); end if;
  if v_unav  > 0 then v_reasons := v_reasons || to_jsonb('unavailable'::text); end if;
  if v_needs > 0 then v_reasons := v_reasons || to_jsonb('needs_inquiry'::text); end if;

  v_can := v_open and v_unav = 0 and v_needs = 0 and (v_conf + v_fluct) > 0;
  v_mode := case when v_conf > 0 and v_fluct = 0 then 'confirmed'
                 when v_conf = 0 and v_fluct > 0 then 'fluctuation'
                 when v_conf > 0 and v_fluct > 0 then 'mixed'
                 else null end;

  return jsonb_build_object(
    'ok',          true,
    'storeOpen',   v_open,
    'canOrder',    v_can,
    'reasons',     v_reasons,
    'priceMode',   v_mode,
    'lines',       v_lines,
    'subtotal',    v_sub,
    'packaging',   c_packaging,
    'total',       v_sub + c_packaging,
    'lockedUntil', v_min_until,
    'serverTime',  now()
  );
end;
$$;

-- ثبت سفارش به‌صورت یکپارچه (یا همه‌چیز ثبت می‌شود یا هیچ‌چیز)
create or replace function public.create_order_atomic(
  p_token          uuid,
  p_items          jsonb,
  p_accept         boolean,
  p_name           text,
  p_phone          text,
  p_address        text,
  p_postal         text,
  p_expected_total numeric default null
) returns jsonb
language plpgsql
set search_path = public
as $$
declare
  q          jsonb;
  v_name     text := btrim(coalesce(p_name, ''));
  v_phone    text := btrim(coalesce(p_phone, ''));
  v_address  text := btrim(coalesce(p_address, ''));
  v_postal   text := btrim(coalesce(p_postal, ''));
  v_exist    record;
  v_order_id uuid;
  v_code     text;
  v_try      int := 0;
  v_line     jsonb;
begin
  if length(v_name) < 2 or length(v_name) > 80 then
    return jsonb_build_object('ok', false, 'reason', 'bad_name');
  end if;
  if v_phone !~ '^09[0-9]{9}$' then
    return jsonb_build_object('ok', false, 'reason', 'bad_phone');
  end if;
  if length(v_address) < 8 or length(v_address) > 600 then
    return jsonb_build_object('ok', false, 'reason', 'bad_address');
  end if;
  if v_postal <> '' and v_postal !~ '^[0-9]{10}$' then
    return jsonb_build_object('ok', false, 'reason', 'bad_postal');
  end if;

  -- جلوگیری از ثبت دوبارهٔ سفارش (دوبار کلیک)
  select id, order_code, total_amount, price_mode into v_exist
    from public.orders
   where client_token = p_token and customer_phone = v_phone
     and created_at > now() - interval '3 minutes'
   order by created_at desc limit 1;
  if found then
    return jsonb_build_object('ok', true, 'duplicate', true, 'orderId', v_exist.id,
                              'orderCode', v_exist.order_code, 'total', v_exist.total_amount,
                              'priceMode', v_exist.price_mode);
  end if;

  q := public.quote_cart(p_token, p_items, p_accept);
  if not coalesce((q ->> 'ok')::boolean, false) then
    return jsonb_build_object('ok', false, 'reason', coalesce(q ->> 'reason', 'bad_items'));
  end if;
  if not coalesce((q ->> 'canOrder')::boolean, false) then
    return jsonb_build_object('ok', false, 'reason', 'not_orderable', 'quote', q);
  end if;
  if p_expected_total is not null and (q ->> 'total')::numeric <> p_expected_total then
    return jsonb_build_object('ok', false, 'reason', 'price_changed', 'quote', q);
  end if;

  loop
    v_code := 'QJ-' || lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    begin
      insert into public.orders
        (customer_name, customer_phone, customer_address, postal_code, total_amount, status,
         order_code, price_mode, client_token)
      values
        (v_name, v_phone, v_address, nullif(v_postal, ''), (q ->> 'total')::numeric, 'pending',
         v_code, q ->> 'priceMode', p_token)
      returning id into v_order_id;
      exit;
    exception when unique_violation then
      v_try := v_try + 1;
      if v_try > 8 then raise; end if;
    end;
  end loop;

  for v_line in select value from jsonb_array_elements(q -> 'lines') loop
    insert into public.order_items
      (order_id, product_id, quantity, price_at_time, selected_color, inquiry_id, price_state)
    values
      (v_order_id, (v_line ->> 'productId')::uuid, (v_line ->> 'quantity')::int,
       (v_line ->> 'unitPrice')::numeric, nullif(v_line ->> 'color', ''),
       nullif(v_line ->> 'inquiryId', '')::bigint,
       case when v_line ->> 'state' = 'confirmed' then 'confirmed' else 'fluctuation' end);
  end loop;

  return jsonb_build_object('ok', true, 'duplicate', false, 'orderId', v_order_id, 'orderCode', v_code,
                            'total', (q ->> 'total')::numeric, 'priceMode', q ->> 'priceMode',
                            'lines', q -> 'lines');
end;
$$;

-- جلوگیری از پردازش تکراری یک پیام بله (true = تازه است)
create or replace function public.claim_bale_update(p_update_id bigint)
returns boolean
language plpgsql
set search_path = public
as $$
begin
  insert into public.bale_processed_updates (update_id) values (p_update_id) on conflict do nothing;
  if not found then
    return false;
  end if;
  if random() < 0.02 then
    delete from public.bale_processed_updates where created_at < now() - interval '3 days';
  end if;
  return true;
end;
$$;

-- نگهداری صف: ارسال‌های گیرکرده، یادآوری، و منقضی‌کردن استعلام‌های خیلی قدیمی
create or replace function public.inquiry_maintenance()
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_expired   jsonb;
  v_reminders jsonb;
begin
  update public.price_inquiries
     set status = 'queued', next_attempt_at = now(), updated_at = now()
   where status = 'sending' and updated_at < now() - interval '2 minutes';

  with e as (
    update public.price_inquiries
       set status = 'expired', updated_at = now()
     where status in ('queued','sending','sent','awaiting_price','awaiting_confirm')
       and created_at < now() - interval '12 hours'
    returning *
  )
  select coalesce(jsonb_agg(to_jsonb(e)), '[]'::jsonb) into v_expired from e;

  with rem as (
    update public.price_inquiries
       set reminders = reminders + 1, last_reminder_at = now(), updated_at = now()
     where status in ('sent','awaiting_price','awaiting_confirm')
       and reminders < 3
       and coalesce(last_reminder_at, sent_at) < now() - interval '15 minutes'
    returning *
  )
  select coalesce(jsonb_agg(to_jsonb(rem)), '[]'::jsonb) into v_reminders from rem;

  return jsonb_build_object('expired', v_expired, 'reminders', v_reminders);
end;
$$;

-- ---------------------------------------------------------------------
-- ۵) فقط سرور سایت (service_role) اجازه‌ی اجرای توابع را دارد
-- ---------------------------------------------------------------------
do $$
declare
  f record;
begin
  for f in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('pi_public','create_price_inquiries','get_price_inquiries','cancel_price_inquiry',
                        'dispatch_next_inquiry','mark_inquiry_sent','release_inquiry_send','inquiry_apply',
                        'quote_cart','create_order_atomic','claim_bale_update','inquiry_maintenance')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
