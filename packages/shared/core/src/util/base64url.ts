export namespace Base64Url {
  const textEncoder = new TextEncoder();

  const encodePattern = /\+|\/|=/g;
  const encodeMap = {
    '+': '-',
    '/': '_',
    '=': '',
  };

  const decodePattern = /-|_/g;
  const decodeMap = {
    '-': '+',
    '_': '/',
  };

  export function encode(buffer: ArrayBuffer): string
  export function encode(str: string): string
  export function encode(arg: any): string {
    const uint8Array = typeof arg === 'string' ? textEncoder.encode(arg) : new Uint8Array(arg);
    const binaryString = String.fromCharCode(...uint8Array);
    const baset64Url = btoa(binaryString).replace(encodePattern, encodeReplacer);
    return baset64Url;
  }

  export function decode(base64Url: string): ArrayBuffer {
    const padding = [...Array(base64Url.length % 4)].map(() => '=').join('');
    const data = atob(base64Url.replace(decodePattern, decodeReplacer) + padding);
    let arr = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) { arr[i] = data.charCodeAt(i); }
    return arr.buffer;
  }

  function encodeReplacer(char: string): string {
    return (encodeMap as any)[char];
  }

  function decodeReplacer(entity: string): string {
    return (decodeMap as any)[entity];
  }
}
