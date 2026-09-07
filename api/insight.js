export default async function handler(req, res) {
  // Hanya ijinkan method POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { trendData, metadata } = req.body;
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in environment variables' });
    }

    const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

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

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Anda adalah analis data HR. " + prompt }]
        }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API error:', response.status, errorBody);
      if (response.status === 429) {
        return res.status(429).json({ error: 'Limit permintaan AI tercapai (Terlalu banyak request). Silakan tunggu beberapa saat lagi.' });
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{"summary": "Tidak ada insight yang dihasilkan."}';
    
    const cleanedText = text.replace(/```json\n/g, '').replace(/```/g, '').trim();
    
    return res.status(200).json({ insight: cleanedText });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate AI insight' });
  }
}
