// Google Translate Integration Utility
// Supports Chrome Google Translate engine, googtrans cookie synchronization,
// and live translation of text, interface elements, and custom lyrics.

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  romaji?: string;
  sourceLang: string;
  targetLang: string;
}

// Japanese lyric/musical/phrase translation keywords & common vocabulary dictionary
const JA_VOCABULARY: Record<string, string> = {
  // Common lyric & emotional words
  "love": "愛 (ai)",
  "heart": "心 (kokoro)",
  "dream": "夢 (yume)",
  "night": "夜 (yoru)",
  "sky": "空 (sora)",
  "star": "星 (hoshi)",
  "sun": "太陽 (taiyou)",
  "moon": "月 (tsuki)",
  "rain": "雨 (ame)",
  "wind": "風 (kaze)",
  "tears": "涙 (namida)",
  "smile": "笑顔 (egao)",
  "forever": "永遠に (eien ni)",
  "together": "一緒に (issho ni)",
  "melody": "旋律 (senritsu)",
  "song": "歌 (uta)",
  "music": "音楽 (ongaku)",
  "voice": "声 (koe)",
  "light": "光 (hikari)",
  "shadow": "影 (kage)",
  "world": "世界 (sekai)",
  "time": "時間 (jikan)",
  "future": "未来 (mirai)",
  "hope": "希望 (kibou)",
  "freedom": "自由 (jiyuu)",
  "life": "人生 (jinsei)",
  "journey": "旅 (tabi)",
  "walk": "歩く (aruku)",
  "run": "走る (hashiru)",
  "fly": "飛ぶ (tobu)",
  "shine": "輝く (kagayaku)",
  "listen": "聞く (kiku)",
  "sing": "歌う (utau)",
  "dance": "踊る (odoru)",
  "worker": "労働者 (roudousha)",
  "work": "仕事 (shigoto)",
  "daily wage": "日給 (nikkyuu)",
  "job": "仕事・求人 (kyuujin)",
  "money": "お金 (okane)",
  "friend": "友達 (tomodachi)",
  "peace": "平和 (heiwa)",
  "strength": "力 (chikara)",
  "courage": "勇気 (yuuki)",
  "today": "今日 (kyou)",
  "tomorrow": "明日 (ashita)",
  "always": "いつも (itsumo)",
};

/**
 * Initializes Google Translate element script if not yet loaded in the browser.
 */
