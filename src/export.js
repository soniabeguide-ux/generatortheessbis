// ─── RTF / DOCX ─────────────────────────────────────────────────────────────

function escapeRtf(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/[^\x00-\x7F]/g, (c) => {
      const code = c.charCodeAt(0);
      if (code <= 255) return `\\'${code.toString(16).padStart(2, "0")}`;
      return `\\u${code}?`;
    });
}

function buildRtfDocument(content, title, dateStr, lang, meta) {
  const lines = content.split("\n");
  let rtfBody = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { rtfBody += "\\par\n"; continue; }

    if (/^[IVX]+\s*—/.test(trimmed) || /^Conclusion/.test(trimmed)) {
      rtfBody += `\\pard\\sb200\\sa80\\b\\fs26\\cf1 ${escapeRtf(trimmed)}\\b0\\fs22\\cf0\\par\n`;
    } else if (/^\*{3}[«"]/.test(trimmed)) {
      const cleaned = trimmed.replace(/\*{3}/g, "").replace(/^\s*/, "");
      rtfBody += `\\pard\\li400\\ri400\\sb80\\sa80\\i\\cf2 ${escapeRtf(cleaned)}\\i0\\cf0\\par\n`;
    } else if (/^\d+\./.test(trimmed)) {
      rtfBody += `\\pard\\li400\\sb40\\sa40 ${escapeRtf(trimmed)}\\par\n`;
    } else if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      const t = trimmed.slice(2, -2).replace(/\*\*/g, "");
      rtfBody += `\\pard\\sb120\\sa60\\b ${escapeRtf(t)}\\b0\\par\n`;
    } else {
      const formatted = trimmed
        .replace(/\*\*([^*]+)\*\*/g, (_, t) => `\\b ${escapeRtf(t)}\\b0 `)
        .replace(/\*([^*]+)\*/g, (_, t) => `\\i ${escapeRtf(t)}\\i0 `);
      rtfBody += `\\pard\\sb60\\sa40 ${typeof formatted === "string" ? formatted : escapeRtf(trimmed)}\\par\n`;
    }
  }

  const artNum = meta?.article_number || "XXX";
  const websiteFR = "theessentialsfr.wordpress.com";
  const websiteEN = "theessentialsen.wordpress.com";
  const websiteMain = lang === "fr" ? websiteFR : websiteEN;

  return `{\\rtf1\\ansi\\ansicpg1252\\deff0
{\\fonttbl
  {\\f0\\froman\\fcharset0 Georgia;}
  {\\f1\\fswiss\\fcharset0 Arial;}
}
{\\colortbl;
  \\red27\\green43\\blue94;
  \\red192\\green57\\blue43;
  \\red200\\green169\\blue81;
}
\\widowctrl\\hyphauto\\f0\\fs22
\\pard\\qr\\f1\\fs18\\cf1 ${escapeRtf(dateStr)}\\cf0\\par
\\pard\\qc\\f1\\fs40\\b\\cf1 The Essentials.\\b0\\cf0\\par
\\pard\\qc\\f1\\fs16\\cf2 FONDÉ SUR LA VÉRITÉ — PUBLICATION NO. ${artNum}\\cf0\\par
\\pard\\sb120\\f1\\fs16\\cf1 ARTICLE #${artNum} — ${lang === "fr" ? "FAMILLE & SAGESSE" : "FAMILY & WISDOM"}\\cf0\\par
\\pard\\sb60\\f0\\fs32\\b\\cf1 ${escapeRtf(title || "")}\\b0\\cf0\\par
\\pard\\sb80\\sa80\\brdrb\\brdrs\\brdrw10\\brdrsp20 \\par
${rtfBody}
\\pard\\sb200\\f1\\fs16 ${escapeRtf(websiteMain)}\\par
}`;
}

