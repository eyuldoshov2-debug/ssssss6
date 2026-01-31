-- Balance, Referral, and Admin Cards System

-- Add balance and referral columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS balance INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.users(id);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_deposited INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS referral_earnings INTEGER DEFAULT 0;

-- Admin payment cards table
CREATE TABLE IF NOT EXISTS public.admin_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_number TEXT NOT NULL,
  card_holder TEXT NOT NULL,
  bank_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Deposit requests table
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Referral transactions table
CREATE TABLE IF NOT EXISTS public.referral_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  amount INTEGER NOT NULL,
  bonus_amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Balance transactions table
CREATE TABLE IF NOT EXISTS public.balance_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'purchase', 'referral_bonus', 'refund')),
  amount INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add payment_method 'balance' to orders
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('click', 'payme', 'telegram', 'balance', 'card'));

-- Add image_url to products for NFT images
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enable RLS on new tables
ALTER TABLE public.admin_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_cards
CREATE POLICY "Anyone can view active cards" ON public.admin_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage cards" ON public.admin_cards FOR ALL USING (true);

-- RLS Policies for deposit_requests
CREATE POLICY "Users can view own deposits" ON public.deposit_requests FOR SELECT USING (true);
CREATE POLICY "Users can create deposits" ON public.deposit_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update deposits" ON public.deposit_requests FOR UPDATE USING (true);

-- RLS Policies for referral_transactions
CREATE POLICY "Users can view own referrals" ON public.referral_transactions FOR SELECT USING (true);
CREATE POLICY "System can create referrals" ON public.referral_transactions FOR INSERT WITH CHECK (true);

-- RLS Policies for balance_transactions
CREATE POLICY "Users can view own transactions" ON public.balance_transactions FOR SELECT USING (true);
CREATE POLICY "System can create transactions" ON public.balance_transactions FOR INSERT WITH CHECK (true);

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'REF' || UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code
DROP TRIGGER IF EXISTS trigger_generate_referral_code ON public.users;
CREATE TRIGGER trigger_generate_referral_code
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION generate_referral_code();

-- Update existing users with referral codes
UPDATE public.users 
SET referral_code = 'REF' || UPPER(SUBSTRING(MD5(id::TEXT || NOW()::TEXT) FROM 1 FOR 8))
WHERE referral_code IS NULL;
