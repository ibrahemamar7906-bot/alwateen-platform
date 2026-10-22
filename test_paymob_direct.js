const API_KEY = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2libUZ0WlNJNkltbHVhWFJwWVd3aUxDSndjbTltYVd4bFgzQnJJam8zTXpJeU1UaDkuQXhwVFNIYXFJbno1UHpLUmFROGNLTHFxUl9oRERwc1FpSG10N0ptazVQRFZxSGV5QjhSU1c2NlpWVXRpa2pXeXFxT1dWSkdUU2EwdmFsTkh3YWk3cFE=";
const INTEGRATION_ID_WALLETS = "5806671";

async function testPaymob() {
  try {
    console.log("Step 1: Auth");
    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: API_KEY })
    });
    const authData = await authRes.json();
    console.log("Auth Response:", authData);
    if (!authData.token) return console.log("Failed Auth");
    const authToken = authData.token;

    console.log("Step 2: Order");
    const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: 'false',
        amount_cents: 6000,
        currency: 'EGP',
        items: []
      })
    });
    const orderData = await orderRes.json();
    console.log("Order Response:", orderData);
    if (!orderData.id) return console.log("Failed Order");
    const orderId = orderData.id;

    console.log("Step 3: Payment Key");
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: 6000,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA", email: "student@alwateen.com", floor: "NA", first_name: "Student", 
          street: "NA", building: "NA", phone_number: "+201000000000", shipping_method: "NA", 
          postal_code: "NA", city: "NA", country: "NA", last_name: "Ammar", state: "NA"
        },
        currency: "EGP",
        integration_id: INTEGRATION_ID_WALLETS
      })
    });
    const paymentKeyData = await paymentKeyRes.json();
    console.log("Payment Key Response:", paymentKeyData);
    
    if (!paymentKeyData.token) return console.log("Failed Payment Key");
    const paymentToken = paymentKeyData.token;

    console.log("Step 4: Pay");
    const payRes = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: { identifier: "01010101010", subtype: "WALLET" },
        payment_token: paymentToken
      })
    });
    const payData = await payRes.json();
    console.log("Pay Response:", payData);

  } catch (err) {
    console.error("Exception:", err);
  }
}
testPaymob();
