// Video caching utility using IndexedDB for offline playback

const DB_NAME = 'BridgeHerVideos';
const STORE_NAME = 'videos';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'url' });
      }
    };
  });
}

export async function cacheVideoForOffline(videoUrl: string): Promise<boolean> {
  try {
    console.log('Downloading video:', videoUrl);
    
    // Fetch video as blob
    const response = await fetch(videoUrl);
    if (!response.ok) {
      console.error('Failed to fetch video:', response.status);
      return false;
    }
    
    const blob = await response.blob();
    console.log('Video downloaded, size:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
    
    // Store in IndexedDB
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ url: videoUrl, blob: blob, timestamp: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    console.log('Video cached successfully');
    return true;
  } catch (error) {
    console.error('Failed to cache video:', error);
    return false;
  }
}

export async function isVideoCached(videoUrl: string): Promise<boolean> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const cached = await new Promise<boolean>((resolve) => {
      const request = store.get(videoUrl);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => resolve(false);
    });
    
    db.close();
    return cached;
  } catch (error) {
    return false;
  }
}

export async function getCachedVideo(videoUrl: string): Promise<string | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const result = await new Promise<{ url: string; blob: Blob } | null>((resolve) => {
      const request = store.get(videoUrl);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
    
    db.close();
    
    if (result && result.blob) {
      return URL.createObjectURL(result.blob);
    }
    return null;
  } catch (error) {
    console.error('Failed to get cached video:', error);
    return null;
  }
}

export async function clearVideoCache(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    db.close();
    console.log('Video cache cleared');
  } catch (error) {
    console.error('Failed to clear video cache:', error);
  }
}

export async function getVideoCacheSize(): Promise<number> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  } catch (error) {
    return 0;
  }
}

export async function getAllCachedVideos(): Promise<string[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const urls = await new Promise<string[]>((resolve) => {
      const request = store.getAllKeys();
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => resolve([]);
    });
    
    db.close();
    return urls;
  } catch (error) {
    return [];
  }
}
