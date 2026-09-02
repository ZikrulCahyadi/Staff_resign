import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (parent of server/)
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
const MISTRAL_MODEL = 'mistral-small-latest';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

app.post('/api/insight', async (req, res) => {
  try {
    const { trendData, metadata } = req.body;
    
    if (!MISTRAL_API_KEY) {
      return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured in .env' });
    }

    const prompt = `
Anda adalah analis data HR. Berikan insight berdasarkan data turnover berikut dalam format JSON.

DATA TURNOVER:
${JSON.stringify(trendData, null, 2)}

Tugas Anda:
Kembalikan HANYA objek JSON dengan struktur persis seperti ini:
{
  "summary": "1-2 kalimat kesimpulan singkat yang MENGANALISIS POLA FLUKTUASI aktual pada data (misal: naik turunnya pada bulan apa saja). Jangan hanya menyebut 'meningkat terus' jika datanya berfluktuasi tajam."
}
Pastikan hanya mengembalikan JSON Valid.
`;

    const response = await fetch(MISTRAL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: [
          { role: 'system', content: 'Anda adalah analis data HR.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Mistral API error:', response.status, errorBody);
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Tidak ada insight yang dihasilkan.';
    
    res.json({ insight: text });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    res.status(500).json({ error: 'Failed to generate AI insight' });
  }
});

const start = async () => {
  try {
    await app.listen(port);
    console.log(`Server running on port ${port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();
