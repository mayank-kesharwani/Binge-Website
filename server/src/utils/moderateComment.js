// =====================================================
// Abusive words
// =====================================================

const abusiveWords = [
  // Add your words here.
  // Example:
  // "badword",
  // "anotherbadword",
  "motherfucker",
  "bc",
  "busted",
  "penis",
  "vagina",
];

// =====================================================
// Spam patterns
// =====================================================

// Detect URLs
const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

// Detect 6+ repeated special characters
const repeatedSpecialCharacters =
  /([!@#$%^&*()_+=\-{}$begin:math:display$$end:math:display$:;"'<>,.?/\\|~`])\1{5,}/;

// Detect 9+ repeated same characters
const repeatedCharacters = /(.)\1{8,}/;

// Detect excessive punctuation/symbols
const excessiveSpecialCharacters = /^[^a-zA-Z0-9\s]+$/;

// =====================================================
// Moderation
// =====================================================

const normalizeForModeration = (text) => {
  return (
    text
      .toLowerCase()

      // Common character substitutions

      .replace(/0/g, "o")
      .replace(/1/g, "i")
      .replace(/3/g, "e")
      .replace(/4/g, "a")
      .replace(/5/g, "s")
      .replace(/7/g, "t")

      // Remove spaces and special characters
      .replace(/[^a-z0-9]/g, "")

      // Collapse repeated characters
      .replace(/(.)\1+/g, "$1")
  );
};

export const moderateComment = (text) => {
  const normalized = text.toLowerCase().trim();

  // ---------------------------------------------------
  // Empty
  // ---------------------------------------------------

  if (!normalized) {
    return {
      allowed: false,
      reason: "Comment cannot be empty.",
    };
  }

  // ---------------------------------------------------
// Abusive words
// ---------------------------------------------------

const moderationText =
  normalizeForModeration(normalized);

const containsAbuse = abusiveWords.some((word) => {
  const cleanWord =
    normalizeForModeration(word);

  return (
    cleanWord &&
    moderationText.includes(cleanWord)
  );
});

if (containsAbuse) {
  return {
    allowed: false,
    reason:
      "Your comment contains inappropriate language.",
  };
}

  // ---------------------------------------------------
  // Repeated special characters
  // ---------------------------------------------------

  if (repeatedSpecialCharacters.test(normalized)) {
    return {
      allowed: false,
      reason: "Your comment contains excessive special characters.",
    };
  }

  // ---------------------------------------------------
  // Repeated characters
  // ---------------------------------------------------

  if (repeatedCharacters.test(normalized)) {
    return {
      allowed: false,
      reason: "Your comment appears to be spam.",
    };
  }

  // ---------------------------------------------------
  // Only special characters
  // ---------------------------------------------------

  if (excessiveSpecialCharacters.test(normalized)) {
    return {
      allowed: false,
      reason: "Your comment must contain meaningful text.",
    };
  }

  // ---------------------------------------------------
  // URLs
  // ---------------------------------------------------

  const urlMatches = normalized.match(urlPattern) || [];

  if (urlMatches.length >= 3) {
    return {
      allowed: false,
      reason: "Your comment appears to be spam.",
    };
  }

  // ---------------------------------------------------
  // Allowed
  // ---------------------------------------------------

  return {
    allowed: true,
  };
};
