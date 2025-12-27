# Digital Legacy Vault - Backend Server

## 🔐 Dead Man's Switch API

This Node.js backend provides the server-side logic for the Dead Man's Switch feature, including:
- User check-ins and activity tracking
- Automatic nominee notifications
- Cron job for inactivity detection
- Email service for warnings and vault access

---

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)
- SMTP email service (Gmail, SendGrid, etc.)

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your values
```

Required variables:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# App
APP_URL=http://localhost:3000
API_PORT=3001
```

### 3. Set Up Supabase Database

1. Go to your [Supabase Dashboard](https://app.supabase.io)
2. Navigate to SQL Editor
3. Run the schema from `database/schema.sql`

### 4. Start the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

---

## 📡 API Endpoints

### Dead Man's Switch

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/switch/configure` | Create/update switch config |
| POST | `/api/switch/activate` | Activate or deactivate switch |
| POST | `/api/switch/checkin` | Perform check-in ("I'm Still Here") |
| GET | `/api/switch/status/:userId` | Get switch status |
| POST | `/api/switch/test-email` | Send test email to nominee |

### Vault Access

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vault/access/:token` | Nominee accesses vault |
| POST | `/api/vault/store` | Store encrypted vault data |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## ⏰ Cron Job Logic

The Dead Man's Switch check runs daily (configurable):

```
CRON_SCHEDULE=0 0 * * *  # Every day at midnight
```

### What it does:

1. **Checks all active switches** for inactivity
2. **At 75% of inactivity period** → Sends WARNING email to owner
3. **At 90% of inactivity period** → Sends FINAL WARNING email
4. **At 100% (expired)** → TRIGGERS the switch:
   - Generates secure access token
   - Sends email to nominee with vault access link
   - Token expires in 30 days

### Example Timeline (180-day period):

| Day | Action |
|-----|--------|
| 0 | User activates switch |
| 135 | ⚠️ First warning email (75%) |
| 162 | 🚨 Final warning email (90%) |
| 180 | 🔓 Switch TRIGGERED - nominee notified |

---

## 📧 Email Templates

The service includes beautiful HTML email templates:

1. **Warning Email** - Sent to vault owner
2. **Final Warning Email** - Urgent reminder to owner
3. **Triggered Email** - Sent to nominee with access link
4. **Test Email** - Verification email to nominee

---

## 🔒 Security Features

- **Row Level Security (RLS)** in Supabase
- **Service role key** for backend operations
- **Access tokens** expire after 30 days
- **Audit trail** of all check-ins
- **Notification logging** for all emails sent

---

## 📁 Project Structure

```
backend/
├── server.js              # Express server & API routes
├── package.json           # Dependencies
├── .env.example           # Environment template
├── cron/
│   └── deadManSwitch.js   # Cron job logic
├── services/
│   └── emailService.js    # Nodemailer templates
└── database/
    └── schema.sql         # Supabase schema
```

---

## 🧪 Testing

### Test the API locally:

```bash
# Health check
curl http://localhost:3001/api/health

# Configure switch
curl -X POST http://localhost:3001/api/switch/configure \
  -H "Content-Type: application/json" \
  -d '{"userId":"uuid","nomineeEmail":"test@email.com"}'

# Perform check-in
curl -X POST http://localhost:3001/api/switch/checkin \
  -H "Content-Type: application/json" \
  -d '{"switchId":"uuid"}'
```

---

## 🚀 Deployment

### Vercel (Serverless)

Convert to Edge Functions for Vercel deployment.

### Railway / Render

Deploy as a Node.js service with environment variables.

### Self-hosted

Use PM2 or Docker for persistent deployment.

---

## 📝 License

MIT License - Use freely for your digital legacy needs.
