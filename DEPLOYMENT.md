# Deployment Guide

## GitHub Repository Setup

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit with PayHero integration"
```

### 2. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `survey-app` (or your preferred name)
3. Don't initialize with README, .gitignore, or license (we already have these)

### 3. Add Remote and Push
```bash
git remote add origin https://github.com/yourusername/survey-app.git
git branch -M main
git push -u origin main
```

## Vercel Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy to Vercel
```bash
vercel
```

### 4. Configure Environment Variables in Vercel

After deployment, you need to add these environment variables in Vercel dashboard:

#### Required Environment Variables:
```
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
NEXT_PUBLIC_TILL_NUMBER=9824375
PAYHERO_API_KEY=6nhZINucQCOkqyJ7x7OO
PAYHERO_MERCHANT_ID=6902
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

#### Firebase Setup:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Get your Firebase configuration from Project Settings
4. Add the Firebase config to Vercel environment variables

#### PayHero Setup:
1. Ensure your PayHero credentials are correctly set
2. Update webhook URL in PayHero dashboard to: `https://your-app.vercel.app/api/payhero/webhook`

### 5. Production Deployment Commands

#### Deploy to Production
```bash
vercel --prod
```

#### Link to Existing Project
```bash
vercel link
```

## Environment Variables Reference

### .env.local (Development)
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NEXT_PUBLIC_TILL_NUMBER=9824375
PAYHERO_API_KEY=6nhZINucQCOkqyJ7x7OO
PAYHERO_MERCHANT_ID=6902
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### Vercel Environment Variables (Production)
Same as .env.local but with production values:
- `NEXT_PUBLIC_BASE_URL` should be your Vercel app URL
- Firebase config should be for production project
- PayHero credentials remain the same

## Post-Deployment Steps

### 1. Configure PayHero Webhook
1. Go to PayHero dashboard
2. Navigate to Webhooks settings
3. Set webhook URL to: `https://your-app.vercel.app/api/payhero/webhook`
4. Test the webhook connection

### 2. Test Payment Flow
1. Visit your deployed application
2. Go to pricing page
3. Select a plan and try PayHero payment
4. Verify payment processing works correctly

### 3. Monitor Logs
```bash
vercel logs your-app.vercel.app
```

## Troubleshooting

### Common Issues:

1. **API Routes Not Working**
   - Check environment variables are set in Vercel
   - Verify PayHero credentials are correct
   - Check webhook URL is properly configured

2. **Firebase Authentication Issues**
   - Ensure Firebase project is properly configured
   - Add your domain to Firebase authorized domains
   - Check API keys are correct

3. **PayHero Payment Failures**
   - Verify webhook is configured correctly
   - Check PayHero dashboard for error logs
   - Ensure API credentials are valid

### Getting Help:
- Check Vercel deployment logs
- Monitor PayHero dashboard for payment errors
- Use browser developer tools to debug frontend issues