export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amount, phone, provider } = req.body;

  // 1. Aggressively clean the phone number
  let cleanPhone = phone.replace(/\D/g, ''); // Remove ALL non-numbers (removes +, spaces, etc)
  
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith('254')) {
    // It is already correct
  } else {
    // If they typed 7..., add 254
    cleanPhone = '254' + cleanPhone;
  }

  // 2. Paystack requires the amount to be a whole number in the lowest denomination (cents)
  const amountInCents = Math.round(Number(amount) * 100);

  try {
    const response = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amountInCents, 
        currency: 'KES',
        mobile_money: {
          phone: cleanPhone,
          provider: 'mpesa' // Force M-Pesa for this test
        }
      }),
    });

    const data = await response.json();

    if (!data.status) {
      // If Paystack gives an error, send exactly what they said back to the website
      throw new Error(data.message || 'Payment failed');
    }

    res.status(200).json({ 
      success: true, 
      reference: data.data.reference
    });

  } catch (error) {
    console.error("Paystack Error:", error.message);
    res.status(500).json({ error: error.message });
  }
}
