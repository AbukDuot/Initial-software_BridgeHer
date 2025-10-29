# Easy Email Setup (No Gmail App Password Needed)

## Option 1: SendGrid (FREE - Recommended)

### Step 1: Create Account
1. Go to: https://signup.sendgrid.com/
2. Sign up (FREE - 100 emails/day)
3. Verify email

### Step 2: Create API Key
1. Go to: https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"
3. Name: "BridgeHer"
4. Permissions: "Full Access"
5. Click "Create & View"
6. **Copy the API Key** (starts with SG.)

### Step 3: Update Code
Replace emailService.js transporter with:

```javascript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendWelcomeEmail = async (email, name) => {
  await sgMail.send({
    to: email,
    from: process.env.EMAIL_USER,
    subject: "Welcome to BridgeHer! 🎉",
    html: `<h2>Welcome ${name}!</h2><p>Your journey starts now!</p>`,
  });
};
```

### Step 4: Update .env
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Option 2: Ethereal (FREE - Testing Only)

### Step 1: Create Test Account
1. Go to: https://ethereal.email/create
2. Copy credentials shown

### Step 2: Update .env
```env
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_user
EMAIL_PASSWORD=your_ethereal_password
```

### Step 3: Update emailService.js
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

---

## Option 3: Gmail with Regular Password (Less Secure)

### Enable "Less secure app access"
1. Go to: https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps"
3. Use your regular Gmail password in .env

**Note**: Google may block this. Not recommended.

---

## Recommended: SendGrid
- 100 emails/day FREE
- No complex setup
- Production-ready
- Easy API
