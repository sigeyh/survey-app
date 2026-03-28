# Payment & Withdrawal Improvements

## Requirements
1. **Free plan**: Max 2 surveys (not 5000)
2. **3rd survey → upgrade prompt**
3. **Min withdrawal**: Ksh 5000 
4. **Real M-Pesa payment**:
   - Till: 9824375 
   - Name: "HAKIKA R PROVISION"
   - Copy till button
   - User pastes M-Pesa message
   - Verify: till name + plan amount + real M-Pesa format

## Files to Update
- src/app/dashboard/page.tsx (2 survey limit)
- src/app/pricing/page.tsx (real M-Pesa till)
- src/app/withdraw/page.tsx (min 5000 + verify)

## Steps
- [x] 1. Update dashboard: 2 free surveys limit, 3rd shows upgrade
- [x] 2. Pricing: M-Pesa till 9824375 + copy button
- [x] 3. Withdraw: min 5000 + M-Pesa verification form

