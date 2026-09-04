// Google Translate Integration Utility
// Supports Chrome Google Translate engine, googtrans cookie synchronization,
// and automatic translation for English (en), Hindi (hi), and Punjabi (pa).

export type SupportedTranslateLanguage = "en" | "hi" | "pa";

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
}

// Global reference holder for queued target language
declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
    __applyGoogleTranslate?: (lang: string) => void;
    __targetGoogleTranslateLang?: string;
  }
}

/**
 * Initializes Google Translate element script if not yet loaded in the browser.
 * Configured strictly for English, Hindi, and Punjabi (en, hi, pa).
 */
export function initGoogleTranslateScript(): void {
  if (typeof window === "undefined") return;

  // Define the global callback if missing
  if (!window.googleTranslateElementInit) {
    window.googleTranslateElementInit = function () {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,pa",
            autoDisplay: false,
          },
          "google_translate_element"
        );

        // Auto-apply current or saved language as soon as widget loads
        const target =
          window.__targetGoogleTranslateLang ||
          localStorage.getItem("kaamzo_language") ||
          "en";
        if (target && target !== "en") {
          applyGoogleTranslateLanguage(target);
        }
      }
    };
  }

  // Inject hidden container if missing
  if (!document.getElementById("google_translate_element")) {
    const el = document.createElement("div");
    el.id = "google_translate_element";
    el.style.position = "absolute";
    el.style.top = "-9999px";
    el.style.left = "-9999px";
    el.style.width = "1px";
    el.style.height = "1px";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
  }

  // Inject script tag if not yet present
  const existingScript = document.getElementById("google-translate-script");
  if (!existingScript) {
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.type = "text/javascript";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

let activeObserver: MutationObserver | null = null;
let activeInterval: any = null;

/**
 * Applies Google Translate to the current page.
 * Sets the 'googtrans' cookie used by Google Translate,
 * and updates the .goog-te-combo dropdown element automatically.
 */
export function applyGoogleTranslateLanguage(targetLang: string): void {
  if (typeof window === "undefined") return;

  // Enforce supported languages: only en, hi, pa
  const validLang = targetLang === "hi" || targetLang === "pa" ? targetLang : "en";
  window.__targetGoogleTranslateLang = validLang;

  const domain = window.location.hostname;
  const cookieVal = validLang === "en" ? "/en/en" : `/en/${validLang}`;

  // Helper to set cookie
  const setCookie = (cookieStr: string) => {
    try {
      document.cookie = cookieStr;
    } catch (_) {}
  };

  // 1. Clear previous or conflicting cookies
  const expireDate = "expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  setCookie(`googtrans=; path=/; ${expireDate}`);
  if (domain && domain !== "localhost") {
    setCookie(`googtrans=; path=/; domain=${domain}; ${expireDate}`);
    setCookie(`googtrans=; path=/; domain=.${domain}; ${expireDate}`);
    if (domain.includes(".")) {
      const parts = domain.split(".");
      if (parts.length >= 2) {
        const rootDomain = parts.slice(-2).join(".");
        setCookie(`googtrans=; path=/; domain=.${rootDomain}; ${expireDate}`);
      }
    }
  }

  // 2. Set active cookie
  const maxAge = "max-age=31536000; SameSite=Lax;";
  setCookie(`googtrans=${cookieVal}; path=/; ${maxAge}`);
  if (domain && domain !== "localhost") {
    setCookie(`googtrans=${cookieVal}; path=/; domain=${domain}; ${maxAge}`);
    setCookie(`googtrans=${cookieVal}; path=/; domain=.${domain}; ${maxAge}`);
  }

  // Update HTML document language attribute for Chrome and browsers
  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.lang = validLang;
  }

  // 3. If restoring original English, click restore if Google Translate banner exists
  if (validLang === "en") {
    const bannerIframe = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement | null;
    if (bannerIframe && bannerIframe.contentDocument) {
      const restoreBtn = bannerIframe.contentDocument.querySelector(".goog-close-link") as HTMLElement | null;
      if (restoreBtn) {
        restoreBtn.click();
      }
    }
  }

  // 4. Trigger the Google Translate dropdown (.goog-te-combo)
  const triggerCombo = (): boolean => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      const desiredValue = validLang === "en" ? "" : validLang;
      select.value = desiredValue;

      // Dispatch multiple events for cross-browser & Chrome compatibility
      select.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
      select.dispatchEvent(new Event("input", { bubbles: true }));

      try {
        const evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", true, true);
        select.dispatchEvent(evt);
      } catch (_) {}

      if (typeof (select as any).onchange === "function") {
        (select as any).onchange();
      }
      return true;
    }
    return false;
  };

  // Clear previous timers or observers
  if (activeInterval) {
    clearInterval(activeInterval);
    activeInterval = null;
  }
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }

  const success = triggerCombo();

  // If combo not ready yet (script still loading), poll & observe DOM until it appears
  if (!success) {
    let attempts = 0;
    activeInterval = setInterval(() => {
      attempts++;
      if (triggerCombo() || attempts > 35) {
        clearInterval(activeInterval);
        activeInterval = null;
        if (activeObserver) {
          activeObserver.disconnect();
          activeObserver = null;
        }
      }
    }, 150);

    // Also observe for element injection
    if (typeof MutationObserver !== "undefined") {
      activeObserver = new MutationObserver(() => {
        if (triggerCombo()) {
          if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
          }
          activeObserver?.disconnect();
          activeObserver = null;
        }
      });
      activeObserver.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Dispatch custom event for app reactive listeners
  window.dispatchEvent(
    new CustomEvent("googleTranslateChanged", {
      detail: { lang: validLang },
    })
  );
}

// Expose globally so index.html inline script can trigger it
if (typeof window !== "undefined") {
  window.__applyGoogleTranslate = applyGoogleTranslateLanguage;
}

/**
 * Reads the active Google Translate target language from cookies.
 */
export function getActiveGoogleTranslateLanguage(): SupportedTranslateLanguage {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const parts = match[1].split("/");
    const lang = parts[parts.length - 1];
    if (lang === "hi" || lang === "pa") return lang;
  }
  return "en";
}
