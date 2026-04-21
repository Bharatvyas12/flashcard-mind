require('fs');
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: "AIzaSyCGLbW2BMy_pm0l1ItusXAgZHifdw5Pzp8" });
ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Hello' })
  .then(console.log)
  .catch(e => { console.error('ERROR'); console.error(e); });
