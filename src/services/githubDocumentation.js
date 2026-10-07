const README_URL = 'https://raw.githubusercontent.com/DellProSupportGse/Tools/main/README.md';

const slugifyHeading = (heading) => heading
  .replace(/[`*_]/g, '')
  .trim()
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, '-')
  .replace(/-+$/g, '');

const findSection = (markdown, anchor) => {
  const lines = markdown.split(/\r?\n/);
  const targetIndex = lines.findIndex(line => {
    const match = line.match(/^(#{2,6})\s+(.+?)\s*#*$/);
    return match && slugifyHeading(match[2]) === anchor.replace(/^#/, '');
  });

  if (targetIndex < 0) return null;

  const heading = lines[targetIndex].match(/^(#{2,6})\s+/)[1].length;
  let endIndex = lines.length;

  for (let index = targetIndex + 1; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+/);
    if (match && match[1].length <= heading) {
      endIndex = index;
      break;
    }
  }

  return lines.slice(targetIndex, endIndex).join('\n').trim();
};

export async function getToolInstructions(anchor) {
  if (!anchor) return null;

  const response = await fetch(`${README_URL}?section=${encodeURIComponent(anchor)}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`GitHub README request failed with status ${response.status}`);
  }

  const markdown = await response.text();
  return findSection(markdown, anchor);
}

export { README_URL };
