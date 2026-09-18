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
    console.error("❌ Translation failed");
    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Code:", error.code);
    console.error("Status:", error.status);
    console.error("Full error:", error);

    throw new Error("Translation service failed");
  }
};