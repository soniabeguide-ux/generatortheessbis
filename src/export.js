// ─── DOCX (vrai format Word) ──────────────────────────────────────────────────

function parseArticleLines(content) {
  const lines = content.split("\n");
  const result = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { result.push({ type: "empty" }); continue; }
    if (/^[IVX]+\s*—/.test(line) || /^Conclusion\b/.test(line)) {
      result.push({ type: "heading", text: line });
    } else if (/^\*{3}[«"]/.test(line)) {
      const inner = line.replace(/\*{3}/g, "").trim();
      const dashIdx = inner.search(/\s*—\s*/);
      if (dashIdx > -1) {
        result.push({ type: "quote", text: inner.slice(0, dashIdx).replace(/^[«"]/, "").replace(/[»"]$/, "").trim(), author: inner.slice(dashIdx).replace(/\s*—\s*/, "").trim() });
      } else {
        result.push({ type: "quote", text: inner.replace(/^[«"]/, "").replace(/[»"]$/, "").trim(), author: "Dr Raoul Wafo" });
      }
    } else if (/^\d+\./.test(line)) {
      result.push({ type: "list", text: line.replace(/^\d+\.\s*/, "") });
    } else if (line.startsWith("**") && line.endsWith("**")) {
      result.push({ type: "bold", text: line.slice(2, -2) });
    } else if (/^\[.+\]\(.+\)/.test(line)) {
      result.push({ type: "skip" });
    } else {
      result.push({ type: "para", text: line });
    }
  }
  return result;
}

