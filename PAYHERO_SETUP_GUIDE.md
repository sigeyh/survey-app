# PayHero Configuration Guide

## Information Needed from PayHero Dashboard

To complete the STK push integration, you need to provide the following information from your PayHero dashboard:

### 1. **API Credentials** (Already Configured ✅)
- ✅ **API Key**: `6nhZINucQCOkqyJ7x7OO`
- ✅ **Merchant ID**: `6902`

### 2. **Channel Configuration**
From your PayHero dashboard, you need to find and provide:

#### **Channel ID**
- Location: PayHero Dashboard → Channels → [Your Channel]
- This is typically your Merchant ID, but may be different
- Format: Usually a 4-6 digit number

#### **Channel Name**
- Location: PayHero Dashboard → Channels → [Your Channel]
- Example: "HAKIKA R PROVISION" (this should match your till name)

### 3. **Webhook Configuration**
You need to configure the webhook URL in your PayHero dashboard:

#### **Webhook URL to Set:**
```
http://localhost:3001/api/payhero/webhook
```

#### **For Production (after deployment):**
```
https://your-app.vercel.app/api/payhero/webhook
```

### 4. **Till Number Verification**
- ✅ **Till Number**: `9824375` (already configured)
- ✅ **Till Name**: `HAKIKA R PROVISION` (already configured)

### 5. **Lipwa Link**
- ✅ **Lipwa Link**: `https://short.payhero.co.ke/s/cNQKbWqAMQbmh72LRmLXmk` (already configured)

## How to Find Channel Information

1. **Login to PayHero Dashboard**
2. **Navigate to Channels**
3. **Select your channel** (should be the one with Till Number 9824375)
4. **Copy the Channel ID** (this might be different from Merchant ID)
5. **Verify Channel Name** matches "HAKIKA R PROVISION"

## What to Provide

Please provide:
1. **Channel ID** (if different from Merchant ID: 6902)
2. **Confirm Channel Name** is "HAKIKA R PROVISION"
3. **Confirm Webhook URL** is set to: `http://localhost:3001/api/payhero/webhook`

## Testing the Integration

Once you provide the channel information:

1. **Update Environment Variables** (if Channel ID is different)
2. **Test Payment Flow** on your local development server
3. **Verify Webhook Processing** in browser console
4. **Check Payment Records** in Firestore

## Troubleshooting

If payments still fail:
1. **Check PayHero Dashboard** for error logs
2. **Verify Webhook URL** is correctly configured
3. **Test with Small Amounts** first
4. **Check Browser Console** for JavaScript errors

## Next Steps

1. **Provide Channel Information** from your PayHero dashboard
2. **I'll Update Configuration** if needed
3. **Test the Integration** locally
4. **Deploy to Production** when ready

## Security Note

⚠️ **Do NOT share login credentials** - I cannot accept usernames/passwords for security reasons. Only provide the configuration details listed above.