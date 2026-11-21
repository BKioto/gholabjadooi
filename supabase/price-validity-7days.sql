-- =====================================================================
--  قلاب جادویی — اعتبار ۷ روزه‌ی «قیمتِ تأییدشده» (مشترک بین همه‌ی مشتری‌ها)
--  این فایل فقط برای بایگانی است؛ روی دیتابیس قبلاً اجرا شده.
-- =====================================================================
--  قانون جدید:
--   • وقتی اسما قیمتِ یک محصول را تأیید می‌کند («قیمت درسته») یا اصلاح می‌کند («قیمت جدید»)،
--     آن قیمت ۷ روز برای «همه‌ی مشتری‌ها» معتبر است (نه فقط مشتریِ سؤال‌کننده).
--   • در این ۷ روز برای آن محصول دیگر استعلام ساخته نمی‌شود و پیامی به گروه نمی‌رود.
--   • اگر در این فاصله قیمت محصول از جای دیگری (مثلاً پنل ادمین) عوض شود، تأییدیه باطل می‌شود.
--   • هر درخواست استعلام فقط برای «یک» محصول مجاز است (استعلام گروهیِ همه‌ی سبد حذف شد).
--   • مدت اعتبار فقط در تابع price_validity() نوشته شده؛ برای تغییر، همان را عوض کن.
-- =====================================================================

-- ---------------------------------------------------------------------
-- ۱) مدت اعتبار قیمت (تنها جایی که عدد «۷ روز» نوشته شده)
-- ---------------------------------------------------------------------
create or replace function public.price_validity()
returns interval
language sql
immutable
set search_path = public
as $$ select interval '7 days' $$;

-- ---------------------------------------------------------------------
-- ۲) جدولِ «قیمت تأییدشده‌ی هر محصول» (برای هر محصول یک ردیف؛ فقط سرور سایت دسترسی دارد)
-- ---------------------------------------------------------------------
create table if not exists public.product_price_confirmations (
  product_id   uuid primary key references public.products(id) on delete cascade,
  price        numeric not null check (price >= 0),
  confirmed_at timestamptz not null default now(),
  valid_until  timestamptz not null,
  inquiry_id   bigint references public.price_inquiries(id) on delete set null,
  updated_at   timestamptz not null default now()
);

alter table public.product_price_confirmations enable row level security;
revoke all on table public.product_price_confirmations from anon, authenticated;

-- تأییدیه‌ی «معتبر» = هنوز منقضی نشده + قیمت محصول بعد از تأیید عوض نشده
create or replace function public.valid_price_confirmation(p_product uuid)
returns setof public.product_price_confirmations
language sql
stable
set search_path = public
as $$
  select c.*
    from public.product_price_confirmations c
    join public.products p on p.id = c.product_id
   where c.product_id = p_product
     and c.valid_until > now()
     and c.price = p.price;
$$;

-- ---------------------------------------------------------------------
-- ۳) شکل امنِ یک استعلام برای نمایش به مشتری (با اعتبار مشترک ۷ روزه)
-- ---------------------------------------------------------------------
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
    'finalPrice',    case when i.status = 'answered'
                          then coalesce(c.price, i.final_price) else i.final_price end,
    'answeredAt',    case when i.status = 'answered'
                          then coalesce(c.confirmed_at, i.answered_at) else i.answered_at end,
    'lockedUntil',   case when i.status = 'answered'
                          then coalesce(c.valid_until, least(i.locked_until, now())) else i.locked_until end,
    'lockExpired',   (i.status = 'answered' and c.product_id is null),
    'queueAhead',    case when i.status in ('queued','sending')
                          then (select count(*) from public.price_inquiries q
                                where q.status in ('queued','sending','sent','awaiting_price','awaiting_confirm')
                                  and q.id < i.id)
                          else 0 end,
    'createdAt',     i.created_at,
    'batchIndex',    i.batch_index,
    'batchTotal',    i.batch_total
  )
  from (select 1) as _x
  left join lateral public.valid_price_confirmation(i.product_id) as c on true;
$$;