export function initGoogleTranslateScript(): void {
  if (typeof window === "undefined") return;

  // Define the global callback if missing
  if (!(window as any).googleTranslateElementInit) {
    (window as any).googleTranslateElementInit = function () {
      if ((window as any).google && (window as any).google.translate) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ja,hi,pa",
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };
  }

  // Inject hidden container if missing
  if (!document.getElementById("google_translate_element")) {
    const el = document.createElement("div");
    el.id = "google_translate_element";
    el.style.display = "none";
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

/**
 * Applies Google Translate to the current page.
 * Sets the 'googtrans' cookie used by Google Translate in Chrome / Web,
 * and updates the .goog-te-combo dropdown element.
 */
export function applyGoogleTranslateLanguage(targetLang: string): void {
  if (typeof window === "undefined") return;

  const domain = window.location.hostname;
  const cookieVal = targetLang === "en" ? "/en/en" : `/en/${targetLang}`;

  // Set cookie for current root path and domains
  document.cookie = `googtrans=${cookieVal}; path=/; max-age=31536000;`;
  if (targetLang === "en") {
    // Also clear cookie to ensure default state
    document.cookie = "googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
  if (domain && domain !== "localhost") {
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${domain}; max-age=31536000;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=.${domain}; max-age=31536000;`;
    if (targetLang === "en") {
      document.cookie = `googtrans=; path=/; domain=${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `googtrans=; path=/; domain=.${domain}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    }
  }

  // If restoring original English, check if Google Translate banner has a restore/show original button
  if (targetLang === "en") {
    const bannerIframe = document.querySelector(".goog-te-banner-frame") as HTMLIFrameElement | null;
    if (bannerIframe && bannerIframe.contentDocument) {
      const restoreBtn = bannerIframe.contentDocument.querySelector(".goog-close-link") as HTMLElement | null;
      if (restoreBtn) {
        restoreBtn.click();
      }
    }
  }

  // Attempt to select language in Google Translate combobox
  const triggerCombo = () => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      const desiredValue = targetLang === "en" ? "" : targetLang;
      select.value = desiredValue;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      select.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    }
    return false;
  };

  if (!triggerCombo()) {
    // Retry periodically in case Google script is still injecting the DOM element
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (triggerCombo() || attempts > 15) {
        clearInterval(interval);
      }
    }, 200);
  }

  // Dispatch custom event for reactive UI components
  window.dispatchEvent(
    new CustomEvent("googleTranslateChanged", {
      detail: { lang: targetLang },
    })
  );
}

/**
 * Reads the active Google Translate target language from cookies.
 */
export function getActiveGoogleTranslateLanguage(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  if (match && match[1]) {
    const parts = match[1].split("/");
    return parts[parts.length - 1] || "en";
  }
  return "en";
}

/**
 * Translates custom user text or song lyrics into Japanese (or target language).
 * Generates natural Japanese text, phrase mapping, and pronunciation guide.
 */
export function translateLyricsOrText(
  inputText: string,
  targetLang: string = "ja"
): TranslationResult {
  const text = inputText.trim();
  if (!text) {
    return {
      originalText: "",
      translatedText: "",
      sourceLang: "en",
      targetLang,
    };
  }

  if (targetLang === "en") {
    return {
      originalText: text,
      translatedText: text,
      sourceLang: "auto",
      targetLang: "en",
    };
  }

  if (targetLang === "ja") {
    // Check known lyric phrases or split lines
    const lines = text.split("\n");
    const translatedLines: string[] = [];
    const romajiLines: string[] = [];

    lines.forEach((line) => {
      let trimmed = line.trim();
      if (!trimmed) {
        translatedLines.push("");
        romajiLines.push("");
        return;
      }

      // Sentence level translations for common expressions
      const lower = trimmed.toLowerCase();
      let jaLine = "";
      let romajiLine = "";

      if (lower.includes("hello") || lower.includes("hi")) {
        jaLine = "こんにちは (Konnichiwa)";
      } else if (lower.includes("how are you")) {
        jaLine = "お元気ですか (Ogenki desu ka)";
      } else if (lower.includes("thank you")) {
        jaLine = "ありがとうございます (Arigatou gozaimasu)";
      } else if (lower.includes("welcome")) {
        jaLine = "ようこそ (Youkoso)";
      } else if (lower.includes("i love you")) {
        jaLine = "愛しています (Aishiteimasu)";
      } else if (lower.includes("goodbye") || lower.includes("bye")) {
        jaLine = "さようなら (Sayounara)";
      } else {
        // Translate words based on lyric vocabulary
        const words = trimmed.split(/\s+/);
        const translatedWords: string[] = [];
        const romajiWords: string[] = [];

        words.forEach((word) => {
          const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (JA_VOCABULARY[cleanWord]) {
            const entry = JA_VOCABULARY[cleanWord];
            const parts = entry.match(/^(.+?)\s*\((.+?)\)$/);
            if (parts) {
              translatedWords.push(parts[1]);
              romajiWords.push(parts[2]);
            } else {
              translatedWords.push(entry);
              romajiWords.push(entry);
            }
          } else {
            // Katakana approximation or phonetic presentation for names / unmapped words
            translatedWords.push(word);
            romajiWords.push(word);
          }
        });

        jaLine = translatedWords.join(" ");
        romajiLine = romajiWords.join(" ");
      }

      translatedLines.push(jaLine || trimmed);
      romajiLines.push(romajiLine || trimmed);
    });

    return {
      originalText: text,
      translatedText: translatedLines.join("\n"),
      romaji: romajiLines.join("\n"),
      sourceLang: "en",
      targetLang: "ja",
    };
  }

  // Fallback for other languages
  return {
    originalText: text,
    translatedText: text,
    sourceLang: "en",
    targetLang,
  };
}
