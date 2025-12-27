# 🔐 Digital Legacy Vault

> A Secure Digital Inheritance Management System with Zero-Knowledge Encryption and Dead Man's Switch

![Version](https://img.shields.io/badge/version-1.0-gold)
![License](https://img.shields.io/badge/license-MIT-green)
![Security](https://img.shields.io/badge/encryption-AES--256--GCM-blue)

## 📖 Overview

Digital Legacy Vault is a comprehensive web application that allows you to securely store sensitive information (passwords, accounts, final wishes) and automatically share it with a trusted nominee if you become inactive for an extended period.

### ✨ Key Features

- **🔒 Zero-Knowledge Encryption** - AES-256-GCM with PBKDF2 key derivation (100,000 iterations)
- **⏰ Dead Man's Switch** - Automatic vault sharing after configurable inactivity
- **📄 PDF Recovery Key Export** - Generate printable documents with QR codes
- **👥 Nominee Access Portal** - Secure page for nominees to access the vault
- **🎨 Premium UI** - Luxurious glassmorphism design

## 🖼️ Screenshots

### Main Dashboard
The vault dashboard with encrypted sections for financial, digital, physical assets, and final wishes.

### Dead Man's Switch
Configure your nominee and inactivity period.

### Nominee Access
Beautiful access page for your trusted person.

## 🚀 Quick Start

### Option 1: Local Use (No Server Required)

1. Clone the repository:
   ```bash
   git clone https://github.com/YogeshTundiya/Digivualt.git
   cd Digivualt
   ```

2. Open `index.html` in your browser

3. Start adding your legacy information and encrypt!

### Option 2: Full Setup with Backend

1. Clone and install:
   ```bash
   git clone https://github.com/YogeshTundiya/Digivualt.git
   cd Digivualt/backend
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase and SMTP credentials
   ```

3. Set up database:
   - Create a Supabase project
   - Run `database/schema.sql` in SQL Editor

4. Start the server:
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
Digivualt/
├── index.html              # Main vault dashboard
├── styles.css              # Premium glassmorphism styling
├── script.js               # Frontend logic + encryption
├── nominee-access.html     # Nominee vault access page
├── docs/
│   ├── PROJECT_REPORT.md   # Complete project documentation
│   └── USER_GUIDE.md       # Step-by-step user guide
└── backend/
    ├── server.js           # Express.js API server
    ├── package.json        # Node.js dependencies
    ├── .env.example        # Environment template
    ├── README.md           # Backend documentation
    ├── cron/
    │   └── deadManSwitch.js    # Daily inactivity checker
    ├── services/
    │   └── emailService.js     # Email notification templates
    └── database/
        └── schema.sql          # Supabase database schema
```

## 🔐 Security

| Feature | Implementation |
|---------|----------------|
| Encryption | AES-256-GCM (Web Crypto API) |
| Key Derivation | PBKDF2 with 100,000 iterations |
| Zero-Knowledge | Keys never leave your device |
| Access Tokens | 30-day expiration |

## 🛠️ Technology Stack

### Frontend
- HTML5, CSS3 (Glassmorphism)
- Vanilla JavaScript
- Web Crypto API

### Backend
- Node.js + Express.js
- Supabase (PostgreSQL)
- Nodemailer
- node-cron

## 📋 How It Works

```
1. USER enters sensitive information
           ↓
2. USER encrypts vault with master password
           ↓
3. USER configures Dead Man's Switch (nominee + inactivity period)
           ↓
4. USER exports PDF with Recovery Key
           ↓
5. USER shares PDF with nominee
           ↓
[If user goes inactive beyond set period]
           ↓
6. SYSTEM sends email to nominee with access link
           ↓
7. NOMINEE enters Recovery Key from PDF
           ↓
8. VAULT decrypts locally in nominee's browser
```

## 📖 Documentation

- **[Project Report](docs/PROJECT_REPORT.md)** - Complete technical documentation
- **[User Guide](docs/USER_GUIDE.md)** - Step-by-step instructions
- **[Backend README](backend/README.md)** - API documentation

## 🙏 Acknowledgments

- Web Crypto API for browser-based encryption
- Supabase for database hosting
- OWASP for security best practices

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  <strong>Digital Legacy Vault</strong><br>
  Securing what matters most 🔐
</p>
