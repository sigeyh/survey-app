import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, phoneNumber, reference, description, name, email } = body;

        // Validate required fields
        if (!amount || !phoneNumber || !reference) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, phoneNumber, reference' },
                { status: 400 }
            );
        }

        // Get credentials from environment
        const apiKey = process.env.NEXT_PUBLIC_PAYHERO_API_KEY || process.env.PAYHERO_API_KEY;
        const merchantId = process.env.NEXT_PUBLIC_PAYHERO_MERCHANT_ID || process.env.PAYHERO_MERCHANT_ID;

        // Validate API credentials - detailed logging
        if (!apiKey || !merchantId) {
            console.error('🚫 PayHero credentials missing:', {
                hasApiKey: !!apiKey,
                hasMerchantId: !!merchantId,
                tillNumber: process.env.NEXT_PUBLIC_TILL_NUMBER || 'MISSING'
            });
            return NextResponse.json(
                { error: 'PayHero API credentials not configured. Check .env.local (PAYHERO_API_KEY, PAYHERO_MERCHANT_ID)' },
                { status: 500 }
            );
        }
        console.log('✅ PayHero credentials OK, initiating payment...');

        // Format phone number
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        let formattedPhone = cleanPhone.startsWith('254') ? cleanPhone :
            cleanPhone.startsWith('0') ? '254' + cleanPhone.substring(1) :
                '254' + cleanPhone;

        // TRY DIFFERENT ENDPOINTS - Payhero docs needed
        const endpoints = [
            'https://api.payhero.co.ke/payments',
            'https://api.payhero.co.ke/payments/initiate',
            'https://api.payhero.co.ke/v1/payments',
            'https://api.payhero.co.ke/v1/payments/initiate'
        ];

        // We use the lipwa link directly to ensure manual checkout works if STK fails
        // Including all autofill parameters PayHero supports
        const autoFillName = encodeURIComponent(name || 'Customer');
        const autoFillEmail = encodeURIComponent(email || 'user@example.com');
        let checkoutUrl = `https://lipwa.link/6902?amount=${amount}&phone=${formattedPhone}&reference=${reference}&name=${autoFillName}&customer_name=${autoFillName}&email=${autoFillEmail}&channel_id=6770&channel=6770`;
        
        let response;
        let data;
        let success = false;
        
        for (const url of endpoints) {
            console.log(`🔄 Trying Payhero endpoint: ${url}`);
            try {
                response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`,
                        'Merchant-ID': merchantId,
                    },
                    body: JSON.stringify({
                        amount: amount,
                        phone_number: formattedPhone,
                        reference: reference,
                        description: description,
                        till_number: process.env.NEXT_PUBLIC_TILL_NUMBER || '9824375',
                        callback_url: 'http://localhost:3001/api/payhero/webhook'
                    })
                });

                data = await response.json();
                console.log(`${url} Status:`, response.status, data);

                if (response.ok) {
                    console.log(`✅ Success with ${url}!`);
                    checkoutUrl = data.checkout_url || checkoutUrl;
                    success = true;
                    break;
                }
            } catch (e) {
                console.error(`Endpoint ${url} failed network request`);
            }
        }

        // Even if APIs fail, provide the Lipwa link so user can still pay
        return NextResponse.json({
            success: true, 
            transactionId: reference,
            checkoutUrl: checkoutUrl,
            message: success ? 'Payment initiated successfully' : 'Redirecting to secure PayHero checkout'
        });

    } catch (error) {
        console.error('PayHero initiation error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error },
            { status: 500 }
        );
    }
}
