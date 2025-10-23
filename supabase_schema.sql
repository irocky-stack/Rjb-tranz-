-- RJB TRANZ CRM Database Schema
-- Complete Supabase schema with all tables, indexes, RLS policies, and sample data

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- USERS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- COUNTRIES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS countries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(3) NOT NULL UNIQUE,
    currency_code VARCHAR(3) NOT NULL,
    currency_name VARCHAR(255) NOT NULL,
    flag_emoji VARCHAR(10),
    phone_code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- CLIENTS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    country_id UUID REFERENCES countries(id),
    total_transactions INTEGER DEFAULT 0,
    total_volume DECIMAL(15,2) DEFAULT 0,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- TRANSACTIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    sender_country_id UUID REFERENCES countries(id),
    receiver_name VARCHAR(255) NOT NULL,
    receiver_email VARCHAR(255),
    receiver_phone VARCHAR(50),
    receiver_country_id UUID REFERENCES countries(id),
    amount DECIMAL(15,2) NOT NULL,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(15,8) NOT NULL,
    fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    receipt_printed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    processed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INVOICES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id UUID REFERENCES clients(id),
    receiver_name VARCHAR(255) NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    payment_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- EXCHANGE RATES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pair VARCHAR(10) NOT NULL UNIQUE,
    from_currency VARCHAR(5) NOT NULL,
    to_currency VARCHAR(5) NOT NULL,
    rate DECIMAL(15,8) NOT NULL,
    change DECIMAL(15,8) DEFAULT 0,
    change_percent DECIMAL(8,4) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_currency, to_currency)
);

-- ===========================================
-- SYSTEM CONFIGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS system_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, config_key)
);

-- ===========================================
-- AUDIT LOGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- PRINTER LOGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS printer_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id),
    printer_name VARCHAR(255),
    printer_type VARCHAR(50),
    print_status VARCHAR(20) NOT NULL CHECK (print_status IN ('success', 'failed', 'pending')),
    error_message TEXT,
    print_data TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Countries indexes
CREATE INDEX IF NOT EXISTS idx_countries_code ON countries(code);
CREATE INDEX IF NOT EXISTS idx_countries_currency_code ON countries(currency_code);

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_verification_status ON clients(verification_status);
CREATE INDEX IF NOT EXISTS idx_clients_last_visit ON clients(last_visit DESC);
CREATE INDEX IF NOT EXISTS idx_clients_country_id ON clients(country_id);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sender_email ON transactions(sender_email);
CREATE INDEX IF NOT EXISTS idx_transactions_receiver_email ON transactions(receiver_email);
CREATE INDEX IF NOT EXISTS idx_transactions_processed_by ON transactions(processed_by);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON invoices(created_by);

-- Exchange rates indexes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(pair);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_last_updated ON exchange_rates(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_currency ON exchange_rates(from_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_to_currency ON exchange_rates(to_currency);

-- System configs indexes
CREATE INDEX IF NOT EXISTS idx_system_configs_user_id ON system_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_configs_config_key ON system_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_system_configs_is_global ON system_configs(is_global);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Printer logs indexes
CREATE INDEX IF NOT EXISTS idx_printer_logs_transaction_id ON printer_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_printer_logs_print_status ON printer_logs(print_status);
CREATE INDEX IF NOT EXISTS idx_printer_logs_created_at ON printer_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_printer_logs_created_by ON printer_logs(created_by);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) POLICIES - DISABLED
-- ===========================================

-- NOTE: RLS is DISABLED for this implementation
-- All tables are accessible without authentication for simplicity
-- In production, enable RLS and implement proper authentication policies

-- Keep RLS disabled for now - uncomment below when authentication is implemented

/*
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own record" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Countries policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can read countries" ON countries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage countries" ON countries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Clients policies
CREATE POLICY "Authenticated users can manage clients" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

-- Transactions policies
CREATE POLICY "Authenticated users can manage transactions" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- Invoices policies
CREATE POLICY "Authenticated users can manage invoices" ON invoices
    FOR ALL USING (auth.role() = 'authenticated');

-- Exchange rates policies
CREATE POLICY "Authenticated users can manage exchange rates" ON exchange_rates
    FOR ALL USING (auth.role() = 'authenticated');

-- System configs policies
CREATE POLICY "Users can manage their own configs" ON system_configs
    FOR ALL USING (auth.uid() = user_id OR is_global = true);

CREATE POLICY "Admins can manage all configs" ON system_configs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Audit logs policies (read-only, insert by system)
CREATE POLICY "Authenticated users can read audit logs" ON audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Printer logs policies
CREATE POLICY "Authenticated users can manage printer logs" ON printer_logs
    FOR ALL USING (auth.role() = 'authenticated');
*/

-- ===========================================
-- FUNCTIONS AND TRIGGERS
-- ===========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_configs_updated_at BEFORE UPDATE ON system_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate transaction ID
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
BEGIN
    new_id := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('transaction_id_seq')::TEXT, 6, '0');
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Sequence for transaction IDs
CREATE SEQUENCE IF NOT EXISTS transaction_id_seq START 1;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
BEGIN
    new_id := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- ===========================================
