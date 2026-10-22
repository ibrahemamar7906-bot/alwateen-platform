// Cloudflare Pages Function - Agora RTC Token Generator
// Path: /api/agora/token?channelName=xxx&uid=yyy

// ============ CRC32 ============
const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(str) {
  const bytes = new TextEncoder().encode(str);
  let crc = 0xFFFFFFFF;
  for (const b of bytes) {
    crc = CRC32_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ============ Little-Endian Pack ============
function packUint16(val) {
  return new Uint8Array([val & 0xFF, (val >> 8) & 0xFF]);
}

function packUint32(val) {
  return new Uint8Array([
    val & 0xFF,
    (val >> 8) & 0xFF,
    (val >> 16) & 0xFF,
    (val >>> 24) & 0xFF
  ]);
}

function packBytes(bytes) {
  const len = packUint16(bytes.length);
  const result = new Uint8Array(2 + bytes.length);
  result.set(len, 0);
  result.set(bytes, 2);
  return result;
}

function packMapUint32(map) {
  const entries = Object.entries(map);
  const parts = [packUint16(entries.length)];
  for (const [key, value] of entries) {
    parts.push(packUint16(parseInt(key)));
    parts.push(packUint32(value));
  }
  return concatArrays(parts);
}

function concatArrays(arrays) {
  const total = arrays.reduce((acc, a) => acc + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

// ============ HMAC-SHA256 using Web Crypto ============
async function hmacSHA256(keyString, data) {
  const keyBytes = new TextEncoder().encode(keyString);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return new Uint8Array(sig);
}

// ============ Base64 Encode ============
function uint8ToBase64(uint8Array) {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

// ============ Build Agora AccessToken (v006) ============
async function buildToken(appId, appCertificate, channelName, uid) {
  const VERSION = '006';
  const now = Math.floor(Date.now() / 1000);
  const expireTimestamp = now + 86400; // 24 hours
  const salt = Math.floor(Math.random() * 0xFFFFFFFF);

  // Privileges:
  // 1 = kJoinChannel
  // 2 = kPublishAudioStream
  // 3 = kPublishVideoStream
  // 4 = kPublishDataStream
  const privileges = {
    1: expireTimestamp,
    2: expireTimestamp,
    3: expireTimestamp,
    4: expireTimestamp,
  };

  // Build message: salt + ts + privileges
  const msg = concatArrays([
    packUint32(salt),
    packUint32(expireTimestamp),
    packMapUint32(privileges)
  ]);

  // Data to sign: appId + channelName + uid + msg
  const uidStr = String(uid);
  const toSign = concatArrays([
    new TextEncoder().encode(appId),
    new TextEncoder().encode(channelName),
    new TextEncoder().encode(uidStr),
    msg
  ]);

  const signature = await hmacSHA256(appCertificate, toSign);

  // Pack content: signature + crcChannel + crcUid + msgLen + msg
  const content = concatArrays([
    packBytes(signature),
    packUint32(crc32(channelName)),
    packUint32(crc32(uidStr)),
    packUint16(msg.length),
    msg
  ]);

  return VERSION + appId + uint8ToBase64(content);
}

// ============ Request Handler ============
export async function onRequest(context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store'
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  const url = new URL(context.request.url);
  const channelName = url.searchParams.get('channelName');
  const uid = url.searchParams.get('uid') || '0';

  if (!channelName) {
    return new Response(
      JSON.stringify({ error: 'channelName is required' }),
      { status: 400, headers }
    );
  }

  const appId = context.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = context.env.AGORA_APP_CERTIFICATE;

  if (!appId || !appCertificate) {
    return new Response(
      JSON.stringify({ error: 'Missing NEXT_PUBLIC_AGORA_APP_ID or AGORA_APP_CERTIFICATE in environment variables' }),
      { status: 500, headers }
    );
  }

  try {
    const token = await buildToken(appId, appCertificate, channelName, uid);
    return new Response(JSON.stringify({ token }), { headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Token generation failed: ' + err.message }),
      { status: 500, headers }
    );
  }
}
