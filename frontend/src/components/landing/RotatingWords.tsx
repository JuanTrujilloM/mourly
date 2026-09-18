// Mirror of the word slot in globals.css (.rotating-word): the keyframes give
// each word a third of the cycle, hence exactly three words.
const SLOT_SECONDS = 2.5;

// The words share one grid cell, so the line keeps the width of the longest
// and nothing reflows as they swap. Screen readers and reduced-motion users
// get the whole sentence instead of a text that changes on its own.
export function RotatingWords({
  prefix,
  words,
}: {
  prefix: string;
  words: readonly [string, string, string];
}) {
  const sentence = words.map((word) => `${prefix} ${word}`).join(' ');

  return (
    <>
      <span className="sr-only motion-reduce:not-sr-only">{sentence}</span>
      <span aria-hidden className="motion-reduce:hidden">
        {prefix}{' '}
        <span className="text-accent-text inline-grid">
          {words.map((word, index) => (
            <span
              key={word}
              style={{ animationDelay: `${index * SLOT_SECONDS}s` }}
              className="rotating-word col-start-1 row-start-1"
            >
              {word}
            </span>
          ))}
        </span>
      </span>
    </>
  );
}
