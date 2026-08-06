'use client';

import { useState } from 'react';
import sharedStyles from '@/styles/shared-tool-styles.module.css';

const FIRST_NAMES = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Sam', 'Chris', 'Casey', 'Riley', 'Avery', 'Dakota'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'iqverse.net', 'techcorp.io'];
const CITIES = ['San Francisco', 'New York', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Paris'];
const ROLES = ['Admin', 'Developer', 'Designer', 'Product Owner', 'QA Engineer', 'Analyst'];

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function FakeDataGenerator() {
  const [activeTab, setActiveTab] = useState<'lorem' | 'json'>('lorem');

  // Lorem states
  const [loremType, setLoremType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [count, setCount] = useState(3);
  const [loremOutput, setLoremOutput] = useState('');

  // JSON Mock states
  const [schemaType, setSchemaType] = useState<'users' | 'products' | 'transactions'>('users');
  const [batchSize, setBatchSize] = useState(5);
  const [jsonOutput, setJsonOutput] = useState('');

  const [copied, setCopied] = useState(false);

  const generateLorem = () => {
    let result = '';
    if (loremType === 'words') {
      const wordsArr = [];
      for (let i = 0; i < count; i++) {
        wordsArr.push(getRandomItem(LOREM_WORDS));
      }
      result = wordsArr.join(' ');
    } else if (loremType === 'sentences') {
      const sentencesArr = [];
      for (let i = 0; i < count; i++) {
        const sentenceLen = getRandomInt(8, 15);
        const words = [];
        for (let j = 0; j < sentenceLen; j++) {
          words.push(getRandomItem(LOREM_WORDS));
        }
        const s = words.join(' ');
        sentencesArr.push(s.charAt(0).toUpperCase() + s.slice(1) + '.');
      }
      result = sentencesArr.join(' ');
    } else {
      const paragraphsArr = [];
      for (let i = 0; i < count; i++) {
        const numSentences = getRandomInt(4, 7);
        const sentences = [];
        for (let s = 0; s < numSentences; s++) {
          const sentenceLen = getRandomInt(8, 15);
          const words = [];
          for (let j = 0; j < sentenceLen; j++) {
            words.push(getRandomItem(LOREM_WORDS));
          }
          const str = words.join(' ');
          sentences.push(str.charAt(0).toUpperCase() + str.slice(1) + '.');
        }
        paragraphsArr.push(sentences.join(' '));
      }
      result = paragraphsArr.join('\n\n');
    }
    setLoremOutput(result);
  };

  const generateJsonMock = () => {
    const items = [];
    for (let i = 1; i <= batchSize; i++) {
      if (schemaType === 'users') {
        const firstName = getRandomItem(FIRST_NAMES);
        const lastName = getRandomItem(LAST_NAMES);
        items.push({
          id: `usr_${Math.random().toString(36).substr(2, 9)}`,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(DOMAINS)}`,
          city: getRandomItem(CITIES),
          role: getRandomItem(ROLES),
          active: Math.random() > 0.2,
          createdAt: new Date(Date.now() - getRandomInt(0, 10000000000)).toISOString(),
        });
      } else if (schemaType === 'products') {
        items.push({
          id: `prd_${Math.random().toString(36).substr(2, 9)}`,
          name: `Tech Widget ${getRandomInt(100, 999)}`,
          sku: `SKU-${getRandomInt(1000, 9999)}`,
          price: (getRandomInt(10, 500) + 0.99).toFixed(2),
          stock: getRandomInt(0, 250),
          category: getRandomItem(['Electronics', 'Developer Tools', 'Office', 'Software']),
          inStock: Math.random() > 0.15,
        });
      } else {
        items.push({
          transactionId: `tx_${Math.random().toString(36).substr(2, 10)}`,
          amount: (getRandomInt(5, 1200) + 0.50).toFixed(2),
          currency: 'USD',
          status: getRandomItem(['COMPLETED', 'PENDING', 'PROCESSING', 'REFUNDED']),
          customerEmail: `${getRandomItem(FIRST_NAMES).toLowerCase()}@${getRandomItem(DOMAINS)}`,
          timestamp: new Date(Date.now() - getRandomInt(0, 500000000)).toISOString(),
        });
      }
    }
    setJsonOutput(JSON.stringify(items, null, 2));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <section className={sharedStyles.section}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            type="button"
            className={`${sharedStyles.button} ${activeTab === 'lorem' ? sharedStyles.buttonPrimary : ''}`}
            onClick={() => setActiveTab('lorem')}
          >
            Lorem Ipsum Text
          </button>
          <button
            type="button"
            className={`${sharedStyles.button} ${activeTab === 'json' ? sharedStyles.buttonPrimary : ''}`}
            onClick={() => setActiveTab('json')}
          >
            JSON Mock Data Batch
          </button>
        </div>

        {activeTab === 'lorem' ? (
          <div className={sharedStyles.card}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
                <label htmlFor="loremType">Unit:</label>
                <select
                  id="loremType"
                  value={loremType}
                  onChange={(e) => setLoremType(e.target.value as any)}
                  style={{ marginLeft: 8 }}
                >
                  <option value="paragraphs">Paragraphs</option>
                  <option value="sentences">Sentences</option>
                  <option value="words">Words</option>
                </select>
              </div>

              <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
                <label htmlFor="loremCount">Count:</label>
                <input
                  id="loremCount"
                  type="number"
                  min={1}
                  max={100}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className={sharedStyles.input}
                  style={{ width: 80, marginLeft: 8 }}
                />
              </div>

              <button
                type="button"
                className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
                onClick={generateLorem}
              >
                Generate Text
              </button>
            </div>

            {loremOutput && (
              <div className={sharedStyles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className={sharedStyles.fieldLabel} htmlFor="loremOutArea">
                    Generated Lorem Ipsum Text
                  </label>
                  <button type="button" className={sharedStyles.button} onClick={() => handleCopy(loremOutput)}>
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
                <textarea
                  id="loremOutArea"
                  readOnly
                  value={loremOutput}
                  className={sharedStyles.outputArea}
                  rows={10}
                />
              </div>
            )}
          </div>
        ) : (
          <div className={sharedStyles.card}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
              <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
                <label htmlFor="schemaType">Schema:</label>
                <select
                  id="schemaType"
                  value={schemaType}
                  onChange={(e) => setSchemaType(e.target.value as any)}
                  style={{ marginLeft: 8 }}
                >
                  <option value="users">Users Array</option>
                  <option value="products">Products Inventory</option>
                  <option value="transactions">Financial Transactions</option>
                </select>
              </div>

              <div className={sharedStyles.buttonGroup} style={{ margin: 0 }}>
                <label htmlFor="batchSize">Batch Size:</label>
                <input
                  id="batchSize"
                  type="number"
                  min={1}
                  max={50}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className={sharedStyles.input}
                  style={{ width: 80, marginLeft: 8 }}
                />
              </div>

              <button
                type="button"
                className={`${sharedStyles.button} ${sharedStyles.buttonPrimary}`}
                onClick={generateJsonMock}
              >
                Generate JSON Batch
              </button>
            </div>

            {jsonOutput && (
              <div className={sharedStyles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className={sharedStyles.fieldLabel} htmlFor="jsonOutArea">
                    Generated Mock JSON
                  </label>
                  <button type="button" className={sharedStyles.button} onClick={() => handleCopy(jsonOutput)}>
                    {copied ? 'Copied!' : 'Copy JSON'}
                  </button>
                </div>
                <textarea
                  id="jsonOutArea"
                  readOnly
                  value={jsonOutput}
                  className={sharedStyles.outputArea}
                  rows={12}
                />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
