const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  const strings = JSON.parse(fs.readFileSync('extracted_strings.json', 'utf-8'));
  console.log(`Translating ${strings.length} strings...`);
  
  const chunkSize = 150;
  const result = {};
  
  for (let i = 0; i < strings.length; i += chunkSize) {
    const chunk = strings.slice(i, i + chunkSize);
    console.log(`Processing chunk ${i/chunkSize + 1}...`);
    
    const prompt = `
Translate the following array of English strings into Hindi and Punjabi.
Output ONLY a valid JSON object where keys are the exact English strings, and values are objects with "hi" and "pa" keys.
Do not wrap in markdown blocks, just output the raw JSON.
Input:
${JSON.stringify(chunk)}
`;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
      });
      
      const chunkRes = JSON.parse(response.text);
      Object.assign(result, chunkRes);
    } catch (e) {
      console.error("Chunk failed", e);
    }
  }
  
  fs.writeFileSync('src/utils/fullTranslations.json', JSON.stringify(result, null, 2));
  console.log("Done generating fullTranslations.json");
}

run().catch(console.error);
