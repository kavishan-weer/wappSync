alter table public.shop_settings
  add column if not exists automation_enabled boolean not null default true,
  add column if not exists owner_alert_phone text,
  add column if not exists fallback_message text not null default 'Thanks for your message. I want to make sure you get the right answer, so I''m connecting you with the shop owner. 😊',
  add column if not exists business_hours_enabled boolean not null default false,
  add column if not exists business_hours_start time not null default '09:00',
  add column if not exists business_hours_end time not null default '17:00',
  add column if not exists business_hours_timezone text not null default 'Asia/Colombo';

alter table public.shop_settings
  alter column automation_enabled set default true,
  alter column fallback_message set default 'Thanks for your message. I want to make sure you get the right answer, so I''m connecting you with the shop owner. 😊',
  alter column business_hours_enabled set default false,
  alter column business_hours_start set default '09:00',
  alter column business_hours_end set default '17:00',
  alter column business_hours_timezone set default 'Asia/Colombo';

notify pgrst, 'reload schema';