function buildDocxXml(content, title, dateStr, lang, meta) {
  const lines = parseArticleLines(content);
  const artNum = meta?.article_number || "XXX";
  const website = lang === "fr" ? "theessentialsfr.wordpress.com" : "theessentialsen.wordpress.com";
  const category = lang === "fr" ? "FAMILLE & SAGESSE" : "FAMILY & WISDOM";

  let bodyXml = "";

  // Header info
  bodyXml += para(runs([run(dateStr.toUpperCase(), { size: 18, color: "1B2B5E", font: "Arial" })]));
  bodyXml += para(runs([run("The Essentials.", { size: 52, bold: true, color: "1B2B5E", font: "Playfair Display" })]), "center");
  bodyXml += para(runs([run(`ARTICLE #${artNum} — ${category}`, { size: 18, color: "888888", font: "Arial" })]), "center");
  bodyXml += para(runs([run(title || "", { size: 36, bold: true, color: "1B2B5E" })]));
  bodyXml += para(runs([run("─────────────────────────────────────────", { size: 20, color: "C8A951" })]));

  for (const l of lines) {
    if (l.type === "empty") { bodyXml += para(runs([run("")])); }
    else if (l.type === "heading") {
      bodyXml += para(runs([run(l.text, { size: 26, bold: true, color: "1B2B5E" })]), "left", "180");
    } else if (l.type === "quote") {
      bodyXml += para(runs([
        run(`«\u202F${l.text}\u202F»`, { size: 22, italic: true, color: "1B2B5E" }),
        run(`  — ${l.author}`, { size: 20, bold: true, color: "555555", font: "Arial" }),
      ]), "left", "60", "360");
    } else if (l.type === "list") {
      bodyXml += para(runs([run(`• ${l.text}`, { size: 22 })]), "left", "40", "360");
    } else if (l.type === "bold") {
      bodyXml += para(runs([run(l.text, { size: 22, bold: true })]));
    } else if (l.type === "para") {
      const formatted = l.text.replace(/\*\*([^*]+)\*\*/g, "%%BOLD%%$1%%ENDBOLD%%");
      if (formatted.includes("%%BOLD%%")) {
        const parts = formatted.split(/(%%BOLD%%.*?%%ENDBOLD%%)/g).filter(Boolean);
        const runList = parts.map(p => {
          if (p.startsWith("%%BOLD%%")) {
            return run(p.replace(/%%BOLD%%|%%ENDBOLD%%/g, ""), { size: 22, bold: true });
          }
          return run(p, { size: 22 });
        });
        bodyXml += para(runs(runList));
      } else {
        bodyXml += para(runs([run(l.text, { size: 22 })]));
      }
    }
  }

  // Footer
  bodyXml += para(runs([run("─────────────────────────────────────────", { size: 20, color: "C8A951" })]));
  const signoff = lang === "fr" ? "On est ensemble. Et tiens bon malgré les vents contraires." : "We're in this together. And stay strong despite the contrary winds.";
  bodyXml += para(runs([run(signoff, { size: 20, italic: true, color: "1B2B5E" })]));
  bodyXml += para(runs([run("SBE", { size: 20, bold: true, color: "1B2B5E", font: "Arial" })]));
  bodyXml += para(runs([run(website, { size: 18, color: "888888", font: "Arial" })]));

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>
${bodyXml}
<w:sectPr>
  <w:pgSz w:w="11906" w:h="16838"/>
  <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
</w:sectPr>
</w:body>
</w:document>`;
}

function run(text, opts = {}) {
  const { size = 22, bold, italic, color, font } = opts;
  const rpr = [
    font ? `<w:rFonts w:ascii="${font}" w:hAnsi="${font}"/>` : `<w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>`,
    `<w:sz w:val="${size}"/>`,
    `<w:szCs w:val="${size}"/>`,
    bold ? `<w:b/>` : "",
    italic ? `<w:i/>` : "",
    color ? `<w:color w:val="${color}"/>` : "",
  ].join("");
  const escaped = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  return `<w:r><w:rPr>${rpr}</w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r>`;
}

function runs(runList) { return runList.join(""); }

function para(content, jc = "both", spaceBefore = "60", indent = "") {
  const indentXml = indent ? `<w:ind w:left="${indent}"/>` : "";
  return `<w:p><w:pPr><w:jc w:val="${jc}"/><w:spacing w:before="${spaceBefore}" w:after="60"/>${indentXml}</w:pPr>${content}</w:p>`;
}

async function buildDocxBlob(content, title, dateStr, lang, meta) {
  const docXml = buildDocxXml(content, title, dateStr, lang, meta);

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr>
    <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
    <w:sz w:val="22"/><w:szCs w:val="22"/>
  </w:rPr></w:rPrDefault></w:docDefaults>
</w:styles>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  // Build ZIP using JSZip loaded from CDN — but we're in Node/browser context
  // Use manual zip building with fflate if available, else fall back to blob
  const files = {
    "[Content_Types].xml": contentTypesXml,
    "_rels/.rels": rootRelsXml,
    "word/document.xml": docXml,
    "word/styles.xml": stylesXml,
    "word/_rels/document.xml.rels": relsXml,
  };

  // Use fflate (bundled with vite) for ZIP
  const { strToU8, zipSync } = await import("fflate");
  const zipped = {};
  for (const [path, content] of Object.entries(files)) {
    zipped[path] = strToU8(content);
  }
  const zipData = zipSync(zipped);
  return new Blob([zipData], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

export async function downloadDocx(content, title, dateStr, lang, meta) {
  try {
    const blob = await buildDocxBlob(content, title, dateStr, lang, meta);
    const artNum = meta?.article_number || "XXX";
    const safeTitle = (title || "article").slice(0, 35).replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
    triggerDownload(blob, `Article_${artNum}_${lang.toUpperCase()}_${safeTitle}.docx`);
    return { ok: true };
  } catch (e) {
    console.error("DOCX error:", e);
    return { ok: false, error: e.message };
  }
}

// ─── HTML / PDF ──────────────────────────────────────────────────────────────

function markdownToHtml(md) {
  const lines = md.split("\n");
  let html = "";
  let inOL = false;

  const closeList = () => { if (inOL) { html += "</ol>"; inOL = false; } };
  const fmt = (s) =>
    s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
     .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { closeList(); continue; }
    if (/^[IVX]+\s*—/.test(line) || /^Conclusion\b/.test(line)) {
      closeList();
      html += `<h3>${fmt(line)}</h3>`;
    } else if (/^\d+\./.test(line)) {
      if (!inOL) { html += "<ol>"; inOL = true; }
      html += `<li>${fmt(line.replace(/^\d+\.\s*/, ""))}</li>`;
    } else if (/^\*{3}[«"]/.test(line)) {
      closeList();
      const inner = line.replace(/\*{3}/g, "").trim();
      const dashIdx = inner.search(/\s*—\s*/);
      if (dashIdx > -1) {
        const quote = inner.slice(0, dashIdx).replace(/^[«"]/, "").replace(/[»"]$/, "");
        const author = inner.slice(dashIdx).replace(/\s*—\s*/, "");
        html += `<blockquote><span class="qt">«\u202F${quote}\u202F»</span><cite>${author}</cite></blockquote>`;
      } else {
        const quote = inner.replace(/^[«"]/, "").replace(/[»"]$/, "");
        html += `<blockquote><span class="qt">«\u202F${quote}\u202F»</span><cite>Dr Raoul Wafo</cite></blockquote>`;
      }
    } else if (line.startsWith("**") && line.endsWith("**")) {
      closeList();
      html += `<p><strong>${line.slice(2, -2)}</strong></p>`;
    } else if (/^\[.+\]\(.+\)/.test(line)) {
      closeList();
    } else {
      closeList();
      html += `<p>${fmt(line)}</p>`;
    }
  }
  closeList();
  return html;
}

export function buildPdfHtml(content, title, dateStr, lang, meta) {
  const artNum = meta?.article_number || "XXX";
  const websiteFR = "theessentialsfr.wordpress.com";
  const websiteEN = "theessentialsen.wordpress.com";
  const websiteMain = lang === "fr" ? websiteFR : websiteEN;
  const otherLang = lang === "fr" ? "VERSION ANGLAISE ↗" : "VERSION FRANÇAISE ↗";
  const category = lang === "fr" ? (meta?.category_fr || "FAMILLE & SAGESSE") : (meta?.category_en || "FAMILY & WISDOM");
  const founded = lang === "fr" ? "FONDÉ SUR LA VÉRITÉ" : "FOUNDED ON TRUTH";
  const tagline = lang === "fr"
    ? "«\u202FTu n'es pas victime mais victorieuse. Le diable te hait parce qu'il te craint.\u202F»"
    : '"You are not a victim — you are victorious. The devil hates you because he fears you."';
  const signoff = lang === "fr"
    ? "On est ensemble. Et tiens bon malgré les vents contraires."
    : "We're in this together. And stay strong despite the contrary winds.";

  const body = markdownToHtml(content);

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<title>The Essentials — Article #${artNum}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Source Serif 4',Georgia,serif;font-size:10.5pt;color:#1a1a1a;background:#fff;padding:18mm 16mm}
@page{size:A4;margin:18mm 16mm}
.hbar{display:flex;justify-content:space-between;border-bottom:1.5px solid #1B2B5E;padding-bottom:6px;margin-bottom:12px}
.hbar span{font-size:7.5pt;text-transform:uppercase;letter-spacing:.8px;color:#1B2B5E;font-family:Arial,sans-serif}
.logo{text-align:center;margin-bottom:12px}
.logo-name{font-family:'Playfair Display',Georgia,serif;font-size:28pt;color:#1B2B5E;font-weight:700;letter-spacing:-0.5px;line-height:1}
.mbar{display:flex;justify-content:space-between;padding:5px 0;border-top:.5px solid #ccc;border-bottom:.5px solid #ccc;margin-bottom:14px}
.mbar span{font-size:7.5pt;font-family:Arial,sans-serif;color:#555;text-transform:uppercase;letter-spacing:.5px}
.atag{font-size:7.5pt;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;color:#1B2B5E;font-weight:700;margin-bottom:6px}
h2{font-family:'Playfair Display',Georgia,serif;font-size:24pt;line-height:1.15;color:#1B2B5E;margin-bottom:12px}
.tbox{border-top:1.5px solid #1B2B5E;border-bottom:1.5px solid #1B2B5E;padding:10px 24px;text-align:center;margin:14px 0}
.tbox p{font-style:italic;font-size:11pt;color:#1B2B5E;line-height:1.5}
.tbox .cr{font-size:7.5pt;font-style:normal;letter-spacing:1px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px}
.cols{column-count:2;column-gap:18px}
.cols p{margin-bottom:7px;line-height:1.6;font-size:10pt;text-align:justify;hyphens:auto}
.cols h3{font-family:'Playfair Display',Georgia,serif;font-size:11.5pt;color:#1B2B5E;margin:14px 0 5px;border-bottom:1px solid #1B2B5E;padding-bottom:2px;break-after:avoid}
.cols ol{margin-left:14px;margin-bottom:8px;font-size:10pt;line-height:1.5}
.cols li{margin-bottom:3px}
.cols blockquote{border-left:3px solid #C8A951;padding-left:9px;margin:8px 0;break-inside:avoid}
.cols blockquote .qt{display:block;font-style:italic;color:#1B2B5E;font-size:10pt;line-height:1.5}
.cols blockquote cite{display:block;font-style:normal;font-size:8pt;font-weight:600;color:#555;margin-top:3px;font-family:Arial,sans-serif;text-transform:uppercase}
.cols p:first-of-type::first-letter{font-family:'Playfair Display';font-size:36pt;float:left;line-height:.75;padding-right:4px;padding-top:5px;color:#1B2B5E;font-weight:700}
.foot{border-top:1.5px solid #1B2B5E;margin-top:14px;padding-top:7px;display:flex;justify-content:space-between}
.foot .so{font-size:9pt;color:#1B2B5E;font-weight:600}
.foot .si{font-size:7.5pt;font-family:Arial,sans-serif;color:#888;text-align:right}
@media print{body{padding:0}@page{margin:18mm 16mm}*{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>
</head>
<body>
<div class="hbar"><span>${dateStr.toUpperCase()}</span><span>${founded}</span><span>PUBLICATION NO. ${artNum}</span></div>
<div class="logo"><div class="logo-name">The Essentials.</div></div>
<div class="mbar"><span>${category}</span><span>${websiteMain.toUpperCase()}</span><span>${otherLang}</span></div>
<div class="atag">ARTICLE #${artNum} — ${category}</div>
<h2>${title || ""}</h2>
<div class="tbox"><p>${tagline}</p><p class="cr">— THE ESSENTIALS., ARTICLE #${artNum}</p></div>
<div class="cols">${body}</div>
<div class="foot"><div><div class="so">${signoff}</div><div style="font-size:8pt;font-family:Arial,sans-serif;font-weight:700;color:#1B2B5E">SBE</div></div><div class="si">${websiteFR}<br>${websiteEN}</div></div>
</body></html>`;
}

export function downloadPdfHtml(content, title, dateStr, lang, meta) {
  const html = buildPdfHtml(content, title, dateStr, lang, meta);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const artNum = meta?.article_number || "XXX";
  triggerDownload(blob, `The_Essentials_Article_${artNum}_${lang.toUpperCase()}.html`);
}

export function downloadText(content, title, lang, meta) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const artNum = meta?.article_number || "XXX";
  const safeTitle = (title || "article").slice(0, 35).replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  triggerDownload(blob, `Article_${artNum}_${lang.toUpperCase()}_${safeTitle}.txt`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