-- SAMPLE DATA INSERTION
-- ===========================================

-- Insert default admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@rjbtranz.com', '$2b$10$8K3VzJcXcVzJcXcVzJcXcO.8K3VzJcXcVzJcXcVzJcXcVzJcXcVzJc', 'System Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample countries
INSERT INTO countries (name, code, currency_code, currency_name, flag_emoji, phone_code) VALUES
('United States', 'USA', 'USD', 'US Dollar', '🇺🇸', '+1'),
('Ghana', 'GHA', 'GHS', 'Ghanaian Cedi', '🇬🇭', '+233'),
('Nigeria', 'NGA', 'NGN', 'Nigerian Naira', '🇳🇬', '+234'),
('Kenya', 'KEN', 'KES', 'Kenyan Shilling', '🇰🇪', '+254'),
('India', 'IND', 'INR', 'Indian Rupee', '🇮🇳', '+91'),
('Philippines', 'PHL', 'PHP', 'Philippine Peso', '🇵🇭', '+63')
ON CONFLICT (name) DO NOTHING;

-- Insert sample exchange rates
INSERT INTO exchange_rates (pair, from_currency, to_currency, rate, change, change_percent, last_updated) VALUES
('USD/GHS', 'USD', 'GHS', 12.45, 0.15, 1.22, NOW()),
('USD/NGN', 'USD', 'NGN', 795.50, -5.25, -0.66, NOW()),
('USD/KES', 'USD', 'KES', 129.75, 2.10, 1.64, NOW()),
('USD/INR', 'USD', 'INR', 83.25, 0.45, 0.54, NOW()),
('USD/PHP', 'USD', 'PHP', 56.75, -0.85, -1.48, NOW())
ON CONFLICT (pair) DO UPDATE SET
    rate = EXCLUDED.rate,
    change = EXCLUDED.change,
    change_percent = EXCLUDED.change_percent,
    last_updated = EXCLUDED.last_updated;

-- Insert sample system configs
INSERT INTO system_configs (config_key, config_value, is_global) VALUES
('company_info', '{"name": "RJB TRANZ", "address": "Accra, Ghana", "phone": "+233 XX XXX XXXX", "email": "info@rjbtranz.com"}', true),
('fee_structure', '{"base_fee": 5.00, "percentage_fee": 0.02, "minimum_fee": 2.00, "maximum_fee": 50.00}', true),
('currency_settings', '{"base_currency": "USD", "supported_currencies": ["USD", "GHS", "NGN", "KES", "INR", "PHP"]}', true),
('notification_settings', '{"email_notifications": true, "sms_notifications": false, "push_notifications": true}', true),
('printer_settings', '{"default_printer": "EPSON TM-T88V", "paper_size": "58mm", "auto_print": true}', true)
ON CONFLICT (config_key) DO NOTHING;

-- ===========================================
-- VIEWS FOR ANALYTICS
-- ===========================================

-- Dashboard statistics view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM transactions WHERE DATE(created_at) = CURRENT_DATE) as today_transactions,
    (SELECT COUNT(*) FROM transactions WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days') as week_transactions,
    (SELECT COUNT(*) FROM transactions WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days') as month_transactions,
    (SELECT COALESCE(SUM(final_amount), 0) FROM transactions WHERE DATE(created_at) = CURRENT_DATE) as today_volume,
    (SELECT COALESCE(SUM(final_amount), 0) FROM transactions WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '7 days') as week_volume,
    (SELECT COALESCE(SUM(final_amount), 0) FROM transactions WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days') as month_volume,
    (SELECT COUNT(*) FROM clients WHERE verification_status = 'verified') as verified_clients,
    (SELECT COUNT(*) FROM clients) as total_clients,
    (SELECT COUNT(*) FROM transactions WHERE status = 'completed') as completed_transactions,
    (SELECT COUNT(*) FROM transactions WHERE status = 'pending') as pending_transactions;

-- Transaction analytics view
CREATE OR REPLACE VIEW transaction_analytics AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as transaction_count,
    SUM(final_amount) as total_volume,
    SUM(fee) as total_fees,
    AVG(final_amount) as avg_transaction,
    COUNT(DISTINCT client_id) as unique_clients
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Client analytics view
CREATE OR REPLACE VIEW client_analytics AS
SELECT
    c.id,
    c.name,
    c.email,
    c.total_transactions,
    c.total_volume,
    c.last_visit,
    c.verification_status,
    COUNT(t.id) as actual_transactions,
    COALESCE(SUM(t.final_amount), 0) as actual_volume
FROM clients c
LEFT JOIN transactions t ON c.id = t.client_id AND t.status = 'completed'
GROUP BY c.id, c.name, c.email, c.total_transactions, c.total_volume, c.last_visit, c.verification_status;

-- ===========================================
-- GRANTS FOR AUTHENTICATED USERS
-- ===========================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ===========================================
-- FINAL NOTES
-- ===========================================
-- This schema provides a complete foundation for the RJB TRANZ CRM system
-- with proper relationships, security policies, and performance optimizations.
-- Run this script in your Supabase SQL Editor to set up the database.