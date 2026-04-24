import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node tools/markdown-to-print-html.mjs <input.md> <output.html>");
  process.exit(1);
}

const markdown = await readFile(inputPath, "utf8");

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inlineMarkdown(value) {
  let output = escapeHtml(value);

  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  return output;
}

function isTableSeparator(line) {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(line.trim());
}

function renderTable(lines, startIndex) {
  const rows = [];
  let index = startIndex;

  while (index < lines.length && lines[index].trim().startsWith("|")) {
    rows.push(lines[index]);
    index += 1;
  }

  const header = rows[0]
    .split("|")
    .slice(1, -1)
    .map((cell) => `<th>${inlineMarkdown(cell.trim())}</th>`)
    .join("");

  const bodyRows = rows
    .slice(isTableSeparator(rows[1] ?? "") ? 2 : 1)
    .map((row) => {
      const cells = row
        .split("|")
        .slice(1, -1)
        .map((cell) => `<td>${inlineMarkdown(cell.trim())}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("\n");

  return {
    html: `<table><thead><tr>${header}</tr></thead><tbody>${bodyRows}</tbody></table>`,
    nextIndex: index,
  };
}

function renderList(lines, startIndex, ordered) {
  const items = [];
  const pattern = ordered ? /^\d+\.\s+(.+)$/ : /^-\s+(.+)$/;
  let index = startIndex;

  while (index < lines.length) {
    const match = lines[index].match(pattern);
    if (!match) break;
    items.push(`<li>${inlineMarkdown(match[1])}</li>`);
    index += 1;
  }

  const tag = ordered ? "ol" : "ul";
  return {
    html: `<${tag}>${items.join("")}</${tag}>`,
    nextIndex: index,
  };
}

function renderMarkdown(source) {
  const lines = source.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed === "---") {
      blocks.push("<hr />");
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
      continue;
    }

    if (trimmed.startsWith("|") && index + 1 < lines.length && isTableSeparator(lines[index + 1])) {
      const table = renderTable(lines, index);
      blocks.push(table.html);
      index = table.nextIndex;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const list = renderList(lines, index, true);
      blocks.push(list.html);
      index = list.nextIndex;
      continue;
    }

    if (/^-\s+/.test(trimmed)) {
      const list = renderList(lines, index, false);
      blocks.push(list.html);
      index = list.nextIndex;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(`<blockquote>${quoteLines.map(inlineMarkdown).join("<br />")}</blockquote>`);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
      index += 1;
      continue;
    }

    const paragraph = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#{1,6})\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !/^- /.test(lines[index].trim()) &&
      !lines[index].trim().startsWith("|") &&
      !lines[index].trim().startsWith(">") &&
      lines[index].trim() !== "---" &&
      !lines[index].trim().startsWith("```")
    ) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
  }

  return blocks.join("\n");
}

const title = markdown.match(/^#\s+(.+)$/m)?.[1] ?? path.basename(inputPath);
const body = renderMarkdown(markdown);

const html = `<!doctype html>
<html lang="pt-PT">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 16mm 20mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #1f261d;
      background: #f7f8f2;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10.4pt;
      line-height: 1.48;
    }

    .page {
      max-width: 190mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 0;
    }

    .cover {
      border: 1px solid #dfe5d5;
      border-left: 8px solid #c3f400;
      padding: 18mm 14mm 14mm;
      margin-bottom: 10mm;
      background: linear-gradient(135deg, #ffffff 0%, #f1f5e8 100%);
      break-inside: avoid;
    }

    .brand {
      display: inline-block;
      margin-bottom: 10mm;
      border: 1px solid #cbd6b8;
      border-radius: 999px;
      padding: 5px 10px;
      color: #496000;
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: #12160f;
      font-size: 29pt;
      line-height: 1.02;
      letter-spacing: -0.04em;
    }

    h2 {
      margin: 11mm 0 4mm;
      padding-bottom: 2.5mm;
      border-bottom: 1px solid #dfe5d5;
      color: #172012;
      font-size: 17pt;
      line-height: 1.1;
      break-after: avoid;
    }

    h3 {
      margin: 7mm 0 3mm;
      color: #26331e;
      font-size: 12.5pt;
      break-after: avoid;
    }

    p {
      margin: 0 0 3.4mm;
    }

    blockquote {
      margin: 5mm 0 7mm;
      padding: 4mm 5mm;
      border-left: 4px solid #c3f400;
      background: #f5f8ed;
      color: #3d4837;
      break-inside: avoid;
    }

    hr {
      height: 1px;
      margin: 7mm 0;
      border: 0;
      background: #e2e7d9;
    }

    table {
      width: 100%;
      margin: 4mm 0 7mm;
      border-collapse: collapse;
      font-size: 8.9pt;
      break-inside: avoid;
    }

    th,
    td {
      border: 1px solid #dfe5d5;
      padding: 2.4mm 2.8mm;
      vertical-align: top;
    }

    th {
      background: #edf3df;
      color: #1f261d;
      font-weight: 700;
      text-align: left;
    }

    tr:nth-child(even) td {
      background: #fbfcf7;
    }

    ul,
    ol {
      margin: 2mm 0 5mm 6mm;
      padding-left: 6mm;
    }

    li {
      margin-bottom: 1.4mm;
    }

    code {
      border: 1px solid #e1e6da;
      border-radius: 4px;
      background: #f4f6ef;
      padding: 0.4mm 1.1mm;
      color: #334000;
      font-family: Consolas, "Courier New", monospace;
      font-size: 0.92em;
    }

    pre {
      margin: 4mm 0 7mm;
      border: 1px solid #dfe5d5;
      border-radius: 6px;
      background: #11160e;
      color: #eef6e0;
      padding: 4mm;
      white-space: pre-wrap;
      break-inside: avoid;
    }

    pre code {
      border: 0;
      background: transparent;
      color: inherit;
      padding: 0;
    }

    .content > h1:first-child {
      display: none;
    }

    .footer {
      margin-top: 12mm;
      border-top: 1px solid #dfe5d5;
      padding-top: 4mm;
      color: #7a8571;
      font-size: 8.5pt;
    }

    @media screen {
      body {
        padding: 24px;
      }

      .page {
        box-shadow: 0 18px 70px rgba(16, 17, 15, 0.16);
        padding: 16mm;
      }
    }

    @media print {
      body {
        background: #ffffff;
      }

      .page {
        max-width: none;
      }

      a {
        color: inherit;
        text-decoration: none;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <section class="cover">
      <span class="brand">Tela88</span>
      <h1>${inlineMarkdown(title)}</h1>
    </section>
    <section class="content">
      ${body}
    </section>
    <footer class="footer">
      Documento gerado a partir de ${escapeHtml(path.basename(inputPath))}.
    </footer>
  </main>
</body>
</html>
`;

await writeFile(outputPath, html, "utf8");
