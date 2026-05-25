const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  try {
    const { query, products } = req.body;

    const aiResponse = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are Lailat, a luxury fashion AI stylist.

Convert fashion search queries into structured JSON filters.

Return ONLY valid JSON.

Format:
{
  "category": "",
  "colors": [],
  "styles": [],
  "items": []
}
          `
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" }
    });

    const filters = JSON.parse(
      aiResponse.choices[0].message.content
    );

    const results = products.filter((p) => {
      const matchCategory =
        !filters.category ||
        p.category === filters.category;

      const matchColor =
        !filters.colors.length ||
        filters.colors.some((c) =>
          p.colors?.includes(c)
        );

      const matchStyle =
        !filters.styles.length ||
        filters.styles.some((s) =>
          p.style_tags?.includes(s)
        );

      return (
        matchCategory &&
        matchColor &&
        matchStyle
      );
    });

    res.status(200).json({
      filters,
      results,
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
