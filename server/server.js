import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/insight', async (req, res) => {
  try {
    const { trendData, metadata } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in .env' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Anda adalah seorang analis data HR (Human Resources) profesional.
Berikan analisis mendalam (insight) berdasarkan data agregat turnover (resignation) berikut.

DATA TURNOVER BULANAN:
${JSON.stringify(trendData, null, 2)}

METADATA (Analisis Trend Linear):
- Arah Trend Involuntary (IT): ${metadata.itSlope > 0 ? 'Meningkat' : metadata.itSlope < 0 ? 'Menurun' : 'Stabil'} (Slope: ${metadata.itSlope.toFixed(2)})
- Arah Trend Voluntary (VT): ${metadata.vtSlope > 0 ? 'Meningkat' : metadata.vtSlope < 0 ? 'Menurun' : 'Stabil'} (Slope: ${metadata.vtSlope.toFixed(2)})
- Region Filter: ${metadata.region}

PERHATIAN: 
- Tahun 2025 adalah data setahun penuh (Jan-Des).
- Tahun 2026 HANYA menggunakan data sampai Juli 2026. Jangan menyimpulkan bahwa 2026 lebih rendah totalnya secara absolut tanpa menyadari periode yang lebih singkat ini.

Berikan analisis dalam bahasa Indonesia yang profesional dan mudah dipahami yang mencakup:
1. Apakah Involuntary (IT) meningkat atau menurun?
2. Apakah Voluntary (VT) meningkat atau menurun?
3. Mana yang lebih dominan antara IT dan VT?
4. Perbandingan performa 2025 vs 2026.
5. Temuan penting berdasarkan data (sebutkan bulan dengan angka resign tinggi atau pola yang menarik).

Jangan membuat kesimpulan di luar data yang diberikan. Jangan menggunakan format markdown yang berlebihan. Gunakan paragraf yang rapi dan mudah dibaca (boleh menggunakan bullet points jika perlu).
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.json({ insight: text });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    res.status(500).json({ error: 'Failed to generate AI insight' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
