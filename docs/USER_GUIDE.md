# Digital Legacy Vault
## Step-by-Step User Guide

---

# How the Project Works

**A Complete Walkthrough for Users and Nominees**

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Step 1: Accessing the Vault Dashboard](#step-1-accessing-the-vault-dashboard)
4. [Step 2: Entering Your Legacy Information](#step-2-entering-your-legacy-information)
5. [Step 3: Encrypting Your Vault](#step-3-encrypting-your-vault)
6. [Step 4: Configuring the Dead Man's Switch](#step-4-configuring-the-dead-mans-switch)
7. [Step 5: Exporting Your Recovery Key](#step-5-exporting-your-recovery-key)
8. [Step 6: Regular Check-ins](#step-6-regular-check-ins)
9. [What Happens When the Switch Triggers](#what-happens-when-the-switch-triggers)
10. [Nominee Access Guide](#nominee-access-guide)
11. [Technical How-To for Developers](#technical-how-to-for-developers)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The Digital Legacy Vault is a secure system that allows you to:

✅ Store sensitive information (passwords, accounts, wishes)  
✅ Encrypt everything with a master password  
✅ Automatically share with a trusted person if you're inactive  
✅ Give your nominee a recovery key to access your vault  

### The Complete Flow

```
   YOU                           SYSTEM                         NOMINEE
    │                              │                               │
    │   1. Enter vault data        │                               │
    ├─────────────────────────────►│                               │
    │                              │                               │
    │   2. Encrypt with password   │                               │
    ├─────────────────────────────►│                               │
    │                              │                               │
    │   3. Configure switch        │                               │
    ├─────────────────────────────►│                               │
    │                              │                               │
    │   4. Export PDF recovery key │                               │
    ├─────────────────────────────►│                               │
    │                              │                               │
    │   5. Share PDF with nominee  │                               │
    ├──────────────────────────────┼──────────────────────────────►│
    │                              │                               │
    │   6. Periodic check-ins      │                               │
    ├─────────────────────────────►│                               │
    │                              │                               │
    │        [If inactive]         │                               │
    │                              │   7. Send access email        │
    │                              ├──────────────────────────────►│
    │                              │                               │
    │                              │   8. Enter recovery key       │
    │                              │◄──────────────────────────────┤
    │                              │                               │
    │                              │   9. View decrypted vault     │
    │                              ├──────────────────────────────►│
```

---

## Getting Started

### What You Need

- A modern web browser (Chrome, Firefox, Edge, or Safari)
- A strong master password (12+ characters recommended)
- Your nominee's email address
- A safe place to store your recovery key (physical or digital)

### File Structure

```
Digivault/
├── index.html           ← Main vault dashboard (open this)
├── styles.css           ← Styling
├── script.js            ← Application logic
├── nominee-access.html  ← Page for your nominee
└── backend/             ← Server (for production)
```

### Opening the Application

**Option 1: Local File (For Personal Use)**
1. Navigate to the `Digivault` folder
2. Double-click `index.html`
3. The vault opens in your default browser

**Option 2: Web Server (For Production)**
1. Host files on a web server or use Live Server
2. Navigate to your deployed URL

---

## Step 1: Accessing the Vault Dashboard

### What You See

When you open the vault, you'll see:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DIGITAL LEGACY VAULT                          │
│                    Premium Header with Tagline                   │
├─────────────────────────────────────────────────────────────────┤
│  [Vault Status]                    [Export PDF] [Clear] [Seal]  │
├─────────────────────────────────────────────────────────────────┤
│                    Progress: ██████░░░░ 45%                      │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ 🔐 ENCRYPTION   │  │                 │  │                 │  │
│  │    PANEL        │  │                 │  │                 │  │
│  └─────────────────┘  │                 │  │                 │  │
│                       │                 │  │                 │  │
│  ┌─────────────────┐  │  VAULT CARDS    │  │   VAULT CARDS   │  │
│  │ 💰 Financial    │  │  (4 sections)   │  │   (continued)   │  │
│  │    Assets       │  │                 │  │                 │  │
│  ├─────────────────┤  │                 │  │                 │  │
│  │ 💻 Digital      │  │                 │  │                 │  │
│  │    Presence     │  │                 │  │                 │  │
│  ├─────────────────┤  │                 │  │                 │  │
│  │ 🏠 Physical     │  │                 │  │                 │  │
│  │    Assets       │  │                 │  │                 │  │
│  ├─────────────────┤  │                 │  │                 │  │
│  │ ❤️ Final        │  │                 │  │                 │  │
│  │    Wishes       │  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ⏰ DEAD MAN'S SWITCH                                           │
│  Configure your nominee settings                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Interface Elements

| Element | Purpose |
|---------|---------|
| **Progress Bar** | Shows how much you've filled out |
| **Seal Vault** | Manually save your data |
| **Export PDF** | Generate recovery key document |
| **Clear** | Erase all vault data |
| **Vault Cards** | Collapsible sections for data entry |

---

## Step 2: Entering Your Legacy Information

### The Four Vault Sections

#### 💰 Financial Assets

Click to expand this section and fill in:

```
┌─────────────────────────────────────────────────────────────────┐
│  💳 BANK ACCOUNTS                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Example:                                                     ││
│  │ Chase Checking: Account #1234567890                         ││
│  │ Login: myemail@gmail.com                                    ││
│  │ Phone PIN: 1234                                             ││
│  │                                                             ││
│  │ Wells Fargo Savings: Account #0987654321                    ││
│  │ Login: different@email.com                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🛡️ INSURANCE POLICIES                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Life Insurance: MetLife Policy #ABC123                      ││
│  │ Beneficiary: Already set to spouse                          ││
│  │ Agent: John Smith (555-123-4567)                            ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  📈 INVESTMENT ACCOUNTS                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Fidelity 401k: Login at netbenefits.com                     ││
│  │ Username: myusername                                        ││
│  │ Password hint: Our anniversary + pet name                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### 💻 Digital Presence

```
┌─────────────────────────────────────────────────────────────────┐
│  📧 EMAIL ACCOUNTS                                               │
│  Primary: myemail@gmail.com                                      │
│  Recovery: backupemail@outlook.com                               │
│                                                                  │
│  🔐 PASSWORD MANAGER                                             │
│  Using: 1Password                                                │
│  Master Password Hint: Childhood address + lucky number         │
│  Emergency Kit Location: Fireproof safe in bedroom closet       │
│                                                                  │
│  📱 SOCIAL MEDIA                                                 │
│  Facebook: Profile should be memorialized                        │
│  LinkedIn: Please deactivate                                     │
│  Instagram: Download photos, then delete                         │
│                                                                  │
│  ₿ DIGITAL ASSETS                                                 │
│  Crypto: Ledger hardware wallet in safe                          │
│  Recovery seed: In sealed envelope with lawyer                   │
│  Domain names: GoDaddy account (see password manager)            │
└─────────────────────────────────────────────────────────────────┘
```

#### 🏠 Physical Assets

```
┌─────────────────────────────────────────────────────────────────┐
│  🏛️ PROPERTY & TITLES                                           │
│  House deed: Filed with County Recorder                          │
│  Car titles: In filing cabinet, top drawer                       │
│                                                                  │
│  🔑 KEYS & ACCESS CODES                                          │
│  Safe combination: 24-36-12                                      │
│  Garage code: 4567                                               │
│  Storage unit: Unit 42 at StoragePro, key on keyring             │
│                                                                  │
│  📄 IMPORTANT DOCUMENTS                                          │
│  Will: With attorney (Johnson & Associates, 555-789-0123)        │
│  Birth certificate: Fireproof safe                               │
│  Passport: Top desk drawer                                       │
└─────────────────────────────────────────────────────────────────┘
```

#### ❤️ Final Wishes

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚰️ MEMORIAL PREFERENCES                                        │
│  I prefer cremation. No formal funeral service.                  │
│  Celebration of life gathering at our home would be nice.        │
│  Favorite music: [playlist link]                                 │
│                                                                  │
│  🏥 MEDICAL WISHES                                               │
│  Organ donor: YES (on driver's license)                          │
│  DNR signed: Copy with doctor (Dr. Smith) and in safe            │
│                                                                  │
│  💌 PERSONAL MESSAGES                                            │
│  To my spouse: See letter in safe deposit box                    │
│  To my children: I've written letters for each of you            │
│                                                                  │
│  🎁 LEGACY & CHARITABLE GIVING                                   │
│  Donate $5,000 to American Red Cross                             │
│  Scholarship fund: Already set up at alma mater                  │
└─────────────────────────────────────────────────────────────────┘
```

### Auto-Save Feature

Your data automatically saves as you type. Look for the status indicator:

```
✓ Saved Dec 27, 10:30 AM
```

---

## Step 3: Encrypting Your Vault

### Why Encrypt?

Without encryption, your data is stored in plain text in your browser. Anyone with access to your computer could read it.

With encryption, your data becomes unreadable without your master password.

### How to Encrypt

1. **Locate the Encryption Panel** (top of the page)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔐 Zero-Knowledge Encryption                    [🔓 Unencrypted]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Master Password                                                 │
│  ┌───────────────────────────────────────────────────────┬────┐ │
│  │ ••••••••••••••                                        │ 👁️ │ │
│  └───────────────────────────────────────────────────────┴────┘ │
│                                                                  │
│  Password Strength: ████████░░ Strong                            │
│                                                                  │
│  [    🔒 Encrypt Vault    ]     [    🔓 Decrypt Vault    ]      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

2. **Enter a Strong Master Password**

   Good password example: `MyD0g$Name!Was*Buddy2015`

   The strength meter should show "Strong" or at least "Good"

3. **Click "Encrypt Vault"**

4. **What Happens:**
   - All your data is encrypted using AES-256-GCM
   - The encrypted blob is stored in your browser
   - Your original data is deleted
   - All vault cards show a "locked" blur effect

5. **Status Changes:**

```
Before: [🔓 Unencrypted]
After:  [🔒 Encrypted]
```

### ⚠️ CRITICAL: Remember Your Password!

There is NO password recovery. If you forget your master password, your data is permanently inaccessible. This is a feature, not a bug - it ensures true zero-knowledge security.

---

## Step 4: Configuring the Dead Man's Switch

### What is the Dead Man's Switch?

A safety mechanism that automatically shares your vault with your nominee if you don't check in for a set period of time.

### Configuration Steps

1. **Scroll to the Nominee Section** (near the bottom of the page)

```
┌─────────────────────────────────────────────────────────────────┐
│  ⏰ Dead Man's Switch                         [⚪ Not Configured]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📍 Last Check-in: Never                                    ││
│  │  ⏱️ Time until trigger: Not active                          ││
│  │                               [   ✓ I'm Still Here   ]      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  📋 NOMINEE CONFIGURATION                                        │
│  ┌──────────────────────────┐  ┌──────────────────────────┐     │
│  │ Nominee Email *          │  │ Nominee Name             │     │
│  │ spouse@email.com         │  │ Jane Doe                 │     │
│  └──────────────────────────┘  └──────────────────────────┘     │
│  ┌──────────────────────────┐  ┌──────────────────────────┐     │
│  │ Inactivity Period        │  │ Relationship             │     │
│  │ 180 days            ▼    │  │ Spouse               ▼   │     │
│  └──────────────────────────┘  └──────────────────────────┘     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Personal Message to Nominee                             │    │
│  │ My dearest, if you're reading this, I want you to know │    │
│  │ that all my important information is here...           │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  [   🧪 Send Test Email   ]    [   🚀 Activate Dead Man's Switch ]│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

2. **Fill in Required Fields:**

   | Field | What to Enter |
   |-------|---------------|
   | **Nominee Email** | The email address of your trusted person |
   | **Nominee Name** | Their name (for the email greeting) |
   | **Inactivity Period** | How long before the switch triggers |
   | **Relationship** | Spouse, Family, Friend, Attorney, Other |
   | **Personal Message** | A message included in their notification |

3. **Choose Your Inactivity Period:**

   | Period | Best For |
   |--------|----------|
   | 30 days | Active travelers, those with health concerns |
   | 60 days | Regular check-in preference |
   | 90 days | Standard safety margin |
   | **180 days** | Recommended for most users |
   | 1 year | For long-term planning |

4. **Click "Activate Dead Man's Switch"**

5. **Status Updates:**

```
Before: [⚪ Not Configured]
After:  [🟢 Active]

Last Check-in: Dec 27, 2024, 10:45 AM
Time until trigger: 180 days
```

---

## Step 5: Exporting Your Recovery Key

### Why Export?

Your nominee needs the Recovery Key to decrypt your vault. The PDF provides:
- A printable copy of the key
- A QR code for easy entry
- Instructions for your nominee

### How to Export

1. **Click "Export PDF" in the Header**

```
[📄 Export PDF] [🗑️ Clear] [💾 Seal Vault]
```

2. **A New Window Opens** with a beautifully formatted document:

```
┌─────────────────────────────────────────────────────────────────┐
│                          🔐                                      │
│               MASTER RECOVERY KEY                                │
│          Digital Legacy Vault · Keep Safe                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ CONFIDENTIAL - STORE SECURELY                               │
│  This contains your Master Recovery Key...                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔑 YOUR MASTER RECOVERY KEY                                     │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │           CuTTM-WDr8H-5DQmZ-nDpar                           ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│   ┌───────────┐   Scan this QR code to quickly access           │
│   │ ▓▓▓▓▓▓▓▓▓ │   your recovery key, or enter it manually       │
│   │ ▓       ▓ │   when accessing the vault.                     │
│   │ ▓ ▓▓▓▓▓ ▓ │                                                  │
│   │ ▓       ▓ │                                                  │
│   │ ▓▓▓▓▓▓▓▓▓ │                                                  │
│   └───────────┘                                                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  Document Created: Friday, December 27, 2024                     │
│  Encryption: AES-256-GCM                                         │
│  Designated Nominee: Jane Doe (spouse@email.com)                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 INSTRUCTIONS FOR NOMINEE                                     │
│  1. You will receive an email with a secure access link         │
│  2. Click the link to open the Nominee Access page              │
│  3. Enter this Master Recovery Key when prompted                │
│  4. The vault contents will be decrypted in your browser        │
│  5. All decryption happens locally - your key is never sent     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

3. **The Print Dialog Opens Automatically**

   - Save as PDF, or
   - Print a physical copy

4. **Store the Document Securely:**

   | Storage Method | Pros | Cons |
   |---------------|------|------|
   | Physical safe | Fireproof, no hacking risk | Could be lost in disaster |
   | Bank safe deposit box | Very secure | Requires bank visit |
   | Sealed envelope with attorney | Legal protection | May have fees |
   | Encrypted cloud storage | Accessible anywhere | Requires another password |
   | With your nominee directly | They have it already | Less control |

---

## Step 6: Regular Check-ins

### Why Check In?

Every time you check in, the inactivity timer resets. This prevents false triggers while ensuring the switch activates if you're truly unavailable.

### How to Check In

1. **Visit the Vault Dashboard**

2. **Scroll to the Dead Man's Switch Section**

3. **Click the Green Button:**

```
[   ✓ I'm Still Here   ]
```

4. **Timer Resets:**

```
Last Check-in: Dec 27, 2024, 11:00 AM (just now)
Time until trigger: 180 days
```

### Check-in Reminders

The system sends email reminders:

| Timeline | Email Sent |
|----------|------------|
| 75% of period elapsed | ⚠️ First Warning |
| 90% of period elapsed | 🚨 Final Warning |
| 100% elapsed | 🔓 Switch Triggered |

**Example for 180-day period:**
- Day 135: First warning email
- Day 162: Final warning email
- Day 180: Nominee receives access email

---

## What Happens When the Switch Triggers

### Timeline of Events

```
Day 0:    User activates switch, timer starts
          ├── Check-ins reset timer
          │
Day 135:  ⚠️ Warning email to user
          │   "Your Dead Man's Switch will trigger in 45 days"
          │   [Check In Now] button
          │
Day 162:  🚨 FINAL WARNING email to user
          │   "Only 18 days remaining!"
          │   [Check In Now - Reset Timer] button
          │
Day 180:  🔓 SWITCH TRIGGERED
          │
          ├── Access token generated (valid 30 days)
          ├── Email sent to nominee with access link
          ├── Personal message included in email
          │
          ▼
Nominee receives:                                    
┌─────────────────────────────────────────────────────────────────┐
│  Subject: 🔓 Digital Legacy Vault - Access Granted              │
│                                                                  │
│  Dear [Nominee Name],                                            │
│                                                                  │
│  You have been designated as a trusted nominee for a Digital    │
│  Legacy Vault belonging to [User Email].                         │
│                                                                  │
│  Due to extended inactivity, the vault's Dead Man's Switch      │
│  has been triggered.                                             │
│                                                                  │
│  Personal Message from the vault owner:                          │
│  "[Your personal message here]"                                  │
│                                                                  │
│              [   Access the Vault   ]                            │
│                                                                  │
│  This link expires on [Date + 30 days]                          │
│                                                                  │
│  🔒 You will need the Recovery Key to decrypt the vault.        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Nominee Access Guide

### For the Nominee: Accessing the Vault

#### Step 1: Click the Email Link

When the switch triggers, you receive an email. Click "Access the Vault."

#### Step 2: The Nominee Access Page

You'll see:

```
┌─────────────────────────────────────────────────────────────────┐
│                          ❤️                                      │
│           You've Been Granted Access                             │
│      A Digital Legacy Vault has been shared with you             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💌 PERSONAL MESSAGE                                             │
│  "My dearest, if you're reading this..."                         │
│                                                                  │
│  ┌──────────────────────┐  ┌──────────────────────┐             │
│  │ 👤 Vault Owner       │  │ 📅 Access Granted    │             │
│  │ owner@email.com      │  │ December 27, 2024    │             │
│  └──────────────────────┘  └──────────────────────┘             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔐 Enter Recovery Key                                           │
│                                                                  │
│  This vault is encrypted for security. Enter the Master          │
│  Recovery Key that was shared with you.                          │
│                                                                  │
│  Master Recovery Key                                             │
│  ┌───────────────────────────────────────────────────────┬────┐ │
│  │ CuTTM-WDr8H-5DQmZ-nDpar                               │ 👁️ │ │
│  └───────────────────────────────────────────────────────┴────┘ │
│                                                                  │
│              [   🔓 Unlock Vault   ]                             │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  🛡️ Zero-Knowledge Security                                     │
│  Your recovery key never leaves your device.                     │
│  All decryption happens locally in your browser.                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Step 3: Enter the Recovery Key

- Get the PDF document the vault owner shared with you
- Type or scan the recovery key
- Click "Unlock Vault"

#### Step 4: View Decrypted Contents

If the key is correct, all vault sections appear:

```
┌─────────────────────────────────────────────────────────────────┐
│  🔓 VAULT CONTENTS                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💰 FINANCIAL ASSETS                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Bank Accounts: Chase Checking #1234567890...                ││
│  │ Insurance: MetLife Policy #ABC123...                        ││
│  │ Investments: Fidelity 401k...                               ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  💻 DIGITAL PRESENCE                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Email Accounts: myemail@gmail.com...                        ││
│  │ Password Manager: 1Password, Emergency Kit in safe...       ││
│  │ Social Media: Facebook - memorialize, LinkedIn - delete...  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  🏠 PHYSICAL ASSETS                                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Property: House deed with County Recorder...                ││
│  │ Keys: Safe combo 24-36-12, Garage 4567...                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ❤️ FINAL WISHES                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Memorial: Cremation preferred, celebration of life...       ││
│  │ Medical: Organ donor, DNR with doctor...                    ││
│  │ Messages: Letters in safe deposit box...                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### What If the Key Is Wrong?

An error message appears:

```
❌ Incorrect recovery key. Please check and try again.
```

Double-check:
- The key is exactly as printed (including dashes)
- No extra spaces
- Case-sensitive

---

## Technical How-To for Developers

### Running the Backend Server

```bash
# Navigate to backend directory
cd Digivault/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Edit .env with your settings:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
# - APP_URL
# - API_PORT

# Start server
npm run dev   # Development with hot reload
npm start     # Production
```

### Setting Up Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor
3. Run the schema:

```sql
-- Paste contents of backend/database/schema.sql
```

### Connecting Frontend to Backend

In production, update these calls in `script.js`:

```javascript
// Change from localStorage to API calls:
fetch('/api/switch/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ switchId: '...' })
});
```

### Deployment Options

| Platform | Type | Notes |
|----------|------|-------|
| Vercel | Frontend | Static hosting, free tier |
| Netlify | Frontend | Static hosting, free tier |
| Railway | Backend | Node.js hosting |
| Render | Backend | Free tier with sleep |
| Supabase | Database | Free tier includes 500MB |

---

## Troubleshooting

### Common Issues

#### "Encryption failed"

**Cause:** Password too short or browser doesn't support Web Crypto

**Solution:**
- Use at least 8 characters
- Use Chrome, Firefox, or Edge
- Ensure HTTPS if deployed

#### "Decryption failed - wrong password?"

**Cause:** Incorrect password or corrupted data

**Solution:**
- Triple-check your password
- Verify caps lock is off
- Try typing slowly

#### "No encrypted data found"

**Cause:** Data was never encrypted or was cleared

**Solution:**
- You must encrypt before data persists
- Check if another browser was used

#### "Switch not triggering"

**Cause:** Backend server not running or cron not configured

**Solution:**
- Verify backend is running: `curl localhost:3001/api/health`
- Check cron schedule in `.env`
- Review server logs

#### Nominee didn't receive email

**Cause:** Email delivery issues

**Solution:**
- Check spam folder
- Verify SMTP settings in `.env`
- Use "Send Test Email" to verify

### Reset Everything

To completely reset:

```javascript
// In browser console:
localStorage.clear();
```

Or click "Clear" button (requires confirmation).

### Getting Help

- Check `backend/README.md` for API documentation
- Review `docs/PROJECT_REPORT.md` for technical details
- Open an issue on GitHub for bugs

---

## Quick Reference Card

### For Daily Use

| Action | How To |
|--------|--------|
| Add information | Type in any vault card text area |
| Save | Automatic, or click "Seal Vault" |
| Encrypt | Enter password → Click "Encrypt Vault" |
| Decrypt | Enter password → Click "Decrypt Vault" |
| Check in | Click "I'm Still Here" button |
| Export PDF | Click "Export PDF" in header |

### Important Reminders

✅ **DO:**
- Use a strong, memorable password
- Check in at least once per inactivity period
- Give nominee the PDF recovery key
- Update information when things change

❌ **DON'T:**
- Forget your master password
- Share your master password digitally
- Let the PDF be publicly accessible
- Ignore warning emails

---

*Digital Legacy Vault - Securing What Matters Most*

**Version 1.0 | December 2024**
