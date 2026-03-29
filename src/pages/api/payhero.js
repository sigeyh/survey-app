import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { amount, phoneNumber, reference, description } = req.body;

        // Validate required fields
        if (!amount || !phoneNumber || !reference) {
            return res.status(400).json({
                error: 'Missing required fields: amount, phoneNumber, reference'
            });
        }

        // Get credentials from environment
        const apiKey = process.env.PAYHERO_API_KEY;
        const merchantId = process.env.PAYHERO_MERCHANT_ID;

        // Validate API credentials
        if (!apiKey || !merchantId) {
            return res.status(500).json({
                error: 'PayHero API credentials not configured'
            });
        }

        // Format phone number
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const formattedPhone = cleanPhone.startsWith('254') ? cleanPhone :
            cleanPhone.startsWith('0') ? '254' + cleanPhone.substring(1) :
                '254' + cleanPhone;

        // Initiate payment with PayHero
        const response = await fetch('https://api.payhero.co.ke/v1/payments/initiate', {
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

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({
                success: true,
                transactionId: data.transaction_id,
                checkoutUrl: data.checkout_url,
                message: 'Payment initiated successfully'
            });
        } else {
            return res.status(response.status).json({
                success: false,
                message: data.error || 'Payment initiation failed',
                details: data
            });
        }

    } catch (error) {
        console.error('PayHero initiation error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}