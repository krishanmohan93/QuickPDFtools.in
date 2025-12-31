# How to Get Your Email Password (SMTP)

To make your contact form send real emails, you need an SMTP Password.

## ✅ Option 1: Gmail (Free & Easiest)

**Requirements**: A Gmail account with 2-Step Verification enabled.

1.  **Go to Google Account Security**:
    [https://myaccount.google.com/security](https://myaccount.google.com/security)

2.  **Enable 2-Step Verification**:
    If it's off, turn it ON. You cannot create an App Password without it.

3.  **Generate App Password**:
    - Go to the search bar at the top of the Google Account page.
    - Search for "**App Passwords**".
    - Click on the result **App Passwords**.
    - If asked, sign in again.
    - **App Name**: Type "QuickPDFTools".
    - Click **Create**.

4.  **Copy the Password**:
    - Google will show a 16-character code in a yellow box (e.g., `abcd efgh ijkl mnop`).
    - **This is your SMTP_PASSWORD**.

5.  **Update your project**:
    - Open (or create) `.env.local` in your project folder.
    - Add/Update these lines:
      ```env
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=587
      SMTP_USER=your.email@gmail.com
      SMTP_PASSWORD=abcd efgh ijkl mnop  <-- Paste the code here
      ```

---

## 🏢 Option 2: Resend (Best for Business)

If you own `quickpdftools.in`, using Resend prevents your emails from going to spam.

1.  Sign up at [Resend.com](https://resend.com).
2.  Add your domain (`quickpdftools.in`) and verify DNS records.
3.  Go to **Settings** > **SMTP**.
4.  Copy the credentials:
    - Host: `smtp.resend.com`
    - Port: `465` (Secure) or `587`
    - User: `resend`
    - Password: [Your API Key]

---

## 🧪 Testing

After updating `.env.local`:
1.  Restart your server: `Ctrl+C` then `npm run dev`.
2.  Send a test message from your Contact Page.
3.  Check your inbox!
