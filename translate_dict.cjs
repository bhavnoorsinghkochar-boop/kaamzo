const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const code = fs.readFileSync('src/utils/translations.ts', 'utf-8');
  
  // Extract the English object
  const enMatch = code.match(/en: \{([\s\S]*?)\},\n  hi: \{/);
  if (!enMatch) {
    console.log("Could not find EN dict");
    return;
  }
  
  const enCode = enMatch[1];
  console.log("Got EN Code, sending to Gemini...");
  
  const prompt = `
Translate the following TypeScript object into Hindi and Punjabi.
Output ONLY a valid JSON object with "hi" and "pa" keys, containing the exact same keys as the input.
Input:
{
${enCode}
}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
        responseMimeType: 'application/json',
    }
  });
  
  const res = JSON.parse(response.text);
  
  // Reconstruct the file
  let newCode = `import { Language } from "../types";\n\nexport const translations = {\n  en: {\n${enCode}\n  },\n`;
  newCode += `  hi: ${JSON.stringify(res.hi, null, 4)},\n`;
  newCode += `  pa: ${JSON.stringify(res.pa, null, 4)}\n};\n\n`;
  newCode += `export const getT = (
  lang: Language,
  key: keyof (typeof translations)["en"],
): string => {
  return (translations[lang] as any)?.[key] || (translations["en"] as any)[key] || key;
};
`;

  fs.writeFileSync('src/utils/translations.ts', newCode);
  console.log("Translated translations.ts successfully.");
}

run().catch(console.error);
