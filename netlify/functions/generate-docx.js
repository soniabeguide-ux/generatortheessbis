import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, LevelFormat, HeadingLevel, ShadingType,
  PageOrientation, UnderlineType, Tab, TabStopType, TabStopPosition
} from "docx";

const NAVY = "1B2B5E";
const RED = "C0392B";
const GOLD = "C8A951";
const GRAY = "888888";

function esc(str) {
  return (str || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

function parseArticle(content) {
  const lines = content.split("\n");
  const blocks = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { blocks.push({ type: "empty" }); continue; }
    if (/^[IVX]+\s*—/.test(line) || /^Conclusion\b/.test(line)) {
      blocks.push({ type: "section", text: line });
    } else if (/^\*{3}[«"]/.test(line)) {
      const inner = line.replace(/\*{3}/g, "").trim();
      const di = inner.search(/\s*—\s*/);
      if (di > -1) {
        blocks.push({ type: "quote", text: inner.slice(0, di).replace(/^[«"]/, "").replace(/[»"]$/, "").trim(), author: inner.slice(di).replace(/\s*—\s*/, "").trim() });
      } else {
        blocks.push({ type: "quote", text: inner.replace(/^[«"]/, "").replace(/[»"]$/, "").trim(), author: "Dr Raoul Wafo" });
      }
    } else if (/^\d+\./.test(line)) {
      blocks.push({ type: "numbered", text: line.replace(/^\d+\.\s*/, "") });
    } else if (/^\[.+\]\(.+\)/.test(line)) {
      // skip markdown links
    } else if (line.startsWith("**") && line.endsWith("**")) {
      blocks.push({ type: "bold", text: line.slice(2, -2) });
    } else {
      blocks.push({ type: "para", text: line });
    }
  }
  return blocks;
}

function makeDocx(content, title, dateStr, artNum, category, lang, signoff) {
  const blocks = parseArticle(content);
  const isEN = lang === "en";
  const website = isEN ? "theessentialsen.wordpress.com" : "theessentialsfr.wordpress.com";
  const otherWebsite = isEN ? "theessentialsfr.wordpress.com" : "theessentialsen.wordpress.com";
  const readLink = isEN ? "Lire l'article en Français ici" : "Lire l'article en Anglais ici";
  const foundedLabel = isEN ? "FOUNDED ON TRUTH" : "FONDÉ SUR LA VÉRITÉ";

  const children = [];

  // DATE line (right-aligned, small)
  children.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 0 },
    children: [new TextRun({ text: esc(dateStr), font: "Arial", size: 18, color: GRAY })]
  }));

  // TITLE bold large
  children.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: " ", font: "Arial", size: 22 })]
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: 120 },
    children: [new TextRun({ text: esc(title), font: "Georgia", size: 56, bold: true, color: NAVY })]
  }));

  // Read link in other language
  children.push(new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text: esc(readLink), font: "Georgia", size: 20, color: RED, italics: true })]
  }));

  // Horizontal rule (border bottom on empty paragraph)
  children.push(new Paragraph({
    spacing: { before: 40, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 1 } },
    children: []
  }));

  // Article body
  let listNum = 0;
  for (const block of blocks) {
    if (block.type === "empty") {
      children.push(new Paragraph({ spacing: { before: 40, after: 40 }, children: [] }));
    } else if (block.type === "section") {
      listNum = 0;
      children.push(new Paragraph({
        spacing: { before: 240, after: 80 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: NAVY, space: 2 } },
        children: [new TextRun({ text: esc(block.text), font: "Georgia", size: 28, bold: true, color: NAVY })]
      }));
    } else if (block.type === "quote") {
      children.push(new Paragraph({
        spacing: { before: 80, after: 80 },
        indent: { left: 500 },
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: GOLD, space: 6 } },
        children: [
          new TextRun({ text: `\u00AB\u202F${esc(block.text)}\u202F\u00BB`, font: "Georgia", size: 22, italics: true, color: NAVY }),
          new TextRun({ text: `  \u2014 ${esc(block.author)}`, font: "Arial", size: 18, bold: true, color: "555555" }),
        ]
      }));
    } else if (block.type === "numbered") {
      listNum++;
      children.push(new Paragraph({
        spacing: { before: 40, after: 40 },
        indent: { left: 400, hanging: 260 },
        children: [
          new TextRun({ text: `${listNum}.\t`, font: "Georgia", size: 22, color: NAVY, bold: true }),
          new TextRun({ text: esc(block.text), font: "Georgia", size: 22 }),
        ]
      }));
    } else if (block.type === "bold") {
      children.push(new Paragraph({
        spacing: { before: 60, after: 40 },
        children: [new TextRun({ text: esc(block.text), font: "Georgia", size: 22, bold: true, color: NAVY })]
      }));
    } else if (block.type === "para") {
      // Handle inline bold
      const parts = block.text.split(/(\*\*[^*]+\*\*)/g);
      const runs = parts.map(p => {
        if (p.startsWith("**")) {
          return new TextRun({ text: esc(p.slice(2, -2)), font: "Georgia", size: 22, bold: true });
        }
        return new TextRun({ text: esc(p), font: "Georgia", size: 22 });
      });
      children.push(new Paragraph({ spacing: { before: 40, after: 60 }, children: runs }));
    }
  }

  // Horizontal rule
  children.push(new Paragraph({
    spacing: { before: 120, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: GOLD, space: 1 } },
    children: []
  }));

  // Signoff
  children.push(new Paragraph({
    spacing: { before: 80, after: 20 },
    children: [new TextRun({ text: esc(signoff), font: "Georgia", size: 20, italics: true, color: NAVY })]
  }));

  // Websites
  children.push(new Paragraph({
    spacing: { before: 20, after: 20 },
    children: [
      new TextRun({ text: website, font: "Arial", size: 18, color: NAVY }),
      new TextRun({ text: "      ", font: "Arial", size: 18 }),
      new TextRun({ text: otherWebsite, font: "Arial", size: 18, color: GRAY }),
    ]
  }));

  const doc = new Document({
    numbering: {
      config: [{
        reference: "myNumbers",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
      }]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }
        }
      },
      children
    }]
  });

  return doc;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { content, title, dateStr, artNum, category, lang, signoff } = JSON.parse(event.body);
    const doc = makeDocx(content, title, dateStr, artNum, category, lang, signoff);
    const buffer = await Packer.toBuffer(doc);
    const base64 = buffer.toString("base64");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="Article_${artNum}_${lang.toUpperCase()}.docx"`,
        "Access-Control-Allow-Origin": "*",
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
