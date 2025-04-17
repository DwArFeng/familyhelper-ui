// noinspection JSUnusedGlobalSymbols

/**
 * 生成 UUID v4 字符串。
 *
 * @returns UUID v4 字符串。
 */
export function uuid(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crypto = window.crypto || (window as any).msCrypto // for IE 11
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)

  // Set the version to 4 (UUIDv4)
  array[6] = (array[6] & 0x0f) | 0x40
  // Set the variant to RFC 4122
  array[8] = (array[8] & 0x3f) | 0x80

  const hexArray = Array.from(array, (byte) => byte.toString(16).padStart(2, '0'))
  return `${hexArray.slice(0, 4).join('')}-${hexArray.slice(4, 6).join('')}-${hexArray.slice(6, 8).join('')}-${hexArray.slice(8, 10).join('')}-${hexArray.slice(10, 16).join('')}`
}
