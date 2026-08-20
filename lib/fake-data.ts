export const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Chris', 'Casey', 'Riley', 'Avery', 'Dakota'];
export const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
export const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'iqverse.net', 'techcorp.io'];
export const CITIES = ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Paris'];
export const ROLES = ['Admin', 'Developer', 'Designer', 'Product Owner', 'QA Engineer', 'Analyst'];

export const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
];

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateLorem(type: 'paragraphs' | 'sentences' | 'words' = 'paragraphs', count: number = 3): string {
  const safeCount = Math.max(1, count);

  if (type === 'words') {
    const wordsArr: string[] = [];
    for (let i = 0; i < safeCount; i++) wordsArr.push(getRandomItem(LOREM_WORDS));
    return wordsArr.join(' ');
  }

  if (type === 'sentences') {
    const sentencesArr: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      const len = getRandomInt(8, 15);
      const words: string[] = [];
      for (let j = 0; j < len; j++) words.push(getRandomItem(LOREM_WORDS));
      const s = words.join(' ');
      sentencesArr.push(s.charAt(0).toUpperCase() + s.slice(1) + '.');
    }
    return sentencesArr.join(' ');
  }

  const paragraphsArr: string[] = [];
  for (let i = 0; i < safeCount; i++) {
    const numSentences = getRandomInt(4, 7);
    const sentences: string[] = [];
    for (let s = 0; s < numSentences; s++) {
      const len = getRandomInt(8, 15);
      const words: string[] = [];
      for (let j = 0; j < len; j++) words.push(getRandomItem(LOREM_WORDS));
      const str = words.join(' ');
      sentences.push(str.charAt(0).toUpperCase() + str.slice(1) + '.');
    }
    paragraphsArr.push(sentences.join(' '));
  }
  return paragraphsArr.join('\n\n');
}

export function generateMockDataset(
  type: 'users' | 'products' | 'transactions' = 'users',
  count: number = 5
): unknown[] {
  const safeCount = Math.max(1, Math.min(count, 50));
  const items: unknown[] = [];

  for (let i = 1; i <= safeCount; i++) {
    if (type === 'users') {
      const firstName = getRandomItem(FIRST_NAMES);
      const lastName = getRandomItem(LAST_NAMES);
      items.push({
        id: `usr_${Math.random().toString(36).slice(2, 11)}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(DOMAINS)}`,
        city: getRandomItem(CITIES),
        role: getRandomItem(ROLES),
        active: Math.random() > 0.2,
        createdAt: new Date(Date.now() - getRandomInt(0, 10000000000)).toISOString(),
      });
    } else if (type === 'products') {
      const prodName = `Tech Widget ${getRandomInt(100, 999)}`;
      items.push({
        id: `prd_${Math.random().toString(36).slice(2, 11)}`,
        name: prodName,
        title: prodName,
        sku: `SKU-${getRandomInt(1000, 9999)}`,
        price: (getRandomInt(10, 500) + 0.99).toFixed(2),
        stock: getRandomInt(0, 250),
        category: getRandomItem(['Electronics', 'Developer Tools', 'Office', 'Software']),
        inStock: Math.random() > 0.15,
      });
    } else {
      items.push({
        transactionId: `tx_${Math.random().toString(36).slice(2, 12)}`,
        amount: (getRandomInt(5, 1200) + 0.5).toFixed(2),
        currency: 'USD',
        status: getRandomItem(['COMPLETED', 'PENDING', 'PROCESSING', 'REFUNDED']),
        customerEmail: `${getRandomItem(FIRST_NAMES).toLowerCase()}@${getRandomItem(DOMAINS)}`,
        timestamp: new Date(Date.now() - getRandomInt(0, 500000000)).toISOString(),
      });
    }
  }

  return items;
}
