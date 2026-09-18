import { translate } from "@vitalets/google-translate-api";

export const translateText = async (
  text,
  sourceLanguage = "auto",
  targetLanguage = "en",
) => {
  try {
    const result = await translate(text, {
      from: sourceLanguage,
      to: targetLanguage,
    });

    return result.text;
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