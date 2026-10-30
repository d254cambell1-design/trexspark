export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amount, phone, provider } = req.body;

  // 1. Clean the phone number to just digits
  let cleanPhone = phone.replace(/\D/g, ''); 
  
  // 2. Ensure it starts with 254
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('254')) {
    cleanPhone = '254' + cleanPhone;
  }

  // 3. CRITICAL FIX: Add the '+' sign back for Paystack M-Pesa
  const finalPhone = '+' + cleanPhone;

  // 4. Paystack requires the amount in cents (lowest denomination)
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
          phone: finalPhone, // This will be +254XXXXXXXXX
          provider: 'mpesa'
        }
      }),
    });

    const data = await response.json();

    if (!data.status) {
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
