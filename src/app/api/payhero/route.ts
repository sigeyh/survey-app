import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, phoneNumber, reference, description } = body;

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
                till_number: process.env.NEXT_PUBLIC_TILL_NUMBER || '9824375',
                callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/payhero/webhook`
            }
        });

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
                till_number: process.env.NEXT_PUBLIC_TILL_NUMBER || '9824375',
                callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/payhero/webhook`
            })
        });

        console.log('PayHero API Response Status:', response.status);

        const data = await response.json();
        console.log('PayHero API Response Data:', data);

        if (response.ok) {
            return NextResponse.json({
                success: true,
                transactionId: data.transaction_id,
                checkoutUrl: data.checkout_url,
                message: 'Payment initiated successfully'
            });
        } else {
            return NextResponse.json({
                success: false,
                message: data.error || 'Payment initiation failed',
                details: data,
                statusCode: response.status
            }, { status: response.status });
        }

    } catch (error) {
        console.error('PayHero initiation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}