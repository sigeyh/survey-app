# Fix STK Push Issue (No M-Pesa Prompt)

## Status: In Progress

**Root Cause:** Missing .env.local → API credentials undefined → Server returns 500 before calling Payhero.

### Steps:
- [x] 1. Start dev server (`npm run dev`) - Site at **http://localhost:3001**
- [ ] 2. Create .env.local with Payhero credentials
- [ ] 3. Enhance /api/payhero/route.ts for better error logging
- [x] 4. User: Add real API_KEY, MERCHANT_ID → Server reloaded
- [ ] 5. Test: Go to /pricing → PayHero → Enter phone → Check STK push + logs
- [ ] 6. Add webhook route for callbacks
- [ ] 7. Verify payment updates Firebase/user plan

**Status:** Payhero still 404 "Endpoint not found" on /v1/payments (edit pending reload)
**Merchant ID:** 6902 ✅ (real)
**Next:** Test again after code reload - or confirm if STK received on phone now?
