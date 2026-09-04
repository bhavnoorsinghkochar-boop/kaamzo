import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import translations from '../translations.json';

// Find the translations object
const dicts = {
  hi: translations.hi.translation,
  pa: translations.pa.translation,
  ja: (translations as any).ja?.translation || {}
};

export const AutoTranslator: React.FC = () => {
  const { currentLanguage } = useApp();

  useEffect(() => {
    const isEn = currentLanguage === 'en';
    const dict = dicts[currentLanguage as 'hi' | 'pa' | 'ja'];
    
    // If we're not English and we don't have a dict, do nothing.
    if (!isEn && !dict) return;

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        let text = node.nodeValue?.trim();
        if (!text) return;

        const parent = node.parentElement;
        if (parent?.closest('[data-no-translate]')) return;

        if (isEn) {
          // Restore English
          if (parent?.hasAttribute('data-original-text')) {
             const orig = parent.getAttribute('data-original-text');
             if (orig && node.nodeValue?.includes(text)) {
               node.nodeValue = node.nodeValue.replace(text, orig);
               parent.removeAttribute('data-original-text');
             }
          }
        } else if (dict[text]) {
          // Translate to Target
          if (!parent?.hasAttribute('data-original-text')) {
             parent?.setAttribute('data-original-text', text);
          }
          node.nodeValue = node.nodeValue!.replace(text, dict[text]);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
        
        if (isEn) {
          if (el.hasAttribute('data-original-placeholder')) {
             const orig = el.getAttribute('data-original-placeholder');
             if (orig) el.setAttribute('placeholder', orig);
             el.removeAttribute('data-original-placeholder');
          }
        } else if (el.hasAttribute('placeholder')) {
          const ph = el.getAttribute('placeholder')?.trim();
          if (ph && dict[ph]) {
             if (!el.hasAttribute('data-original-placeholder')) {
               el.setAttribute('data-original-placeholder', ph);
             }
             el.setAttribute('placeholder', dict[ph]);
          }
        }
        
        node.childNodes.forEach(translateNode);
      }
    };

    // Initial translation pass
    translateNode(document.body);

    if (isEn) return; // Only observe when actively translating

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(translateNode);
        } else if (mutation.type === 'characterData') {
          // Careful not to infinite loop
          const text = mutation.target.nodeValue?.trim();
          if (text && dict[text]) {
            mutation.target.nodeValue = mutation.target.nodeValue!.replace(text, dict[text]);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => observer.disconnect();
  }, [currentLanguage]);

  return null;
};
