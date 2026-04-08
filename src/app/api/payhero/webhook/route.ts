import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🪝 PayHero Webhook:', body);

    const { reference, status, transaction_id } = body;

    if (reference && status === 'completed') {
      // Update payment in Firebase
      const { paymentTracker } = await import('@/lib/paymentTracker');
      await paymentTracker.completePayment(reference, transaction_id);
      
      console.log('✅ Payment completed via webhook:', reference);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
