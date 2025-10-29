# Setup Email & SMS Notifications

## EMAIL NOTIFICATIONS (Gmail) - 2 Minutes

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow steps to enable 2FA

### Step 2: Create App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)"
4. Type: "BridgeHer Backend"
5. Click "Generate"
6. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env
Open `backend/.env` and replace:
```env
EMAIL_PASSWORD=your_gmail_app_password
```
With:
```env
EMAIL_PASSWORD=abcdefghijklmnop
```
(Remove spaces from the app password)

### Step 4: Restart Backend
```bash
cd backend
npm run dev
```

### Test Email:
Register a new user → Check email inbox for welcome message!

---

## SMS NOTIFICATIONS (Twilio) - 5 Minutes (Optional)

### Step 1: Create Twilio Account
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (FREE trial: $15 credit)
3. Verify your phone number

### Step 2: Get Credentials
1. Dashboard: https://console.twilio.com/
2. Copy:
   - **Account SID**: (starts with AC...)
   - **Auth Token**: (click to reveal)
3. Get phone number:
   - Click "Get a Trial Number"
   - Copy the number (e.g., +1234567890)

### Step 3: Update .env
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Restart Backend

### Test SMS:
Register with phone number → Receive welcome SMS!

**Note**: Trial accounts can only send to verified numbers.

---

## What Notifications Are Sent?

### Registration:
✅ Welcome email
✅ Welcome SMS (if phone provided)

### Login:
✅ Login notification email

### Course Enrollment:
✅ Enrollment confirmation email

### Assignment Submission:
✅ Submission confirmation email

### Assignment Graded:
✅ Grade notification email

### Mentorship Request:
✅ Request notification email
✅ Request notification SMS

### Mentorship Accepted:
✅ Acceptance notification email
✅ Acceptance notification SMS

---

## Current Status:

| Service | Status | Action Needed |
|---------|--------|---------------|
| Email   | ⚠️ Not Configured | Add Gmail App Password |
| SMS     | ❌ Not Configured | Add Twilio Credentials (Optional) |

---

## Quick Test (After Setup):

1. Register new user: http://localhost:5173/register
2. Check email inbox for welcome message
3. Check SMS (if Twilio configured)

Done! 🎉
