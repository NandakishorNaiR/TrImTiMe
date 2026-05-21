// Mock payment verification for MVP
// Later replace with Razorpay/Cashfree verification/webhook

exports.verifyPayment = async(paymentId, amount) => {
    if (!paymentId || !amount || amount <= 0) return false;
    // For MVP, assume paymentId present + positive amount means valid
    return true;
};

// Mock refund processing for MVP
exports.processRefund = async({ paymentId, refundAmount }) => {
    // In MVP, if we have a paymentId we'll simulate gateway refund.
    // If paymentId is missing (e.g., COD or legacy), accept refund request as 'processed'
    if (!refundAmount || refundAmount <= 0) return false;

    if (!paymentId) {
        console.warn('processRefund called without paymentId — treating as processed (MVP)');
        return true;
    }

    // Simulate gateway refund success
    return true;
};