-- ---------------------------------------------------------------------
-- ۴) ساخت استعلام (فقط برای «یک» محصول؛ اگر قیمتش تازه تأیید شده باشد اصلاً استعلام ساخته نمی‌شود)
-- ---------------------------------------------------------------------
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
  c_max_items constant int := 1;  -- هر درخواست فقط برای یک محصول
  v_open    boolean;
  v_item    jsonb;
  v_pid     uuid;
  v_price   numeric;
  v_prod    record;
  v_pc      public.product_price_confirmations;
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
     or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > c_max_items then
    return jsonb_build_object('ok', false, 'reason', 'bad_items');
  end if;

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

  if p_cart is not null and jsonb_typeof(p_cart) = 'array' and jsonb_array_length(p_cart) <= 40 then
    insert into public.cart_sessions (token, items, accept_fluctuation)
    values (p_token, p_cart, coalesce(p_accept, false))
    on conflict (token) do update
      set items = excluded.items,
          accept_fluctuation = excluded.accept_fluctuation,
          updated_at = now();
  end if;

  for v_item in select value from jsonb_array_elements(p_items) loop
    if coalesce(v_item ->> 'productId', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_skipped := v_skipped || jsonb_build_object('productId', v_item ->> 'productId', 'reason', 'bad_id');
      continue;
    end if;
    v_pid := (v_item ->> 'productId')::uuid;
    if v_pid = any(v_seen) then
      continue;
    end if;
    v_seen := v_seen || v_pid;
    v_price := case when coalesce(v_item ->> 'cartPrice', '') ~ '^[0-9]{1,10}$' then (v_item ->> 'cartPrice')::numeric else null end;

    select id, title, price, images, is_available into v_prod from public.products where id = v_pid;
    if not found or coalesce(v_prod.is_available, true) = false then
      v_skipped := v_skipped || jsonb_build_object('productId', v_pid, 'reason', 'unavailable');
      continue;
    end if;

    -- این مشتری برای همین محصول یک استعلام باز دارد؟
    select * into v_row from public.price_inquiries
     where token = p_token and product_id = v_pid
       and status in ('queued','sending','sent','awaiting_price','awaiting_confirm')
     limit 1;
    if found then
      v_results := v_results || public.pi_public(v_row);
      continue;
    end if;

    -- قیمت این محصول در ۷ روز اخیر (توسط استعلامِ هر مشتری) تأیید شده؟ => نیازی به پرسیدن نیست
    select * into v_pc from public.valid_price_confirmation(v_pid);
    if found then
      v_skipped := v_skipped || jsonb_build_object(
        'productId',   v_pid,
        'reason',      'already_confirmed',
        'price',       v_pc.price,
        'confirmedAt', v_pc.confirmed_at,
        'validUntil',  v_pc.valid_until
      );
      continue;
    end if;

    v_todo := v_todo || jsonb_build_object(
      'pid', v_pid,
      'title', v_prod.title,
      'image', coalesce(v_prod.images[1], ''),
      'cartPrice', coalesce(v_price, v_prod.price)
    );
  end loop;

  v_n := jsonb_array_length(v_todo);
  if v_n > 0 then
    insert into public.price_batches (token, ip_hash, total_items)
    values (p_token, p_ip_hash, v_n) returning id into v_batch;

    for v_t in select value from jsonb_array_elements(v_todo) loop
      v_idx := v_idx + 1;
      v_row := null;
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

-- ---------------------------------------------------------------------
-- ۵) وضعیت استعلام‌های یک مشتری (پنجره‌ی نمایش با مدت اعتبار هماهنگ شد: ۷ روز + ۱ روز)
-- ---------------------------------------------------------------------
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
    where token = p_token and created_at > now() - (public.price_validity() + interval '1 day')
    order by product_id, id desc
  );
  return jsonb_build_object('ok', true, 'inquiries', v_list, 'storeOpen', coalesce(v_open, true), 'serverTime', now());
end;
$$;

-- ---------------------------------------------------------------------
-- ۶) انتخاب استعلام بعدیِ صف برای اسما (استعلام‌هایی که قیمتشان در همین فاصله تأیید شده، خودکار بسته می‌شوند)
-- ---------------------------------------------------------------------
create or replace function public.dispatch_next_inquiry()
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  r        public.price_inquiries;
  v_pc     public.product_price_confirmations;
  v_price  numeric;
  v_remain int;
