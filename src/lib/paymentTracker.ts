import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface PaymentRecord {
    id: string;
    userId: string;
    plan: string;
    amount: number;
    phoneNumber: string;
    reference: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    createdAt: number;
    completedAt?: number;
    transactionId?: string;
}

export class PaymentTracker {
    // Create a new payment record
    async createPayment(userId: string, plan: string, amount: number, phoneNumber: string): Promise<string> {
        const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const paymentId = reference;

        const paymentData: PaymentRecord = {
            id: paymentId,
            userId,
            plan,
            amount,
            phoneNumber,
            reference,
            status: 'pending',
            createdAt: Date.now()
        };

        await setDoc(doc(db, 'payments', paymentId), paymentData);
        return reference;
    }

    // Get payment by reference
    async getPaymentByReference(reference: string): Promise<PaymentRecord | null> {
        const paymentRef = doc(db, 'payments', reference);
        const paymentSnap = await getDoc(paymentRef);

        if (paymentSnap.exists()) {
            return paymentSnap.data() as PaymentRecord;
        }
        return null;
    }

    // Update payment status
    async updatePaymentStatus(reference: string, status: PaymentRecord['status'], transactionId?: string): Promise<void> {
        const paymentRef = doc(db, 'payments', reference);
        const updateData: any = {
            status,
            completedAt: status === 'completed' ? Date.now() : undefined,
            transactionId
        };

        await updateDoc(paymentRef, updateData);
    }

    // Complete payment and update user plan
    async completePayment(reference: string, transactionId: string): Promise<void> {
        const payment = await this.getPaymentByReference(reference);

        if (!payment) {
            throw new Error('Payment not found');
        }

        // Update payment status
        await this.updatePaymentStatus(reference, 'completed', transactionId);

        // Update user's plan
        const userRef = doc(db, 'users', payment.userId);
        await updateDoc(userRef, {
            activePlan: payment.plan,
            totalCredits: payment.amount // Add payment amount as credits
        });
    }

    // Get user payments
    async getUserPayments(userId: string): Promise<PaymentRecord[]> {
        // This would require implementing a query to get all payments for a user
        // For now, returning empty array - you'd need to implement this based on your Firestore structure
        return [];
    }
}

export const paymentTracker = new PaymentTracker();