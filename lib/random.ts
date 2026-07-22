export function randBytes(size: number): Uint8Array {
  const buffer = new Uint8Array(size);
  crypto.getRandomValues(buffer);
  return buffer;
}

export function randInt(max: number): number {
  const bytes = randBytes(4);
  const view = new DataView(bytes.buffer);
  return view.getUint32(0, true) % max;
}

export function pickRandom<T>(items: T[]): T {
  return items[randInt(items.length)];
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
