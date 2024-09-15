export namespace CryptoUtil {
  const textEncoder = new TextEncoder();

  export async function hmacSHA256(message: ArrayBuffer | string, secret: ArrayBuffer | string): Promise<ArrayBuffer> {
    const messageData = typeof message === 'string' ? textEncoder.encode(message) : message;
    const keyData = typeof secret === 'string' ? textEncoder.encode(secret) : secret;

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'HMAC',
        hash: { name: 'SHA-256' }
      },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return signature;
  }
}
