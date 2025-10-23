# Supabase Setup Instructions for RJB TRANZ CRM

## Overview
This document provides step-by-step instructions to set up Supabase integration with the RJB TRANZ CRM system.

## Prerequisites
- Supabase account
- Project URL: `https://zjhgiggdswldmvzbtipr.supabase.co`
- Anon Public Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaGdpZ2dkc3dsZG12emJ0aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTM1OTUsImV4cCI6MjA3NjU2OTU5NX0.ZGmcbGYBCYx5ATXfCnIzzfy8umXqrm_z3rYnJl7rabI`

## Database Schema Setup

### 1. Run the Complete Schema

Instead of running individual table creation commands, run the complete schema from the `supabase_schema.sql` file in your Supabase SQL Editor. This file contains:

- **9 Main Tables**: users, countries, clients, transactions, invoices, exchange_rates, system_configs, audit_logs, printer_logs
- **Performance Indexes**: Optimized for fast queries and searches
- **Row Level Security (RLS)**: Currently DISABLED for simplicity (can be enabled later)
- **Functions & Triggers**: Automated ID generation and timestamp updates
- **Sample Data**: Pre-populated countries, exchange rates, and system configs
- **Analytics Views**: Dashboard statistics and reporting views

**To run the schema:**
1. Open your Supabase dashboard: https://zjhgiggdswldmvzbtipr.supabase.co
2. Go to SQL Editor
3. Copy the entire contents of `supabase_schema.sql`
4. Click "Run" to execute

### Legacy Table Structure (For Reference)

The previous simplified schema included these core tables:

```sql
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

-- System configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    config_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Additional Features Included

The complete schema includes comprehensive features beyond basic tables:

**Enhanced Tables:**
- **users**: Role-based authentication (admin, operator, viewer)
- **countries**: 70+ countries with flags, currencies, and phone codes
- **audit_logs**: Complete activity tracking for compliance
- **printer_logs**: Receipt printing history and error tracking

**Advanced Relationships:**
- Transactions linked to clients and users
- Invoices connected to clients and creators
- System configs per user or global
- Full audit trail for all operations

**Performance Optimizations:**
- 25+ strategic indexes for fast queries
- Optimized foreign key relationships
- Query-efficient views for analytics

**Security Features:**
- Row Level Security (RLS) disabled for admin-side CRM (single database access)
- Input validation at database level
- UUID primary keys for enhanced security
- Audit logging for compliance tracking

**Automation:**
- Auto-generated transaction and invoice IDs
- Automatic timestamp updates
- Sequence management for unique identifiers

### 3. Row Level Security (RLS)

**Note**: RLS is currently **DISABLED** in this schema for simplicity. All tables are accessible without authentication restrictions.

When you're ready to implement authentication:
1. Uncomment the RLS section in `supabase_schema.sql`
2. Implement user authentication in your app
3. Enable the security policies for production use

### 4. Default Data Included

The schema comes pre-loaded with essential data:

**Default Admin User:**
- Email: `admin@rjbtranz.com`
- Password: `admin123` (change immediately in production!)
- Role: Administrator

**Sample Countries:** USA, Ghana, Nigeria, Kenya, India, Philippines with currencies and flags

**Exchange Rates:** Current USD rates for major African and Asian currencies

**System Configuration:** Company info, fee structures, currency settings, notifications, and printer configs

**Analytics Views:** Ready-to-use dashboard statistics and reporting views

### 5. Database Functions & Triggers

The schema includes automated functions:

**ID Generation:**
- Transaction IDs: `TXN-YYYYMMDD-XXXXXX`
- Invoice Numbers: `INV-YYYYMMDD-XXXX`

**Automatic Updates:**
- `updated_at` timestamps on all relevant tables
- Audit logging for compliance
- Sequence management for unique identifiers

**Analytics Views:**
- `dashboard_stats`: Real-time metrics for the dashboard
- `transaction_analytics`: Daily transaction summaries
- `client_analytics`: Client performance metrics

## Testing the Connection

1. **In the RJB TRANZ CRM System Settings:**
    - Navigate to System Settings (click on your profile avatar)
    - Go to the "System" step
    - In the Database section, click the "Test" button next to "Supabase Connection"
    - You should see a success message if the connection works

2. **Verify Schema Installation:**
    - Check that all 9 tables were created in your Supabase dashboard
    - Confirm the admin user was created (email: admin@rjbtranz.com)
    - Test that sample data was inserted (countries, exchange rates)

3. **Manual Testing:**
    - You can also test the connection using the SupabaseTest component
    - Or run queries directly in the Supabase dashboard
    - Check the analytics views are working: `SELECT * FROM dashboard_stats;`

## Environment Configuration

The connection details are already configured in the application:
- URL: `https://zjhgiggdswldmvzbtipr.supabase.co`
- Key: Already embedded in the application
The application is configured to use environment variables for the Supabase URL and Key. Create a `.env` file in the root of the project with the following content:

```env
VITE_SUPABASE_URL=https://zjhgiggdswldmvzbtipr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaGdpZ2dkc3dsZG12emJ0aXByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5OTM1OTUsImV4cCI6MjA3NjU2OTU5NX0.ZGmcbGYBCYx5ATXfCnIzzfy8umXqrm_z3rYnJl7rabI
```

**Note**: This file should not be committed to version control to keep your keys secure.

## Features Available

Once set up, you can:

1. **Test Connection**: Click the test button in System Settings
2. **Sync Local Data**: Export your local CRM data to Supabase
3. **Real-time Updates**: Data will sync between local storage and Supabase
4. **Backup & Restore**: Your data is safely stored in the cloud
5. **User Authentication**: Login with role-based access (admin/operator/viewer)
6. **Advanced Analytics**: Dashboard with real-time metrics and reporting
7. **Audit Trail**: Complete activity logging for compliance
8. **Multi-user Support**: Multiple operators can work simultaneously
9. **Automated ID Generation**: System-generated transaction and invoice numbers
10. **Enhanced Security**: Row-level security and encrypted connections

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
- Row Level Security is currently DISABLED (admin-side CRM with single database access)
- All connections use HTTPS encryption
- UUID primary keys provide enhanced security
- Audit logging tracks all database operations
- Consider enabling RLS when implementing multi-user authentication

## Next Steps

After setup:
1. Test the connection using the System Settings
2. Sync your existing local data to Supabase
3. Monitor the connection status in the CRM dashboard
4. Set up regular backups and monitoring