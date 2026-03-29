# PayHero Integration Guide

This document explains how to integrate PayHero payment gateway with your existing M-Pesa till number for seamless payments in your survey application.

## Overview

The PayHero integration provides an alternative payment method alongside your traditional M-Pesa till payment system. Users can now pay via PayHero's secure checkout or continue using the traditional M-Pesa till number.

## Features

- **Dual Payment Methods**: Traditional M-Pesa till + PayHero checkout
- **Automatic Payment Tracking**: Links payments to user accounts
- **Webhook Integration**: Real-time payment status updates
- **Secure Payment Processing**: PayHero handles M-Pesa transactions securely
- **Mobile-Optimized**: Works seamlessly on mobile devices

## Files Created/Modified

### New Files
1. `src/lib/payhero.ts` - PayHero API service
2. `src/lib/paymentTracker.ts` - Payment tracking system
3. `src/app/api/payhero/webhook/route.ts` - Webhook endpoint
4. `.env.example` - Environment variables template

### Modified Files
1. `src/app/pricing/PaymentModal.tsx` - Updated with PayHero integration
2. `src/app/pricing/Pricing.module.css` - Added styles for dual payment methods
3. `src/lib/firebase.ts` - Added exports for Firestore functions

## Setup Instructions

### 1. Get PayHero API Credentials

1. Sign up at [PayHero](https://payhero.co.ke)
2. Verify your M-Pesa till number (9824375 - HAKIKA R PROVISION)
3. Get your API Key and Merchant ID from the dashboard
4. Set up webhook URL: `https://your-domain.com/api/payhero/webhook`

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# PayHero Configuration
NEXT_PUBLIC_PAYHERO_API_KEY=your_payhero_api_key_here
NEXT_PUBLIC_PAYHERO_MERCHANT_ID=your_payhero_merchant_id_here
NEXT_PUBLIC_PAYHERO_WEBHOOK_URL=https://your-domain.com/api/payhero/webhook

# Your existing Firebase config (keep as is)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=survey-pro-46195.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=survey-pro-46195
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=survey-pro-46195.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=397804202063
NEXT_PUBLIC_FIREBASE_APP_ID=1:397804202063:web:6448361ef5898fbefbe23a

# Your M-Pesa Till (keep as is)
NEXT_PUBLIC_TILL_NUMBER=9824375
NEXT_PUBLIC_TILL_NAME=HAKIKA R PROVISION
```

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the pricing page
3. Select a plan and click "Select Plan"
4. In the payment modal, you'll see two payment options:
   - **Traditional M-Pesa**: Use your existing till number
   - **PayHero Payment**: New secure payment method

## How It Works

### Traditional M-Pesa Flow (Existing)
1. User sees your till number (9824375)
2. User pays via M-Pesa to the till
3. User pastes M-Pesa confirmation SMS
4. System verifies payment manually

### PayHero Button Flow (New - Recommended)
1. User enters phone number
2. System creates payment record in Firestore
3. PayHero button renders in modal
4. User clicks "Pay Now" button
5. M-Pesa STK push sent to user's phone
6. User enters PIN to complete payment
7. PayHero sends webhook with payment success
8. System automatically updates user's plan

### PayHero API Flow (Fallback)
1. User enters phone number
2. System creates payment record in Firestore
3. PayHero checkout opens in new tab
4. User completes payment via PayHero
5. PayHero sends webhook to your endpoint
6. System automatically updates user's plan

## Webhook Processing

The webhook endpoint (`/api/payhero/webhook`) handles:
- Payment status updates
- Automatic user plan upgrades
- Payment verification
- Error handling

## Database Structure

### New Collection: `payments`
```javascript
{
  id: "PAY-1234567890-abc123",
  userId: "user_firebase_uid",
  plan: "silver",
  amount: 200,
  phoneNumber: "254712345678",
  reference: "PAY-1234567890-abc123",
  status: "completed", // pending, completed, failed, cancelled
  createdAt: 1234567890,
  completedAt: 1234567900,
  transactionId: "payhero_transaction_id"
}
```

## Error Handling

The integration includes comprehensive error handling for:
- Network failures
- Invalid phone numbers
- Payment failures
- Webhook verification
- Database errors

## Security Features

- Phone number validation and formatting
- Payment reference generation
- Webhook signature verification (placeholder for future implementation)
- Secure API key storage
- User authentication required for payments

## Mobile Optimization

- Responsive design for all screen sizes
- Mobile-friendly payment forms
- Optimized PayHero checkout experience
- Touch-friendly interface elements

## Troubleshooting

### Common Issues

1. **Payment not processing**: Check PayHero API credentials
2. **Webhook not working**: Verify webhook URL in PayHero dashboard
3. **Phone number errors**: Ensure correct format (2547XXXXXXXX)
4. **Plan not updating**: Check Firebase permissions and webhook processing

### Debug Mode

Enable debug logging by adding to your `.env.local`:
```bash
NEXT_PUBLIC_DEBUG_PAYHERO=true
```

## Future Enhancements

- SMS notifications for payment status
- Payment history in user profile
- Admin dashboard for payment monitoring
- Recurring payment support
- Payment receipts and invoices

## Support

For PayHero-related issues:
- Contact PayHero support at support@payhero.co.ke
- Visit [PayHero Documentation](https://docs.payhero.co.ke)

For application-related issues:
- Check browser console for errors
- Verify environment variables are set correctly
- Ensure Firebase rules allow payment record creation