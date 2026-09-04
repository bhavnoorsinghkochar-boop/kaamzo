const translate = require('@vitalets/google-translate-api').translate;
const fs = require('fs');

async function run() {
  const strings = JSON.parse(fs.readFileSync('final_strings.json', 'utf-8'));
  const translations = {
    en: { translation: {} },
    hi: { translation: {} },
    pa: { translation: {} }
  };
  
  // Fill English
  strings.forEach(str => {
    translations.en.translation[str] = str;
  });
  
  console.log(`Translating ${strings.length} strings...`);
  
  const DELIMITER = ' ||| ';
  
  async function translateBatch(lang) {
      let currentBatch = [];
      let currentLength = 0;
      let translatedArray = [];
      
      for (let i = 0; i < strings.length; i++) {
          const str = strings[i];
          if (currentLength + str.length > 4000) {
              // translate batch
              const joined = currentBatch.join(DELIMITER);
              try {
                  const res = await translate(joined, { to: lang });
                  const splitted = res.text.split(DELIMITER).map(s => s.trim());
                  translatedArray.push(...splitted);
              } catch(e) {
                  console.error("Translation failed", e);
                  // fallback
                  translatedArray.push(...currentBatch);
              }
              currentBatch = [];
              currentLength = 0;
          }
          currentBatch.push(str);
          currentLength += str.length + DELIMITER.length;
      }
      
      if (currentBatch.length > 0) {
          const joined = currentBatch.join(DELIMITER);
          try {
              const res = await translate(joined, { to: lang });
              const splitted = res.text.split(DELIMITER).map(s => s.trim());
              translatedArray.push(...splitted);
          } catch(e) {
              console.error("Translation failed", e);
              translatedArray.push(...currentBatch);
          }
      }
      
      return translatedArray;
  }
  
  console.log("Translating to Hindi...");
  const hiArray = await translateBatch('hi');
  console.log("Translating to Punjabi...");
  const paArray = await translateBatch('pa');
  
  for (let i = 0; i < strings.length; i++) {
      translations.hi.translation[strings[i]] = hiArray[i] || strings[i];
      translations.pa.translation[strings[i]] = paArray[i] || strings[i];
  }
  
  fs.writeFileSync('src/translations.json', JSON.stringify(translations, null, 2));
  console.log("Generated src/translations.json successfully.");
}

run().catch(console.error);
