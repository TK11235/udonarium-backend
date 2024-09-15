export namespace UUID {
  export function randomV4(): string {
    return crypto.randomUUID();
  }
}
