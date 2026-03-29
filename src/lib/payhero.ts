// PayHero API Integration
// This service handles PayHero payment processing for your M-Pesa till

interface PayHeroConfig {
    apiKey: string;
    merchantId: string;
    tillNumber: string;
    webhookUrl?: string;
}

interface PaymentRequest {
    amount: number;
    phoneNumber: string;
    reference: string;
    description: string;
}

interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    message?: string;
    checkoutUrl?: string;
}

class PayHeroService {
    private config: PayHeroConfig;
    private baseUrl = 'https://api.payhero.co.ke/v1';

    constructor(config: PayHeroConfig) {
        this.config = config;
    }

    // Initialize payment with PayHero
    async initiatePayment(payment: PaymentRequest): Promise<PaymentResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/payments/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Merchant-ID': this.config.merchantId,
                },
                body: JSON.stringify({
                    amount: payment.amount,
                    phone_number: payment.phoneNumber,
                    reference: payment.reference,
                    description: payment.description,
                    till_number: this.config.tillNumber,
                    callback_url: this.config.webhookUrl || `${window.location.origin}/api/payhero/webhook`
                })
            });

            const data = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    transactionId: data.transaction_id,
                    checkoutUrl: data.checkout_url
                };
            } else {
                return {
                    success: false,
                    message: data.error || 'Payment initiation failed'
                };
            }
        } catch (error) {
            console.error('PayHero payment initiation error:', error);
            return {
                success: false,
                message: 'Network error occurred'
            };
        }
    }

    // Verify payment status
    async verifyPayment(transactionId: string): Promise<PaymentResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/payments/verify/${transactionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Merchant-ID': this.config.merchantId,
                }
            });

            const data = await response.json();

            return {
                success: data.status === 'completed',
                transactionId: data.transaction_id,
                message: data.status_message
            };
        } catch (error) {
            console.error('PayHero verification error:', error);
            return {
                success: false,
                message: 'Verification failed'
            };
        }
    }

    // Get payment status by reference
    async getPaymentStatus(reference: string): Promise<PaymentResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/payments/status/${reference}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Merchant-ID': this.config.merchantId,
                }
            });

            const data = await response.json();

            return {
                success: data.status === 'completed',
                transactionId: data.transaction_id,
                message: data.status_message
            };
        } catch (error) {
            console.error('PayHero status check error:', error);
            return {
                success: false,
                message: 'Status check failed'
            };
        }
    }
}

// Export default PayHero instance with your configuration
export const payHero = new PayHeroService({
    apiKey: process.env.NEXT_PUBLIC_PAYHERO_API_KEY || '',
    merchantId: process.env.NEXT_PUBLIC_PAYHERO_MERCHANT_ID || '',
    tillNumber: '9824375', // Your existing till number
    webhookUrl: process.env.NEXT_PUBLIC_PAYHERO_WEBHOOK_URL
});

// Utility function to format phone number for M-Pesa
export function formatPhoneNumber(phone: string): string {
    // Remove spaces and special characters
    let cleanNumber = phone.replace(/\D/g, '');

    // Handle different formats
    if (cleanNumber.startsWith('254')) {
        return cleanNumber;
    } else if (cleanNumber.startsWith('0')) {
        return '254' + cleanNumber.substring(1);
    } else if (cleanNumber.length === 9 && cleanNumber.startsWith('7')) {
        return '254' + cleanNumber;
    }

    return cleanNumber;
}

// Payment status types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';