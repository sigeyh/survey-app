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
        const apiKey = process.env.PAYHERO_API_KEY || process.env.PAYHERO_API_KEY;
        const merchantId = process.env.PAYHERO_MERCHANT_ID || process.env.NEXT_PUBLIC_PAYHERO_MERCHANT_ID;
        const tillNumber = process.env.PAYHERO_TILL_NUMBER || "9824375";
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const callbackUrl = `${baseUrl}/api/payhero/webhook`;

        // Validate API credentials
        if (!apiKey || !merchantId) {
            return NextResponse.json(
                { error: 'PayHero API credentials not configured' },
                { status: 500 }
            );
        }

        // Format phone number
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('254') ? cleanPhone :
            cleanPhone.startsWith('0') ? '254' + cleanPhone.substring(1) :
                '254' + cleanPhone;

        const autoFillName = encodeURIComponent(name || 'Customer');
        const autoFillEmail = encodeURIComponent(email || 'user@example.com');
        
        // Fallback checkout URL (Direct Lipwa link if API fails)
        // Defaulting to channel 6770 as requested
        let checkoutUrl = `https://lipwa.link/${merchantId}?amount=${amount}&phone=${formattedPhone}&reference=${reference}&name=${autoFillName}&customer_name=${autoFillName}&email=${autoFillEmail}&channel_id=6770&channel=6770`;

        // Log the request for debugging
        console.log('PayHero API Request:', {
            url: 'https://api.payhero.co.ke/v1/payments',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey ? '***' : 'MISSING'}`,
                'Merchant-ID': merchantId
            },
            body: {
                amount: amount,
                phone_number: formattedPhone,
                reference: reference,
                description: description,
                till_number: tillNumber,
                callback_url: callbackUrl
            }
        });

        let success = false;
        try {
            // Initiate payment with PayHero
            const response = await fetch('https://api.payhero.co.ke/v1/payments', {
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
                    till_number: tillNumber,
                    callback_url: callbackUrl
                })
            });

            console.log('PayHero API Response Status:', response.status);

            const data = await response.json();
            console.log('PayHero API Response Data:', data);

            if (response.ok) {
                checkoutUrl = data.checkout_url || checkoutUrl;
                success = true;
            }
        } catch (fetchError) {
            console.error('PayHero Fetch to API failed, using Lipwa link fallback');
        }

        return NextResponse.json({
            success: true,
            transactionId: reference,
            checkoutUrl: checkoutUrl,
            message: success ? 'Payment initiated successfully' : 'Redirecting to secure PayHero checkout'
        });

    } catch (error) {
        console.error('PayHero initiation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
