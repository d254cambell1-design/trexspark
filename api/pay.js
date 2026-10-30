export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amount, phone, provider } = req.body;

  // Clean the phone number
  let cleanPhone = phone.replace(/\D/g, ''); 
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '254' + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith('254')) {
    cleanPhone = '254' + cleanPhone;
  }
  const finalPhone = '+' + cleanPhone;

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
          phone: finalPhone,
          provider: 'mpesa'
        }
      }),
    });

    const data = await response.json();

    // FIX: If Paystack says "Charge attempted", it means the prompt was sent successfully!
    if (data.message === 'Charge attempted') {
      return res.status(200).json({ 
        success: true, 
        message: 'Prompt sent. Please check your phone.',
        reference: data.data.reference
      });
    }

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
