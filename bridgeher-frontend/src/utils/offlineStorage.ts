const DB_NAME = 'BridgeHerOffline';
const DB_VERSION = 1;
const COURSES_STORE = 'courses';
const VIDEOS_STORE = 'videos';
const PDFS_STORE = 'pdfs';

let db: IDBDatabase | null = null;

interface Module {
  id: number;
  title: string;
  description: string;
  content: string;
  order_index: number;
  duration: number;
  video_url?: string;
  pdf_url?: string;
}

interface OfflineCourse {
  id: number;
  modules: Module[];
  downloadedAt: string;
}

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(COURSES_STORE)) {
        database.createObjectStore(COURSES_STORE, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(VIDEOS_STORE)) {
        database.createObjectStore(VIDEOS_STORE, { keyPath: 'moduleId' });
      }

      if (!database.objectStoreNames.contains(PDFS_STORE)) {
        database.createObjectStore(PDFS_STORE, { keyPath: 'moduleId' });
      }
    };
  });
};

export const downloadCourseOffline = async (courseId: number, modules: Module[]) => {
  const database = await initDB();
  

  const courseTransaction = database.transaction([COURSES_STORE], 'readwrite');
  const courseStore = courseTransaction.objectStore(COURSES_STORE);
  
  await courseStore.put({
    id: courseId,
    modules: modules.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      content: m.content,
      order_index: m.order_index,
      duration: m.duration
    })),
    downloadedAt: new Date().toISOString()
  });

  // Download videos and PDFs
  for (const module of modules) {
    try {
      // Download video
      if (module.video_url) {
        const videoResponse = await fetch(module.video_url);
        const videoBlob = await videoResponse.blob();
        
        const videoTransaction = database.transaction([VIDEOS_STORE], 'readwrite');
        const videoStore = videoTransaction.objectStore(VIDEOS_STORE);
        await videoStore.put({
          moduleId: module.id,
          blob: videoBlob,
          url: module.video_url
        });
      }

      // Download PDF
      if (module.pdf_url) {
        const pdfResponse = await fetch(module.pdf_url);
        const pdfBlob = await pdfResponse.blob();
        
        const pdfTransaction = database.transaction([PDFS_STORE], 'readwrite');
        const pdfStore = pdfTransaction.objectStore(PDFS_STORE);
        await pdfStore.put({
          moduleId: module.id,
          blob: pdfBlob,
          url: module.pdf_url
        });
      }
    } catch (error) {
      console.error(`Failed to download module ${module.id}:`, error);
    }
  }

  return true;
};

export const getOfflineCourse = async (courseId: number) => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([COURSES_STORE], 'readonly');
    const store = transaction.objectStore(COURSES_STORE);
    const request = store.get(courseId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const getOfflineVideo = async (moduleId: number): Promise<string | null> => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([VIDEOS_STORE], 'readonly');
    const store = transaction.objectStore(VIDEOS_STORE);
    const request = store.get(moduleId);

    request.onsuccess = () => {
      if (request.result && request.result.blob) {
        const url = URL.createObjectURL(request.result.blob);
        resolve(url);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const getOfflinePDF = async (moduleId: number): Promise<string | null> => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([PDFS_STORE], 'readonly');
    const store = transaction.objectStore(PDFS_STORE);
    const request = store.get(moduleId);

    request.onsuccess = () => {
      if (request.result && request.result.blob) {
        const url = URL.createObjectURL(request.result.blob);
        resolve(url);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const isCourseDownloaded = async (courseId: number): Promise<boolean> => {
  const database = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([COURSES_STORE], 'readonly');
    const store = transaction.objectStore(COURSES_STORE);
    const request = store.get(courseId);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteOfflineCourse = async (courseId: number) => {
  const database = await initDB();
  
  // Get course modules first
  const course = await getOfflineCourse(courseId) as OfflineCourse | undefined;
  
  if (course && course.modules) {
    // Delete videos and PDFs
    for (const module of course.modules) {
      const videoTransaction = database.transaction([VIDEOS_STORE], 'readwrite');
      const videoStore = videoTransaction.objectStore(VIDEOS_STORE);
      await videoStore.delete(module.id);

      const pdfTransaction = database.transaction([PDFS_STORE], 'readwrite');
      const pdfStore = pdfTransaction.objectStore(PDFS_STORE);
      await pdfStore.delete(module.id);
    }
  }

  // Delete course
  const courseTransaction = database.transaction([COURSES_STORE], 'readwrite');
  const courseStore = courseTransaction.objectStore(COURSES_STORE);
  await courseStore.delete(courseId);
};

export const getStorageUsage = async (): Promise<{ used: number; quota: number }> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    return {
      used: estimate.usage || 0,
      quota: estimate.quota || 0
    };
  }
  return { used: 0, quota: 0 };
};
