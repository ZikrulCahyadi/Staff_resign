export const getAIInsight = async (trendData, metadata) => {
  try {
    const response = await fetch('/api/insight', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trendData, metadata }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.insight;
  } catch (error) {
    console.error('Failed to get AI Insight:', error);
    throw error;
  }
};