export function downloadDocx(content, title, dateStr, lang, meta) {
  const rtf = buildRtfDocument(content, title, dateStr, lang, meta);
  const blob = new Blob([rtf], { type: "application/rtf" });
  const artNum = meta?.article_number || "XXX";
  const safeTitle = (title || "article").slice(0, 35).replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").replace(/\s+/g, "_");
  triggerDownload(blob, `Article_${artNum}_${lang.toUpperCase()}_${safeTitle}.rtf`);
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
        html += `<blockquote><span class="quote-text">«\u202F${quote}\u202F»</span><cite>${author}</cite></blockquote>`;
      } else {
        const quote = inner.replace(/^[«"]/, "").replace(/[»"]$/, "");
        html += `<blockquote><span class="quote-text">«\u202F${quote}\u202F»</span><cite>Dr Raoul Wafo</cite></blockquote>`;
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
  const otherLang = lang === "fr" ? `VERSION ANGLAISE ↗` : `VERSION FRANÇAISE ↗`;
  const category = lang === "fr" ? "FAMILLE & SAGESSE" : "FAMILY & WISDOM";
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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Source Serif 4',Georgia,serif;font-size:10.5pt;color:#1a1a1a;background:#fff;padding:18mm 16mm}
@page{size:A4;margin:18mm 16mm}
.header-bar{display:flex;justify-content:space-between;border-bottom:1.5px solid #1B2B5E;padding-bottom:6px;margin-bottom:12px}
.header-bar span{font-size:7.5pt;text-transform:uppercase;letter-spacing:.8px;color:#1B2B5E;font-family:Arial,sans-serif}
.logo{text-align:center;margin-bottom:12px}
.logo-name{font-family:'Playfair Display',Georgia,serif;font-size:28pt;color:#1B2B5E;font-weight:700;letter-spacing:-0.5px;line-height:1}
.logo-sub{font-size:7pt;letter-spacing:2px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:2px}
.meta-bar{display:flex;justify-content:space-between;padding:5px 0;border-top:.5px solid #ccc;border-bottom:.5px solid #ccc;margin-bottom:14px}
.meta-bar span{font-size:7.5pt;font-family:Arial,sans-serif;color:#555;text-transform:uppercase;letter-spacing:.5px}
.art-tag{font-size:7.5pt;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;color:#1B2B5E;font-weight:700;margin-bottom:6px}
h2{font-family:'Playfair Display',Georgia,serif;font-size:24pt;line-height:1.15;color:#1B2B5E;margin-bottom:12px}
.tagline-box{border-top:1.5px solid #1B2B5E;border-bottom:1.5px solid #1B2B5E;padding:10px 24px;text-align:center;margin:14px 0}
.tagline-box p{font-style:italic;font-size:11pt;color:#1B2B5E;line-height:1.5}
.tagline-box .credit{font-size:7.5pt;font-style:normal;letter-spacing:1px;color:#888;font-family:Arial,sans-serif;text-transform:uppercase;margin-top:4px}
.cols{column-count:2;column-gap:18px}
.cols p{margin-bottom:7px;line-height:1.6;font-size:10pt;text-align:justify;hyphens:auto}
.cols h3{font-family:'Playfair Display',Georgia,serif;font-size:11.5pt;color:#1B2B5E;margin:14px 0 5px;border-bottom:1px solid #1B2B5E;padding-bottom:2px;break-after:avoid}
.cols ol{margin-left:14px;margin-bottom:8px;font-size:10pt;line-height:1.5}
.cols li{margin-bottom:3px;padding-left:2px}
.cols blockquote{border-left:3px solid #C8A951;padding-left:9px;margin:8px 0;break-inside:avoid}
.cols blockquote .quote-text{display:block;font-style:italic;color:#1B2B5E;font-size:10pt;line-height:1.5}
.cols blockquote cite{display:block;font-style:normal;font-size:8pt;font-weight:600;color:#555;margin-top:3px;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:.5px}
.cols p:first-of-type::first-letter{font-family:'Playfair Display';font-size:36pt;float:left;line-height:.75;padding-right:4px;padding-top:5px;color:#1B2B5E;font-weight:700}
.footer{border-top:1.5px solid #1B2B5E;margin-top:14px;padding-top:7px;display:flex;justify-content:space-between;align-items:center}
.footer .signoff{font-size:9pt;color:#1B2B5E;font-weight:600}
.footer .sbe{font-size:8pt;font-family:Arial,sans-serif;font-weight:700;color:#1B2B5E}
.footer .sites{font-size:7.5pt;font-family:Arial,sans-serif;color:#888;text-align:right}
@media print{body{padding:0}@page{margin:18mm 16mm}* {print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style>
</head>
<body>
<div class="header-bar">
  <span>${dateStr.toUpperCase()}</span>
  <span>${founded}</span>
  <span>PUBLICATION NO. ${artNum}</span>
</div>
<div class="logo">
  <div class="logo-name">The Essentials.</div>
  <div class="logo-sub">fondé sur la vérité</div>
</div>
<div class="meta-bar">
  <span>${category}</span>
  <span>${websiteMain.toUpperCase()}</span>
  <span>${otherLang}</span>
</div>
<div class="art-tag">ARTICLE #${artNum} — ${category}</div>
<h2>${title || ""}</h2>
<div class="tagline-box">
  <p>${tagline}</p>
  <p class="credit">— THE ESSENTIALS., ARTICLE #${artNum}</p>
</div>
<div class="cols">${body}</div>
<div class="footer">
  <div>
    <div class="signoff">${signoff}</div>
    <div class="sbe">SBE</div>
  </div>
  <div class="sites">${websiteFR}<br>${websiteEN}</div>
</div>
</body>
</html>`;
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
  const safeTitle = (title || "article").slice(0, 35).replace(/[^a-zA-Z0-9\u00C0-\u024F\s_-]/g, "").replace(/\s+/g, "_");
  triggerDownload(blob, `Article_${artNum}_${lang.toUpperCase()}_${safeTitle}.txt`);
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
