-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  venmo_handle TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treats table (main table for all treats)
CREATE TABLE public.treats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  header_text TEXT NOT NULL DEFAULT 'Someone sent you a treat!',
  font_id TEXT NOT NULL DEFAULT 'font-inter',
  cover_art_type TEXT NOT NULL DEFAULT 'emoji',
  cover_art_content TEXT NOT NULL DEFAULT '☕',
  message TEXT,
  sender_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  venmo_handle TEXT,
  amount DECIMAL(10,2),
  theme TEXT NOT NULL DEFAULT 'gradient-warm',
  treat_type TEXT NOT NULL DEFAULT 'coffee',
  is_public BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treat views for analytics
CREATE TABLE public.treat_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cover art uploads table
CREATE TABLE public.cover_art_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user treat history
CREATE TABLE public.user_treat_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'viewed', 'shared')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, treat_id, action_type)
);

-- Create favorites table
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, treat_id)
);

-- Create treat reactions
CREATE TABLE public.treat_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('heart', 'laugh', 'wow', 'grateful')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treat sharing stats
CREATE TABLE public.treat_sharing_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create popular templates
CREATE TABLE public.popular_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  header_text TEXT NOT NULL,
  font_id TEXT NOT NULL,
  cover_art_type TEXT NOT NULL,
  cover_art_content TEXT NOT NULL,
  theme TEXT NOT NULL,
  treat_type TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create abuse reports
CREATE TABLE public.abuse_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treat reminders
CREATE TABLE public.treat_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('follow_up', 'payment_reminder')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create treat collections
CREATE TABLE public.treat_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection treats junction table
CREATE TABLE public.collection_treats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID NOT NULL REFERENCES public.treat_collections(id) ON DELETE CASCADE,
  treat_id UUID NOT NULL REFERENCES public.treats(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(collection_id, treat_id)
);

-- Create gift suggestions
CREATE TABLE public.gift_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  treat_type TEXT NOT NULL,
  recipient_context TEXT,
  suggested_amount DECIMAL(10,2),
  suggested_message TEXT,
  occasion TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integration settings
CREATE TABLE public.integration_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Create indexes for better performance
CREATE INDEX idx_treats_slug ON public.treats(slug);
CREATE INDEX idx_treats_user_id ON public.treats(user_id);
CREATE INDEX idx_treats_created_at ON public.treats(created_at);
CREATE INDEX idx_treat_views_treat_id ON public.treat_views(treat_id);
CREATE INDEX idx_treat_views_viewed_at ON public.treat_views(viewed_at);
CREATE INDEX idx_user_treat_history_user_id ON public.user_treat_history(user_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX idx_treat_reactions_treat_id ON public.treat_reactions(treat_id);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treat_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cover_art_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_treat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treat_sharing_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popular_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treat_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treat_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_treats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for treats
CREATE POLICY "Public treats are viewable by everyone" 
ON public.treats FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own treats" 
ON public.treats FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own treats" 
ON public.treats FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treats" 
ON public.treats FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for treat views (anyone can create views)
CREATE POLICY "Anyone can create treat views" 
ON public.treat_views FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view treat analytics for their treats" 
ON public.treat_views FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.treats 
  WHERE treats.id = treat_views.treat_id 
  AND treats.user_id = auth.uid()
));

-- Create RLS policies for cover art uploads
CREATE POLICY "Users can view their own uploads" 
ON public.cover_art_uploads FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own cover art" 
ON public.cover_art_uploads FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploads" 
ON public.cover_art_uploads FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for user treat history
CREATE POLICY "Users can view their own history" 
ON public.user_treat_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own history entries" 
ON public.user_treat_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" 
ON public.favorites FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for treat reactions (public viewing, authenticated creation)
CREATE POLICY "Treat reactions are viewable by everyone" 
ON public.treat_reactions FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create reactions" 
ON public.treat_reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for sharing stats (public creation for analytics)
CREATE POLICY "Anyone can create sharing stats" 
ON public.treat_sharing_stats FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view stats for their treats" 
ON public.treat_sharing_stats FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.treats 
  WHERE treats.id = treat_sharing_stats.treat_id 
  AND treats.user_id = auth.uid()
));

-- Create RLS policies for popular templates (public read)
CREATE POLICY "Templates are viewable by everyone" 
ON public.popular_templates FOR SELECT 
USING (true);

-- Create RLS policies for abuse reports
CREATE POLICY "Users can view their own reports" 
ON public.abuse_reports FOR SELECT 
USING (auth.uid() = reporter_id);

CREATE POLICY "Authenticated users can create reports" 
ON public.abuse_reports FOR INSERT 
WITH CHECK (auth.uid() = reporter_id OR reporter_id IS NULL);

-- Create RLS policies for treat reminders
CREATE POLICY "Users can manage their own reminders" 
ON public.treat_reminders FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for treat collections
CREATE POLICY "Public collections are viewable by everyone" 
ON public.treat_collections FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own collections" 
ON public.treat_collections FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for collection treats
CREATE POLICY "Collection treats follow collection permissions" 
ON public.collection_treats FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.treat_collections 
  WHERE treat_collections.id = collection_treats.collection_id 
  AND (treat_collections.is_public = true OR treat_collections.user_id = auth.uid())
));

CREATE POLICY "Users can manage treats in their collections" 
ON public.collection_treats FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.treat_collections 
  WHERE treat_collections.id = collection_treats.collection_id 
  AND treat_collections.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.treat_collections 
  WHERE treat_collections.id = collection_treats.collection_id 
  AND treat_collections.user_id = auth.uid()
));

-- Create RLS policies for gift suggestions
CREATE POLICY "Users can view their own suggestions" 
ON public.gift_suggestions FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create suggestions" 
ON public.gift_suggestions FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create RLS policies for integration settings
CREATE POLICY "Users can manage their own integration settings" 
ON public.integration_settings FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treats_updated_at
  BEFORE UPDATE ON public.treats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_settings_updated_at
  BEFORE UPDATE ON public.integration_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some popular templates
INSERT INTO public.popular_templates (name, header_text, font_id, cover_art_type, cover_art_content, theme, treat_type, usage_count, is_featured) VALUES
('Classic Coffee', 'Someone sent you a coffee!', 'font-inter', 'emoji', '☕', 'gradient-warm', 'coffee', 150, true),
('Lunch Invitation', 'Let''s grab lunch together!', 'font-serif', 'emoji', '🍽️', 'gradient-fresh', 'lunch', 89, true),
('Sweet Treat', 'A little sweetness for you!', 'font-playful', 'emoji', '🍰', 'gradient-sunset', 'dessert', 67, false),
('Energy Boost', 'Fuel up for the day!', 'font-bold', 'emoji', '⚡', 'gradient-electric', 'energy_drink', 45, false),
('Thank You', 'Thanks for being awesome!', 'font-elegant', 'emoji', '🙏', 'gradient-gratitude', 'thank_you', 78, true);