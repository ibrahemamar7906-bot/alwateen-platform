export async function onRequestPost(context) {
  try {
    const request = context.request;
    const body = await request.json();
    const { planId, role, billingCycle, method, walletNumber } = body;

    // Use environment variables from Cloudflare Pages (or fallback to user's test keys)
    const API_KEY = context.env.PAYMOB_API_KEY || "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2libUZ0WlNJNkltbHVhWFJwWVd3aUxDSndjbTltYVd4bFgzQnJJam8zTXpJeU1UaDkuQXhwVFNIYXFJbno1UHpLUmFROGNLTHFxUl9oRERwc1FpSG10N0ptazVQRFZxSGV5QjhSU1c2NlpWVXRpa2pXeXFxT1dWSkdUU2EwdmFsTkh3YWk3cFE=";
    const INTEGRATION_ID_WALLETS = context.env.PAYMOB_INTEGRATION_ID_WALLETS || "5806671";
    const INTEGRATION_ID_CARDS = context.env.PAYMOB_INTEGRATION_ID_CARDS || "5806670";
    const IFRAME_ID = context.env.PAYMOB_IFRAME_ID || "123456";

    const integrationId = method === 'card' ? INTEGRATION_ID_CARDS : INTEGRATION_ID_WALLETS;

    let amount = 0;
    if (role === 'teacher') {
      amount = billingCycle === 'monthly' ? 50 : 500;
    } else if (role === 'student') {
      amount = billingCycle === 'monthly' ? 60 : 600;
    }

    if (amount === 0) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400 });

    const amountInCents = amount * 100;

    // Step 1: Authentication
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: API_KEY })
    });
    const authData = await authRes.json();
    const authToken = authData.token;

    if (!authToken) throw new Error('Authentication failed');

    // Step 2: Order Registration
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: 'false',
        amount_cents: amountInCents,
        currency: 'EGP',
        items: []
      })
    });
    const orderData = await orderRes.json();
    const orderId = orderData.id;

    if (!orderId) throw new Error('Order creation failed');

    // Step 3: Payment Key Generation
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountInCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA", email: "student@alwateen.com", floor: "NA", first_name: "Student", 
          street: "NA", building: "NA", phone_number: "+201000000000", shipping_method: "NA", 
          postal_code: "NA", city: "NA", country: "NA", last_name: "Ammar", state: "NA"
        },
        currency: "EGP",
        integration_id: integrationId
      })
    });
    const paymentKeyData = await paymentKeyRes.json();
    const paymentToken = paymentKeyData.token;

    if (!paymentToken) throw new Error('Payment token failed');

    let redirectUrl = "";

    if (method === 'card') {
      // For Cards, redirect to Paymob iframe directly
      redirectUrl = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;
    } else {
      // Step 4: Pay Request for Wallets
      const payRes = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: { identifier: walletNumber || "01010101010", subtype: "WALLET" },
          payment_token: paymentToken
        })
      });
      const payData = await payRes.json();
      redirectUrl = payData.redirection_url || payData.redirect_url || payData.iframe_redirection_url;
      
      if (!redirectUrl) {
        console.error("Paymob response error:", payData);
        throw new Error('Failed to get redirection URL from Paymob for wallet');
      }
    }

    return new Response(JSON.stringify({ 
      success: true, orderId: orderId, paymentUrl: redirectUrl 
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
