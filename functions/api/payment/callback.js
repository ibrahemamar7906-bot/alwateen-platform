/**
 * Cloudflare Pages Function
 * Route: /api/payment/callback (POST)
 * 
 * Paymob webhook — verifies HMAC and activates user subscription in Supabase.
 * Uses context.env for all secrets (injected by Cloudflare Pages environment variables).
 */

export async function onRequestPost(context) {
  try {
    const request = context.request
    const env = context.env

    const data = await request.json()
    const urlParams = new URL(request.url).searchParams
    const hmac = urlParams.get('hmac')

    const HMAC_SECRET = env.PAYMOB_HMAC_SECRET
    const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
    const SUPABASE_SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY

    if (!HMAC_SECRET) {
      console.error('[Paymob Webhook] Missing HMAC_SECRET')
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      })
    }

    const obj = data.obj
    if (!obj) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      })
    }

    // =============================================
    // HMAC VERIFICATION — Prevents spoofed webhooks
    // =============================================
    const concatenatedString = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order?.id ?? '',
      obj.owner,
      obj.pending,
      obj.source_data?.pan ?? '',
      obj.source_data?.sub_type ?? '',
      obj.source_data?.type ?? '',
      obj.success
    ].join('')

    // Use Web Crypto API (available in Cloudflare Workers/Edge)
    const encoder = new TextEncoder()
    const keyData = encoder.encode(HMAC_SECRET)
    const messageData = encoder.encode(concatenatedString)

    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData,
      { name: 'HMAC', hash: 'SHA-512' },
      false, ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const calculatedHmac = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (calculatedHmac !== hmac) {
      console.error('[Paymob Webhook] HMAC validation FAILED')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { 'Content-Type': 'application/json' }
      })
    }

    // =============================================
    // PAYMENT SUCCESS — Activate user subscription
    // =============================================
    if (obj.success === true && obj.pending === false) {
      const merchantOrderId = obj.order?.merchant_order_id || ''
      const extraData = obj.payment_key_claims?.extra || {}

      const userId = extraData.user_id || (merchantOrderId.startsWith('user_') ? merchantOrderId.split('_')[1] : null)
      const billingCycle = extraData.billing_cycle || 'monthly'
      const role = extraData.role || null

      if (!userId) {
        console.error('[Paymob Webhook] No user_id found', { merchantOrderId, extraData })
        return new Response(JSON.stringify({ received: true, warning: 'no_user_id' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Calculate subscription end date
      const now = new Date()
      const subscriptionEndDate = new Date(now)
      if (billingCycle === 'yearly') {
        subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1)
      } else {
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1)
      }

      // Update user profile via Supabase REST API (no SDK needed — works in Edge)
      const updateRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'approved',
            subscription_end_date: subscriptionEndDate.toISOString(),
            updated_at: now.toISOString()
          })
        }
      )

      if (!updateRes.ok) {
        const errText = await updateRes.text()
        console.error('[Paymob Webhook] Supabase update failed:', errText)
        return new Response(JSON.stringify({ received: true, warning: 'db_update_failed' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Insert payment record for audit trail (ignore error if table doesn't exist)
      await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId,
          paymob_order_id: obj.order?.id?.toString(),
          paymob_transaction_id: obj.id?.toString(),
          amount_cents: obj.amount_cents,
          currency: obj.currency,
          billing_cycle: billingCycle,
          role: role,
          payment_method: obj.source_data?.sub_type || obj.source_data?.type || 'unknown',
          status: 'success',
          subscription_end_date: subscriptionEndDate.toISOString(),
          created_at: now.toISOString()
        })
      }).catch(() => {}) // Silently ignore if payments table doesn't exist

      console.log(`[Paymob Webhook] ✅ User ${userId} activated until ${subscriptionEndDate.toISOString()}`)
    } else {
      console.log(`[Paymob Webhook] Payment not successful — success: ${obj.success}, pending: ${obj.pending}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('[Paymob Webhook] Unhandled error:', error)
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Also handle GET (for Paymob transaction redirect after payment — redirect to dashboard)
export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const success = url.searchParams.get('success')
  const redirectTo = success === 'true' ? '/student-dashboard' : '/pricing?payment=failed'
  return Response.redirect(new URL(redirectTo, url.origin).toString(), 302)
}
