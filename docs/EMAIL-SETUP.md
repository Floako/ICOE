# Email Configuration for ICON

The ICON application now sends invitation emails when you invite someone to view your emergency information. To enable this feature, you need to configure email settings.

## Setup Options

### Option 1: Using Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Factor Authentication

2. **Create App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Google will generate a 16-character password

3. **Set Environment Variables:**
   Create a `.env` file in the `backend` folder:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Restart the backend server:**
   ```bash
   npm start
   ```

### Option 2: Using Mailtrap (Easy Testing)

1. **Create Mailtrap Account:**
   - Go to https://mailtrap.io
   - Sign up for a free account
   - Go to Integrations → Node.js

2. **Copy Configuration:**
   - Mailtrap provides SMTP credentials on the same page

3. **Set Environment Variables:**
   Create a `.env` file in the `backend` folder:
   ```
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_SECURE=false
   EMAIL_USER=your-mailtrap-username
   EMAIL_PASSWORD=your-mailtrap-password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Restart the backend server**

### Option 3: Using SendGrid (Production)

1. **Create SendGrid Account:**
   - Go to https://sendgrid.com
   - Sign up and verify your account

2. **Create API Key:**
   - Go to Settings → API Keys
   - Create a new API key

3. **Set Environment Variables:**
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=SG.your-api-key-here
   FRONTEND_URL=https://your-domain.com
   ```

## Environment Variables

The following environment variables control email behavior:

- `EMAIL_HOST` - SMTP server host (default: smtp.mailtrap.io)
- `EMAIL_PORT` - SMTP port (default: 587)
- `EMAIL_SECURE` - Use TLS (default: false)
- `EMAIL_USER` - Email account username
- `EMAIL_PASSWORD` - Email account password or app password
- `FRONTEND_URL` - Frontend URL for invitation links (default: http://localhost:3000)

## Testing Email

Once configured:

1. **Register a test account:**
   - Open http://localhost:3000
   - Create an account

2. **Send an invitation:**
   - Go to "Share Data" tab
   - Search for an email address (e.g., test@example.com)
   - Click "Invite"

3. **Check email:**
   - If using Mailtrap: Check Inbox in Mailtrap dashboard
   - If using Gmail: Check your Gmail inbox
   - If using SendGrid: Check email address or verify sends

## Invitation Email Flow

1. **Owner sends invitation** → Backend creates invitation record and sends email
2. **Recipient receives email** → Email contains a link to register
3. **Recipient clicks link** → Frontend pre-fills email on registration page
4. **Recipient registers** → Account created
5. **Auto-accept** → Previously sent permissions activate automatically

## Email Content

The invitation email includes:

- Sender's name (the person who invited them)
- Explanation of ICON (In Case Of Need)
- A prominent "Accept Invitation" button
- 48-hour expiration notice
- Instructions to contact sender if unexpected

## Troubleshooting

### Email not being sent?

1. **Check email configuration:**
   ```bash
   # Verify .env file exists in backend folder
   cat .env
   ```

2. **Check backend logs:**
   - Look for "Invitation email sent" or error messages in terminal

3. **Verify credentials:**
   - Test credentials on the email service's website first
   - Ensure app passwords are used (not regular password)

4. **Check firewall:**
   - Some networks block SMTP ports (587, 465)
   - Try from a different network

### Email goes to spam?

- This is normal for test services (Mailtrap)
- Production email services have better deliverability
- Add yourself to sender's contacts to avoid spam folder

### Recipients not getting email?

- Verify email address is spelled correctly
- Check spam folder
- Confirm email service credentials are correct
- Check backend console for errors

## Production Deployment

For production:

1. **Use a professional email service:**
   - SendGrid, AWS SES, Mailgun, or similar
   - Avoid Gmail for production (rate limits)

2. **Update environment variables:**
   - Set `FRONTEND_URL` to your actual domain
   - Use strong, unique `EMAIL_PASSWORD`

3. **Enable TLS:**
   - Set `EMAIL_SECURE=true` for services that require it
   - Use port 465 instead of 587 for TLS

4. **Monitor email delivery:**
   - Set up bounce/unsubscribe handling
   - Monitor for authentication failures
   - Track open rates and clicks

## Next Steps

- [Email sent successfully?](#) Start sending invitations!
- [Need help?] Check Application Architecture documentation
- [Want to customize?] See Contribution Guidelines
