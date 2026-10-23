import { SongProject } from '../types/lyric';

export function formatLyricsAsText(project: SongProject, includeSyllables = false): string {
  const parts: string[] = [];
  parts.push(`${project.title.toUpperCase()}`);
  parts.push(`Genre: ${project.genre} | Key: ${project.keySignature} | BPM: ${project.bpm}`);
  parts.push('='.repeat(40));
  parts.push('');

  project.sections.forEach((sec) => {
    parts.push(`[${sec.name.toUpperCase()}]`);
    sec.lines.forEach((l) => {
      const sylTag = includeSyllables ? ` [${l.syllableCount}]` : '';
      parts.push(`${l.rawText}${sylTag}`);
    });
    parts.push('');
  });

  if (project.favoriteLines && project.favoriteLines.length > 0) {
    parts.push('--- FAVORITE PUNCHLINES ---');
    project.favoriteLines.forEach((fav) => parts.push(`★ ${fav}`));
  }

  return parts.join('\n');
}

export function formatLyricsAsMarkdown(project: SongProject): string {
  const parts: string[] = [];
  parts.push(`# ${project.title}`);
  parts.push(`*Genre: ${project.genre} | Key: ${project.keySignature} | BPM: ${project.bpm}*`);
  parts.push('');

  project.sections.forEach((sec) => {
    parts.push(`### ${sec.name}`);
    sec.lines.forEach((l) => {
      parts.push(`${l.rawText} \`(${l.syllableCount} syl)\`  `);
    });
    parts.push('');
  });

  return parts.join('\n');
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printFormattedLyrics(project: SongProject) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${project.title} - Rhyte Studio Sheet</title>
        <style>
          body {
            font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            color: #111;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
          }
          h1 { margin-bottom: 4px; font-size: 28px; text-transform: uppercase; }
          .meta { color: #666; font-size: 14px; margin-bottom: 24px; border-bottom: 1px solid #ddd; padding-bottom: 12px; }
          .section-title { font-size: 15px; font-weight: 700; color: #333; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.05em; }
          .line { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 16px; }
          .syl { font-family: monospace; color: #888; font-size: 13px; margin-left: 16px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>${project.title}</h1>
        <div class="meta">Genre: ${project.genre} &bull; Key: ${project.keySignature} &bull; Tempo: ${project.bpm} BPM</div>
        ${project.sections
          .map(
            (sec) => `
          <div class="section-title">[${sec.name}]</div>
          ${sec.lines
            .map(
              (l) => `
            <div class="line">
              <span>${l.rawText || '&nbsp;'}</span>
              <span class="syl">${l.syllableCount > 0 ? l.syllableCount : ''}</span>
            </div>
          `
            )
            .join('')}
        `
          )
          .join('')}
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
