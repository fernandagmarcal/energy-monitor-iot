-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'gestor', 'tecnico', 'visualizador');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin policies for user_roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create alert_thresholds table
CREATE TABLE public.alert_thresholds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voltage_max NUMERIC(6,2) DEFAULT 230.0,
  voltage_min NUMERIC(6,2) DEFAULT 200.0,
  power_factor_min NUMERIC(3,2) DEFAULT 0.92,
  thd_voltage_max NUMERIC(5,2) DEFAULT 5.0,
  thd_current_max NUMERIC(5,2) DEFAULT 8.0,
  current_max NUMERIC(8,2) DEFAULT 100.0,
  frequency_min NUMERIC(5,2) DEFAULT 59.8,
  frequency_max NUMERIC(5,2) DEFAULT 60.2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.alert_thresholds ENABLE ROW LEVEL SECURITY;

-- Alert thresholds policies
CREATE POLICY "Users can view their own thresholds"
  ON public.alert_thresholds FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own thresholds"
  ON public.alert_thresholds FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own thresholds"
  ON public.alert_thresholds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create api_config table
CREATE TABLE public.api_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  api_base_url TEXT NOT NULL,
  mqtt_broker TEXT,
  mqtt_topic TEXT,
  mqtt_username TEXT,
  mqtt_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.api_config ENABLE ROW LEVEL SECURITY;

-- API config policies
CREATE POLICY "Users can view their own config"
  ON public.api_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own config"
  ON public.api_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own config"
  ON public.api_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  
  -- Insert default role (visualizador)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'visualizador');
  
  -- Insert default alert thresholds
  INSERT INTO public.alert_thresholds (user_id)
  VALUES (new.id);
  
  -- Insert default API config
  INSERT INTO public.api_config (user_id, api_base_url)
  VALUES (new.id, 'http://localhost:5000');
  
  RETURN new;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alert_thresholds_updated_at
  BEFORE UPDATE ON public.alert_thresholds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_config_updated_at
  BEFORE UPDATE ON public.api_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();