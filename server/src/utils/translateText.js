const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate";

const LANGUAGE_CODES = {
  en: "EN",
  hi: "HI",
};

export const translateText = async (
  text,
  sourceLanguage = "auto",
  targetLanguage = "en",
) => {
  try {
    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiKey) {
      throw new Error("DEEPL_API_KEY is not configured");
    }

    if (!text || !text.trim()) {
      throw new Error("Text to translate is required");
    }

    const targetLang = LANGUAGE_CODES[targetLanguage];

    if (!targetLang) {
      throw new Error(
        `Unsupported target language: ${targetLanguage}`,
      );
    }

    const body = {
      text: [text],
      target_lang: targetLang,
    };

    if (
      sourceLanguage &&
      sourceLanguage !== "auto"
    ) {
      const sourceLang = LANGUAGE_CODES[sourceLanguage];

      if (!sourceLang) {
        throw new Error(
          `Unsupported source language: ${sourceLanguage}`,
        );
      }

      body.source_lang = sourceLang;
    }

    const response = await fetch(DEEPL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "DeepL translation error:",
        data,
      );

      throw new Error(
        data?.message ||
          "DeepL translation request failed",
      );
    }

    const translatedText =
      data?.translations?.[0]?.text;

    if (!translatedText) {
      throw new Error(
        "No translated text returned by DeepL",
      );
    }

    return translatedText;
  } catch (error) {
    console.error(
      "Translation error:",
      error.message,
    );

    throw new Error(
      "Translation service failed",
    );
  }
};