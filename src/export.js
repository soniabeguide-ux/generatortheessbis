// ─── DOCX via Netlify Function ────────────────────────────────────────────────

export async function downloadDocx(content, title, dateStr, lang, meta) {
  const artNum = meta?.article_number || "XXX";
  const signoff = lang === "fr"
    ? "Tiens bon, ton témoignage n'est qu'une question de temps. On est ensemble."
    : "Stay strong, your testimony is only a matter of time. We're in this together.";

  try {
    const response = await fetch("/.netlify/functions/generate-docx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content, title, dateStr,
        artNum,
        category: lang === "fr" ? (meta?.category_fr || "FAMILLE & SAGESSE") : translateCategory(meta?.category_fr),
        lang, signoff,
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const safeTitle = (title || "article").slice(0, 35).replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
    triggerDownload(blob, `Article_${artNum}_${lang.toUpperCase()}_${safeTitle}.docx`);
    return { ok: true };
  } catch (e) {
    console.error("DOCX error:", e);
    return { ok: false, error: e.message };
  }
}

function translateCategory(cat) {
  const map = {
    "FAMILLE & SAGESSE": "FAMILY & WISDOM",
    "FOI & SURNATUREL": "FAITH & SUPERNATURAL",
    "PRIÈRE & INTERCESSION": "PRAYER & INTERCESSION",
    "IDENTITÉ & DESTINÉE": "IDENTITY & DESTINY",
    "MARIAGE & COUPLE": "MARRIAGE & RELATIONSHIPS",
    "FINANCES & PROSPÉRITÉ": "FINANCES & PROSPERITY",
    "LEADERSHIP & SERVICE": "LEADERSHIP & SERVICE",
    "ÉVANGÉLISATION": "EVANGELISM",
    "LOUANGE & ADORATION": "PRAISE & WORSHIP",
    "AUTRE": "OTHER",
  };
  return map[cat] || cat;
}

// ─── HTML → PDF ───────────────────────────────────────────────────────────────

function markdownToHtml(md) {
  const lines = md.split("\n");
  let html = "";
  let inOL = false;
  const closeList = () => { if (inOL) { html += "</ol>"; inOL = false; } };
  const fmt = s => s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) { closeList(); continue; }
    if (/^[IVX]+\s*—/.test(line) || /^Conclusion\b/.test(line)) {
      closeList(); html += `<h3>${fmt(line)}</h3>`;
    } else if (/^\d+\./.test(line)) {
      if (!inOL) { html += "<ol>"; inOL = true; }
      html += `<li>${fmt(line.replace(/^\d+\.\s*/, ""))}</li>`;
    } else if (/^\*{3}[«"]/.test(line)) {
      closeList();
      const inner = line.replace(/\*{3}/g, "").trim();
      const di = inner.search(/\s*—\s*/);
      if (di > -1) {
        const quote = inner.slice(0, di).replace(/^[«"]/, "").replace(/[»"]$/, "");
        const author = inner.slice(di).replace(/\s*—\s*/, "");
        html += `<blockquote><span class="qt">«\u202F${quote}\u202F»</span><cite>${author}</cite></blockquote>`;
      } else {
        const quote = inner.replace(/^[«"]/, "").replace(/[»"]$/, "");
        html += `<blockquote><span class="qt">«\u202F${quote}\u202F»</span><cite>Dr Raoul Wafo</cite></blockquote>`;
      }
    } else if (line.startsWith("**") && line.endsWith("**")) {
      closeList(); html += `<p><strong>${line.slice(2,-2)}</strong></p>`;
    } else if (/^\[.+\]\(.+\)/.test(line)) {
      closeList();
    } else {
      closeList(); html += `<p>${fmt(line)}</p>`;
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
  const category = lang === "fr" ? (meta?.category_fr || "FAMILLE & SAGESSE") : translateCategory(meta?.category_fr);
  const founded = lang === "fr" ? "FONDÉ SUR LA VÉRITÉ" : "FOUNDED ON TRUTH";
  const signoff = lang === "fr"
    ? "Tiens bon, ton témoignage n'est qu'une question de temps. On est ensemble."
    : "Stay strong, your testimony is only a matter of time. We're in this together.";
  const author = "Sonia Beguide";
  const tagline = lang === "fr"
    ? "«\u202FTu n'es pas victime mais victorieuse. Le diable te hait parce qu'il te craint.\u202F»"
    : '"You are not a victim — you are victorious. The devil hates you because he fears you."';
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
.logo-name{font-family:'Playfair Display',Georgia,serif;font-size:28pt;color:#1B2B5E;font-weight:700}
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
.foot{border-top:1.5px solid #1B2B5E;margin-top:14px;padding-top:7px;display:flex;justify-content:space-between;align-items:flex-end}
.foot .so{font-size:9pt;color:#1B2B5E;font-style:italic}
.foot .auth{font-size:9pt;font-family:Arial,sans-serif;font-weight:700;color:#1B2B5E;margin-top:3px}
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
<div class="foot">
  <div><div class="so">${signoff}</div><div class="auth">${author}</div></div>
  <div class="si">🇫🇷 ${websiteFR}<br>🇺🇸 ${websiteEN}</div>
</div>
</body></html>`;
}

export function downloadPdfHtml(content, title, dateStr, lang, meta) {
  const html = buildPdfHtml(content, title, dateStr, lang, meta);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  triggerDownload(blob, `The_Essentials_Article_${meta?.article_number || "XXX"}_${lang.toUpperCase()}.html`);
}

export function downloadText(content, title, lang, meta) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const safeTitle = (title || "article").slice(0, 35).replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  triggerDownload(blob, `Article_${meta?.article_number || "XXX"}_${lang.toUpperCase()}_${safeTitle}.txt`);
}

// ─── Miniature ────────────────────────────────────────────────────────────────

export async function downloadThumbnail(articleFR, articleEN, meta) {
  const artNum = meta?.article_number || "XXX";
  const titleFR = meta?.title_fr || "";
  const titleEN = meta?.title_en || "";

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");

  // Background
  const grad = ctx.createLinearGradient(0, 0, 1280, 720);
  grad.addColorStop(0, "#F5F3EE");
  grad.addColorStop(1, "#EDE8DF");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 720);

  // Gold accent bar top
  ctx.fillStyle = "#C8A951";
  ctx.fillRect(0, 0, 1280, 6);

  // FR panel (top half)
  const drawPanel = (x, y, w, h, titleFR_text, titleEN_text) => {
    // FR top panel
    ctx.fillStyle = "#1B2B5E";
    ctx.fillRect(x, y, w, h / 2 - 4);
    ctx.fillStyle = "#C0392B";
    ctx.font = "bold 52px Georgia, serif";
    ctx.fillText("POURQUOI LE", x + 40, y + 70);
    ctx.fillStyle = "#C0392B";
    ctx.font = "bold 72px Georgia, serif";
    ctx.fillText("DIABLE", x + 40, y + 155);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 52px Georgia, serif";
    ctx.fillText("HAIT LES FEMMES", x + 40, y + 230);

    // Gold line
    ctx.fillStyle = "#C8A951";
    ctx.fillRect(x + 40, y + 250, 200, 4);

    // EN bottom panel
    ctx.fillStyle = "#EDE8DF";
    ctx.fillRect(x, y + h / 2 + 4, w, h / 2 - 4);
    ctx.fillStyle = "#1B2B5E";
    ctx.font = "bold 46px Georgia, serif";
    ctx.fillText("WHY THE", x + 40, y + h / 2 + 60);
    ctx.fillStyle = "#C0392B";
    ctx.font = "bold 72px Georgia, serif";
    ctx.fillText("DEVIL", x + 40, y + h / 2 + 145);
    ctx.fillStyle = "#1B2B5E";
    ctx.font = "bold 46px Georgia, serif";
    ctx.fillText("HATES WOMEN", x + 40, y + h / 2 + 210);
  };

  // Use provided titles if available
  ctx.fillStyle = "#1B2B5E";
  ctx.fillRect(0, 6, 1280, 714);

  // Two banners
  const bannerH = 352;
  // FR banner
  ctx.fillStyle = "#1B2B5E";
  ctx.fillRect(0, 6, 1280, bannerH);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 40px Arial, sans-serif";
  ctx.fillText(titleFR.toUpperCase() || "ARTICLE #" + artNum, 60, 80);
  ctx.fillStyle = "#C8A951";
  ctx.fillRect(60, 100, 300, 4);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.font = "22px Arial, sans-serif";
  ctx.fillText("The Essentials. — Publication #" + artNum, 60, 140);

  // EN banner
  ctx.fillStyle = "#F5F3EE";
  ctx.fillRect(0, 6 + bannerH + 4, 1280, bannerH);
  ctx.fillStyle = "#1B2B5E";
  ctx.font = "bold 40px Arial, sans-serif";
  ctx.fillText(titleEN.toUpperCase() || "ARTICLE #" + artNum, 60, 6 + bannerH + 80);
  ctx.fillStyle = "#C8A951";
  ctx.fillRect(60, 6 + bannerH + 100, 300, 4);
  ctx.fillStyle = "#888";
  ctx.font = "22px Arial, sans-serif";
  ctx.fillText("The Essentials. — Publication #" + artNum, 60, 6 + bannerH + 140);

  // Bottom gold bar
  ctx.fillStyle = "#C8A951";
  ctx.fillRect(0, 714, 1280, 6);

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      triggerDownload(blob, `Miniature_${artNum}.png`);
      resolve({ ok: true });
    }, "image/png");
  });
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