begin
  update public.price_inquiries
     set status = 'queued', next_attempt_at = now(), updated_at = now()
   where status = 'sending' and updated_at < now() - interval '2 minutes';

  if exists (select 1 from public.price_inquiries
              where status in ('sending','sent','awaiting_price','awaiting_confirm')) then
    return null;
  end if;

  loop
    select * into r from public.price_inquiries
     where status = 'queued' and next_attempt_at <= now()
     order by id
     limit 1
     for update skip locked;
    if not found then
      return null;
    end if;

    -- اگر قیمت این محصول همین الان (توسط مشتری دیگری) تأیید شده، دوباره از اسما نمی‌پرسیم
    select * into v_pc from public.valid_price_confirmation(r.product_id);
    exit when not found;

    update public.price_inquiries
       set status = 'answered', final_price = v_pc.price, answered_at = now(),
           locked_until = v_pc.valid_until, updated_at = now()
     where id = r.id;
  end loop;

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

-- ---------------------------------------------------------------------
-- ۷) اقدام‌های اسما روی استعلام فعال (تأیید/اصلاح قیمت => ثبت اعتبار ۷ روزه برای همه)
-- ---------------------------------------------------------------------
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
         answered_at = now(), locked_until = now() + public.price_validity(), updated_at = now()
   where id = r.id returning * into r;

  -- قیمت تأییدشده‌ی این محصول برای «همه‌ی مشتری‌ها» تا ۷ روز معتبر است
  insert into public.product_price_confirmations
    (product_id, price, confirmed_at, valid_until, inquiry_id, updated_at)
  values
    (r.product_id, v_final, now(), now() + public.price_validity(), r.id, now())
  on conflict (product_id) do update
    set price        = excluded.price,
        confirmed_at = excluded.confirmed_at,
        valid_until  = excluded.valid_until,
        inquiry_id   = excluded.inquiry_id,
        updated_at   = now();

  -- مشتری‌های دیگری که همین محصول را در صف دارند، جواب را همین حالا می‌گیرند (بدون پیام تازه به گروه)
  update public.price_inquiries
     set status = 'answered', final_price = v_final, answered_at = now(),
         locked_until = now() + public.price_validity(), updated_at = now()
   where product_id = r.product_id and id <> r.id and status = 'queued';

  return jsonb_build_object('ok', true, 'inquiry', to_jsonb(r),
                            'oldPrice', v_old, 'newPrice', v_final,
                            'changed', (v_old is distinct from v_final),
                            'validUntil', now() + public.price_validity());
end;
$$;

-- ---------------------------------------------------------------------
-- ۸) قیمت‌گذاری سبد خرید (تنها منبع قابل‌اعتماد قیمت؛ هم برای نمایش و هم برای ثبت سفارش)
--    حالا «تأییدیه‌ی مشترکِ ۷ روزه‌ی محصول» ملاک است، نه استعلامِ شخصی مشتری.
-- ---------------------------------------------------------------------
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
  v_pc      public.product_price_confirmations;
  v_price   numeric;
  v_state   text;
  v_inq     bigint;
  v_until   timestamptz;
  v_at      timestamptz;
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
    v_at    := null;

    select id, title, price, images, is_available into v_prod from public.products where id = v_pid;

    if not found or coalesce(v_prod.is_available, true) = false then
      v_state := 'unavailable';
      v_price := coalesce(v_prod.price, 0);
      v_unav  := v_unav + 1;
    else
      select * into v_pc from public.valid_price_confirmation(v_pid);
      if found then
        v_state := 'confirmed';
        v_price := v_pc.price;
        v_inq   := v_pc.inquiry_id;
        v_until := v_pc.valid_until;
        v_at    := v_pc.confirmed_at;
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
      'lockedUntil', v_until,
      'confirmedAt', v_at
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

-- ---------------------------------------------------------------------
-- ۹) فقط سرور سایت (service_role) اجازه‌ی اجرای توابع تازه را دارد
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
      and p.proname in ('price_validity','valid_price_confirmation')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
    execute format('grant execute on function %s to service_role', f.sig);
  end loop;
end $$;
