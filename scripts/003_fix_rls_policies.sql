-- Fix RLS policies to allow public access for Telegram Mini App
-- Since we're using Telegram authentication, not Supabase Auth

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own NFTs" ON user_nfts;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can log activity" ON activity_logs;

-- Create permissive policies for all tables
-- Users table
CREATE POLICY "Allow all users access" ON users FOR ALL USING (true) WITH CHECK (true);

-- Products table (already has public read)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Allow all products access" ON products FOR ALL USING (true) WITH CHECK (true);

-- Orders table
CREATE POLICY "Allow all orders access" ON orders FOR ALL USING (true) WITH CHECK (true);

-- User NFTs table
CREATE POLICY "Allow all user_nfts access" ON user_nfts FOR ALL USING (true) WITH CHECK (true);

-- Notifications table
CREATE POLICY "Allow all notifications access" ON notifications FOR ALL USING (true) WITH CHECK (true);

-- Activity logs table
CREATE POLICY "Allow all activity_logs access" ON activity_logs FOR ALL USING (true) WITH CHECK (true);
