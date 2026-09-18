const MYMEMORY_API_URL =
  "https://api.mymemory.translated.net/get";

const MAX_BYTES = 450;

// Keep chunks comfortably below MyMemory's 500-byte limit.
const getByteLength = (text) =>
  Buffer.byteLength(text, "utf8");

const splitIntoChunks = (text, maxBytes = MAX_BYTES) => {
  const words = text.split(/\s+/);
  const chunks = [];
  let currentChunk = "";

  for (const word of words) {
    const candidate = currentChunk
      ? `${currentChunk} ${word}`
      : word;

    if (getByteLength(candidate) <= maxBytes) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Handle a single word that itself exceeds maxBytes.
    if (getByteLength(word) > maxBytes) {
      let part = "";

      for (const char of word) {
        const candidatePart = part + char;

        if (getByteLength(candidatePart) <= maxBytes) {
          part = candidatePart;
        } else {
          if (part) {
            chunks.push(part);
          }

          part = char;
        }
      }

      currentChunk = part;
    } else {
      currentChunk = word;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};

const translateChunk = async (
  text,
  sourceLanguage,
  targetLanguage,
) => {
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLanguage}|${targetLanguage}`,
    mt: "1",
  });

  if (process.env.MYMEMORY_EMAIL) {
    params.set(
      "de",
      process.env.MYMEMORY_EMAIL,
    );
  }

  const response = await fetch(
    `${MYMEMORY_API_URL}?${params.toString()}`,
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "MyMemory HTTP error:",
      response.status,
      data,
    );

    throw new Error(
      data?.responseDetails ||
        "MyMemory translation request failed",
    );
  }

  if (
    data?.responseStatus !== 200 ||
    !data?.responseData?.translatedText
  ) {
    console.error(
      "MyMemory translation error:",
      data,
    );

    throw new Error(
      data?.responseDetails ||
        "Translation failed",
    );
  }

  return data.responseData.translatedText;
};

export const translateText = async (
  text,
  sourceLanguage = "auto",
  targetLanguage = "en",
) => {
  try {
    if (!text?.trim()) {
      throw new Error(
        "Text is required for translation",
      );
    }

    if (!targetLanguage) {
      throw new Error(
        "Target language is required",
      );
    }

    const source =
      sourceLanguage === "auto"
        ? "en"
        : sourceLanguage.toLowerCase();

    const target =
      targetLanguage.toLowerCase();

    if (source === target) {
      return text;
    }

    const chunks = splitIntoChunks(text);

    const translatedChunks = [];

    for (const chunk of chunks) {
      const translatedChunk =
        await translateChunk(
          chunk,
          source,
          target,
        );

      translatedChunks.push(
        translatedChunk,
      );
    }

    return translatedChunks.join(" ");
  } catch (error) {
    console.error(
      "❌ MyMemory translation error:",
      error.message,
    );

    throw new Error(
      "Translation service failed",
    );
  }
};