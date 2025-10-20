# Supabase Setup Instructions for RJB TRANZ CRM

## Overview
This document provides step-by-step instructions to set up Supabase integration with the RJB TRANZ CRM system.

## Prerequisites
- Supabase account
- Project URL: `https://ijnskyrnmoyhtmfdazdk.supabase.co`
- Anon Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbnNreXJubW95aHRtZmRhemRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTk0MjEsImV4cCI6MjA3NDgzNTQyMX0.MAwV7HRgYRKKSBUVbfIqGW4ighagH-NzYDlM1Uooauc`

## Database Schema Setup

### 1. Create Tables

Run the following SQL commands in your Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    from_currency VARCHAR(10) NOT NULL,
    to_currency VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(15,8) NOT NULL,
    fee DECIMAL(15,2) NOT NULL,
    total_fee DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    receipt_printed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    total_transactions INTEGER DEFAULT 0,
    total_volume DECIMAL(15,2) DEFAULT 0,
    last_visit TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange rates table
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

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receiver_name VARCHAR(255) NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System configuration table (optional)
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Create Indexes for Performance

```sql
-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_client_email ON transactions(client_email);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_verification_status ON clients(verification_status);
CREATE INDEX IF NOT EXISTS idx_clients_last_visit ON clients(last_visit DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(pair);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_last_updated ON exchange_rates(last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
```

### 3. Set up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable all operations for authenticated users" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON clients
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON exchange_rates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON invoices
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON system_config
    FOR ALL USING (auth.role() = 'authenticated');
```

### 4. Insert Sample Data (Optional)

```sql
-- Sample exchange rates
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
```

## Testing the Connection

1. **In the RJB TRANZ CRM System Settings:**
   - Navigate to System Settings (click on your profile avatar)
   - Go to the "System" step
   - In the Database section, click the "Test" button next to "Supabase Connection"
   - You should see a success message if the connection works

2. **Manual Testing:**
   - You can also test the connection using the SupabaseTest component
   - Or run queries directly in the Supabase dashboard

## Environment Configuration

The connection details are already configured in the application:
- URL: `https://ijnskyrnmoyhtmfdazdk.supabase.co`
- Key: Already embedded in the application

## Features Available

Once set up, you can:

1. **Test Connection**: Click the test button in System Settings
2. **Sync Local Data**: Export your local CRM data to Supabase
3. **Real-time Updates**: Data will sync between local storage and Supabase
4. **Backup & Restore**: Your data is safely stored in the cloud

## Troubleshooting

### Common Issues:

1. **Connection Failed**
   - Check if your Supabase project is active
   - Verify the URL and API key are correct
   - Ensure tables are created properly

2. **Permission Denied**
   - Check Row Level Security policies
   - Ensure your API key has the correct permissions

3. **Table Not Found**
   - Run the table creation SQL scripts
   - Check table names match exactly

### Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Supabase project status
3. Ensure all SQL scripts ran successfully
4. Check the Network tab for API call failures

## Security Notes

- The anon key is safe to use in client-side applications
- Row Level Security is enabled to protect data
- All connections use HTTPS encryption
- Consider implementing additional authentication for production use

## Next Steps

After setup:
1. Test the connection using the System Settings
2. Sync your existing local data to Supabase
3. Monitor the connection status in the CRM dashboard
4. Set up regular backups and monitoring