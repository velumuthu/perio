'use client';

const DB_NAME = 'PerioLocalDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export interface LocalImage {
  id: string;
  name: string;
  blob: Blob;
  type: string;
  timestamp: number;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBOpenDBRequest).error);
      reject('Could not open database');
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
  });
};

export const saveImageLocally = async (file: File): Promise<string> => {
  const db = await openDB();
  const id = `${Date.now()}-${file.name}`;
  const localImage: LocalImage = {
    id,
    name: file.name,
    blob: file,
    type: file.type,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(localImage);

    request.onsuccess = () => resolve(id);
    request.onerror = () => reject('Failed to save image');
  });
};

export const getAllLocalImages = async (): Promise<LocalImage[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Failed to fetch images');
  });
};

export const deleteLocalImage = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Failed to delete image');
  });
};
