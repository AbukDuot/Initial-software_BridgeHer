export type SWResponse =
  | { type: "DOWNLOAD_PROGRESS"; courseId: string | number; progress: number }
  | { type: "DOWNLOAD_COMPLETE"; courseId: string | number; success: boolean; message?: string }
  | Record<string, unknown>;

const messages: Record<"en" | "ar", Record<string, string>> = {
  en: {
    registering: "[sw] registering service worker",
    registered: "[sw] registered:",
    registrationFailed: "[sw] registration failed:",
    localhostNotice: "[sw] running on localhost - registering service worker for testing",
    newContent: "[sw] new content is available; please refresh.",
    cached: "[sw] content cached for offline use.",
    unregistered: "[sw] unregistered all service workers",
    unsupported: "ServiceWorker not supported",
    notActive: "ServiceWorker not active",
    responseTimeout: "ServiceWorker response timed out",
    downloadProgress: "[sw] download progress for",
    downloadComplete: "[sw] download complete for",
    downloadRequestTimedOut: "Download request timed out",
  },
  ar: {
    registering: "[sw] جاري تسجيل عامل الخدمة",
    registered: "[sw] تم التسجيل:",
    registrationFailed: "[sw] فشل تسجيل عامل الخدمة:",
    localhostNotice: "[sw] يعمل على localhost - تسجيل عامل الخدمة للاختبار",
    newContent: "[sw] تحديث جديد متاح؛ يرجى تحديث الصفحة.",
    cached: "[sw] تم حفظ المحتوى للاستخدام دون اتصال.",
    unregistered: "[sw] تم إلغاء تسجيل جميع عمال الخدمة",
    unsupported: "عامل الخدمة غير مدعوم",
    notActive: "عامل الخدمة غير نشط",
    responseTimeout: "انتهت مهلة استجابة عامل الخدمة",
    downloadProgress: "[sw] تقدم التنزيل لـ",
    downloadComplete: "[sw] اكتمال التنزيل لـ",
    downloadRequestTimedOut: "انتهت مهلة طلب التنزيل",
  },
};

let lang: "en" | "ar" = "en";
export function setLanguage(l: "en" | "ar") {
  lang = l;
}
function t(key: string) {
  return messages[lang][key] ?? key;
}

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    !!window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/)
);

let registrationGlobal: ServiceWorkerRegistration | null = null;

export function register(options?: {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
}) {
  if (!("serviceWorker" in navigator)) return;

  const _globalWithProcess = globalThis as unknown as { process?: { env?: { PUBLIC_URL?: string } } };
  const publicUrl = (_globalWithProcess.process?.env?.PUBLIC_URL ?? "") as string;
  const swUrl = `${publicUrl}/sw.js`;

  window.addEventListener("load", () => {
    if (isLocalhost) {
      console.info(t("localhostNotice"));
    }

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        registrationGlobal = registration;
        console.info(t("registered"), registration);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.info(t("newContent"));
                options?.onUpdate?.(registration);
              } else {
                console.info(t("cached"));
                options?.onSuccess?.(registration);
              }
            }
          };
        };
      })
      .catch((err) => {
        console.error(t("registrationFailed"), err);
      });
  });
}

export async function unregister() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  for (const r of regs) {
    await r.unregister();
  }
  registrationGlobal = null;
  console.info(t("unregistered"));
}

export function sendMessageToSW(message: Record<string, unknown>, timeoutMs = 30000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!("serviceWorker" in navigator)) return reject(new Error(t("unsupported")));
    if (!navigator.serviceWorker.controller && !registrationGlobal?.active) {
      return reject(new Error(t("notActive")));
    }

    const messageChannel = new MessageChannel();
    const timer = setTimeout(() => {
      reject(new Error(t("responseTimeout")));
    }, timeoutMs);

    messageChannel.port1.onmessage = (event: MessageEvent) => {
      clearTimeout(timer);
      resolve(event.data);
    };

    const target = navigator.serviceWorker.controller ?? registrationGlobal?.active;
    try {
      (target as ServiceWorker).postMessage(message, [messageChannel.port2]);
    } catch (err) {
      clearTimeout(timer);
      reject(err);
    }
  });
}

export function downloadCourseForOffline(courseId: string | number): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        if (!("serviceWorker" in navigator)) return reject(new Error(t("unsupported")));

        if (!navigator.serviceWorker.controller) {
          await new Promise((res) => setTimeout(res, 500));
        }

        const isDownloadProgress = (d: unknown): d is { type: "DOWNLOAD_PROGRESS"; courseId: string | number; progress: number } => {
          if (typeof d !== "object" || d === null) return false;
          const obj = d as Record<string, unknown>;
          return obj.type === "DOWNLOAD_PROGRESS" && (typeof obj.courseId === "string" || typeof obj.courseId === "number") && typeof obj.progress === "number";
        };

        const isDownloadComplete = (d: unknown): d is { type: "DOWNLOAD_COMPLETE"; courseId: string | number; success: boolean; message?: string } => {
          if (typeof d !== "object" || d === null) return false;
          const obj = d as Record<string, unknown>;
          return obj.type === "DOWNLOAD_COMPLETE" && (typeof obj.courseId === "string" || typeof obj.courseId === "number") && typeof obj.success === "boolean";
        };

        const onMessage = (event: MessageEvent) => {
          const data = event.data;
          if (!data || typeof data !== "object") return;
          if (isDownloadProgress(data) && data.courseId === courseId) {
            console.info(`${t("downloadProgress")} ${courseId}:`, data.progress);
          } else if (isDownloadComplete(data) && data.courseId === courseId) {
            window.removeEventListener("message", onMessage);
            console.info(t("downloadComplete"), courseId);
            resolve({ success: !!data.success, message: data.message });
          }
        };

        window.addEventListener("message", onMessage);

        const swMessage = {
          type: "DOWNLOAD_COURSE",
          courseId,
          url: `/api/courses/${courseId}/download`,
        };

        try {
          await sendMessageToSW({ type: "DOWNLOAD_COURSE_ACK", courseId }, 5000).catch(() => null);
          const target = navigator.serviceWorker.controller ?? registrationGlobal?.active;
          (target as ServiceWorker).postMessage(swMessage);
        } catch (err) {
          console.warn(err);
          const target = navigator.serviceWorker.controller ?? registrationGlobal?.active;
          try {
            (target as ServiceWorker).postMessage(swMessage);
          } catch (e) {
            window.removeEventListener("message", onMessage);
            reject(e);
          }
        }

        const safety = setTimeout(() => {
          window.removeEventListener("message", onMessage);
          reject(new Error(t("downloadRequestTimedOut")));
        }, 1200 * 1000);

        const origResolve = resolve;
        // override resolve to clear safety timer when called
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (resolve as any) = (value: any) => {
          clearTimeout(safety);
          try {
            origResolve(value);
          } catch (e) {
            void e;
          }
          return Promise.resolve(value);
        };
      } catch (err) {
        reject(err);
      }
    })();
  });
}

export default {
  register,
  unregister,
  sendMessageToSW,
  downloadCourseForOffline,
  setLanguage,
};
