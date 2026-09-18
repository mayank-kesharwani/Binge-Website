const MYMEMORY_API_URL =
  "https://api.mymemory.translated.net/get";

export const translateText = async (
  text,
  sourceLanguage = "auto",
  targetLanguage = "en",
) => {
  try {
    if (!text?.trim()) {
      throw new Error("Text is required for translation");
    }

    if (!targetLanguage) {
      throw new Error("Target language is required");
    }

    // MyMemory needs a specific source language.
    // Our comment controller already detects English/Hindi.
    const source =
      sourceLanguage === "auto"
        ? "en"
        : sourceLanguage.toLowerCase();

    const target = targetLanguage.toLowerCase();

    if (source === target) {
      return text;
    }

    const params = new URLSearchParams({
      q: text,
      langpair: `${source}|${target}`,
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