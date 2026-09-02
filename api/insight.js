export default async function handler(req, res) {
  // Hanya ijinkan method POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { trendData, metadata } = req.body;
    
    // Akses environment variable menggunakan process.env
    const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || '';
    
    if (!MISTRAL_API_KEY) {
      return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured in environment variables' });
    }

    const MISTRAL_MODEL = 'mistral-small-latest';
    const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

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
    
    return res.status(200).json({ insight: text });
  } catch (error) {
    console.error('Error generating AI insight:', error);
    return res.status(500).json({ error: 'Failed to generate AI insight' });
  }
}
