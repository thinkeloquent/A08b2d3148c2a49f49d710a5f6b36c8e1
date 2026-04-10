import { request } from "undici";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

const schema = {
  type: "object",
  properties: {
    city: { type: "string" },
    tempF: { type: "number" },
    summary: { type: "string" },
  },
  required: ["city", "tempF", "summary"],
  additionalProperties: false,
};

const payload = {
  model: "gemini-3-flash-preview",
  messages: [
    { role: "system", content: "Return ONLY valid JSON matching the schema." },
    { role: "user", content: "Generate a sample weather report for Boston." },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "WeatherReport",
      schema,
      strict: true,
    },
  },
};

const { statusCode, body } = await request(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${GEMINI_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const text = await body.text();
if (statusCode >= 400) throw new Error(`${statusCode} ${text}`);

const data = JSON.parse(text);
const content = data.choices?.[0]?.message?.content;
const report = JSON.parse(content);

console.log(report);
