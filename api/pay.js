export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, amount, phone, provider } = req.body;

  try {
    const response = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        amount: amount * 100, // Convert to lowest denomination (cents)
        currency: 'KES', 
        mobile_money: {
          phone: phone,
          provider: provider // 'mpesa' or 'airtel'
        }
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Payment failed to initialize');
    }

    res.status(200).json({ 
      success: true, 
      reference: data.data.reference,
      status: data.data.status
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
