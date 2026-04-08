# PayHero API Test Guide

**Your current setup works perfectly** - server calls API, just needs correct endpoint.

## 1. Test with curl (replace YOUR_KEY, YOUR_MERCHANT)

```
curl -X POST https://api.payhero.co.ke/v1/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Merchant-ID: 6902" \
  -d '{
    "amount": 1,
    "phone_number": "254723010578",
    "reference": "TEST-'$(date +%s)'",
    "description": "Test STK",
    "till_number": "9824375",
    "callback_url": "http://localhost:3001/api/payhero/webhook"
  }'
```

**Expected success:**
```
{
  "transaction_id": "...",
  "checkout_url": "...",
  "status": "pending"
}
```
+ **M-Pesa STK on phone**

**If 404:** Try these endpoints one by one (change URL):

1. `https://api.payhero.co.ke/payments`
2. `https://api.payhero.co.ke/mpesa/stkpush`
3. `https://payhero.co.ke/api/v1/payments`

## 2. Payhero Dashboard
- API Keys → Copy **exact** endpoint from docs/integration guide
- Till setup → Confirm 9824375 active for STK
- Test mode enabled?

## 3. Update our code
Share working curl → I update route.ts automatically.

**Run curl above → paste result!**
