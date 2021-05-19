/**
 * Abbreviates titles/artists that are too long to fit inside the component.
 *
 * @param {string} phrase The text to shorten
 * @param {number} cap The length to shorten to
 * @return {string} Shortened phrase
 */
export const shortenPhrase = (phrase: string, cap: number): string => {
  if (phrase.length < cap) {
    return phrase;
  }

  const shortened = phrase.slice(0, cap) + "...";
  return shortened;
};
