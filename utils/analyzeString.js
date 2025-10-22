const crypto = require("crypto");

const analyze = (value) => {
  const lower = value.toLowerCase();
  const reversed = lower.split("").reverse().join("");
  const isPalindrome = lower === reversed;
  const uniqueChars = new Set(lower).size;
  const wordCount = value.trim().split(/\s+/).length;

  const frequency = {};
  for (let char of lower) {
    frequency[char] = (frequency[char] || 0) + 1;
  }

  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  return {
    length: value.length,
    is_palindrome: isPalindrome,
    unique_characters: uniqueChars,
    word_count: wordCount,
    sha256_hash,
    character_frequency_map: frequency,
  };
}

module.exports = { analyze };
