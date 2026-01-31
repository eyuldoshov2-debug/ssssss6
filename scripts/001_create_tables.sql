-- ArzonStarBot Database Schema
-- Users table for Telegram users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique not null,
  username text,
  first_name text,
  last_name text,
  has_premium boolean default false,
  premium_expires_at timestamptz,
  stars_balance integer default 0,
  is_subscribed boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Products table for Premium, Stars, and NFT Gifts
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('premium', 'stars', 'nft')),
  name text not null,
  name_uz text not null,
  description text,
  description_uz text,
  price integer not null, -- in UZS (so'm)
  value integer, -- duration in months for premium, amount for stars
  image_url text,
  is_active boolean default true,
  is_popular boolean default false,
  discount_percent integer default 0,
  created_at timestamptz default now()
);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method text check (payment_method in ('click', 'payme', 'telegram')),
  amount integer not null, -- total amount in UZS
  recipient_telegram_id bigint, -- for gifts
  transaction_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NFT inventory for users
create table if not exists public.user_nfts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  product_id uuid references public.products(id),
  order_id uuid references public.orders(id),
  is_sent boolean default false,
  sent_to_telegram_id bigint,
  created_at timestamptz default now()
);

-- Push notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  sent_at timestamptz,
  sent_by uuid references public.users(id),
  recipient_count integer default 0,
  created_at timestamptz default now()
);

-- Activity logs for admin
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.user_nfts enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- RLS Policies for users
create policy "Users can view their own data" on public.users for select using (true);
create policy "Users can update their own data" on public.users for update using (telegram_id::text = current_setting('request.jwt.claims', true)::json->>'telegram_id');
create policy "Allow insert for new users" on public.users for insert with check (true);

-- RLS Policies for products (public read)
create policy "Anyone can view active products" on public.products for select using (is_active = true);
create policy "Admins can manage products" on public.products for all using (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

-- RLS Policies for orders
create policy "Users can view their own orders" on public.orders for select using (
  user_id in (select id from public.users where telegram_id::text = current_setting('request.jwt.claims', true)::json->>'telegram_id')
);
create policy "Users can create orders" on public.orders for insert with check (true);
create policy "Admins can view all orders" on public.orders for select using (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

-- RLS Policies for user_nfts
create policy "Users can view their own NFTs" on public.user_nfts for select using (
  user_id in (select id from public.users where telegram_id::text = current_setting('request.jwt.claims', true)::json->>'telegram_id')
);

-- RLS Policies for notifications (admin only)
create policy "Admins can manage notifications" on public.notifications for all using (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

-- RLS Policies for activity_logs (admin only)
create policy "Admins can view logs" on public.activity_logs for select using (
  exists (select 1 from public.users where users.id = auth.uid() and users.is_admin = true)
);

-- Insert sample products
insert into public.products (type, name, name_uz, description, description_uz, price, value, is_popular, discount_percent) values
-- Premium plans
('premium', '1 Month Premium', '1 oylik Premium', 'Telegram Premium for 1 month', '1 oylik Telegram Premium', 59000, 1, false, 0),
('premium', '3 Months Premium', '3 oylik Premium', 'Telegram Premium for 3 months', '3 oylik Telegram Premium - chegirma', 149000, 3, true, 15),
('premium', '12 Months Premium', '12 oylik Premium', 'Telegram Premium for 12 months', '12 oylik Telegram Premium - eng foydali', 499000, 12, false, 30),
-- Stars packages
('stars', '100 Stars', '100 Stars', '100 Telegram Stars', '100 ta Telegram Stars', 15000, 100, false, 0),
('stars', '500 Stars', '500 Stars', '500 Telegram Stars', '500 ta Telegram Stars', 69000, 500, true, 8),
('stars', '1000 Stars', '1000 Stars', '1000 Telegram Stars', '1000 ta Telegram Stars', 129000, 1000, false, 14),
-- NFT Gifts
('nft', 'Gold Box', 'Gold Box', 'Exclusive gold NFT gift box', 'Eksklyuziv oltin NFT sovg''a qutisi', 99000, 1, false, 0),
('nft', 'Star NFT', 'Star NFT', 'Unique star-themed NFT', 'Noyob yulduz mavzusidagi NFT', 149000, 1, true, 0),
('nft', 'Limited Gift', 'Limited Gift', 'Limited edition NFT gift', 'Cheklangan nashr NFT sovg''a', 299000, 1, false, 0);
