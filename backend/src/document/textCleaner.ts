export function cleanExtractedText(text: string): string {
  if (!text) return '';

  return text
    // Replace non-standard whitespace and multiple spaces with a single space
    .replace(/[\r\t\f\v]/g, ' ')
    .replace(/[\u00a0\u2000-\u200b\u2028\u2029\u3000]/g, ' ')
    // Normalize quotes and dashes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    // Replace multiple consecutive newlines with two newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove trailing spaces on lines
    .replace(/[ \t]+\n/g, '\n')
    // Remove lines that look like standalone page numbers or headers
    .replace(/^Page \d+ of \d+$/gim, '')
    // Final trim
    .trim();
}
