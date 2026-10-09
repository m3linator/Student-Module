/**
 * @file generate-docs.mjs
 * @brief Generates the Doxygen HTML docs and removes every file the pages do not reference.
 *
 * Usage: `npm run docs` (requires `doxygen` on the PATH, e.g. `brew install doxygen`).
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const htmlDir = join(root, 'docs/html');
const TEXT_FILES = /\.(html|css|js)$/;

rmSync(htmlDir, { recursive: true, force: true });
execFileSync('doxygen', ['docs/Doxyfile'], { cwd: root, stdio: 'inherit' });

/**
 * @brief Deletes files whose name is not mentioned by any other HTML/CSS/JS file (repeats until
 *        stable, because deleting a page can orphan its assets).
 * @returns Number of removed files.
 */
function prune() {
  let removed = 0;
  for (;;) {
    const files = readdirSync(htmlDir);
    const contents = new Map(
      files
        .filter((name) => TEXT_FILES.test(name))
        .map((name) => [name, readFileSync(join(htmlDir, name), 'utf8')]),
    );
    // A file is used if any *other* page, stylesheet or script mentions it.
    const isReferenced = (name) =>
      [...contents].some(([other, text]) => other !== name && text.includes(name));
    const orphans = files.filter((name) => name !== 'index.html' && !isReferenced(name));
    if (orphans.length === 0) return removed;
    for (const name of orphans) rmSync(join(htmlDir, name));
    removed += orphans.length;
  }
}

// Crawler helper page: only an invisible link list for search engines, not needed for browsing.
const indexPath = join(htmlDir, 'index.html');
writeFileSync(
  indexPath,
  readFileSync(indexPath, 'utf8').replace(/<a href="doxygen_crawl\.html"><\/a>/g, ''),
);

const removed = prune();
const kept = readdirSync(htmlDir).length;
console.log(`Docs ready: docs/html/index.html (${kept} files kept, ${removed} unused removed)`);
