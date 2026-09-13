import zlib from "node:zlib";

function looksLikeText(content) {
  if (!content.length) return false;
  let bad = 0;
  const sample = content.slice(0, 2000);
  for (const ch of sample) {
    const code = ch.charCodeAt(0);
    if (code === 9 || code === 10 || code === 13) continue;
    if (code < 32 || code === 65533) bad += 1;
  }
  return bad / sample.length < 0.05;
}

export function extractTextFiles(base64, options = {}) {
  const maxFiles = options.maxFiles ?? 12;
  const maxFileChars = options.maxFileChars ?? 15000;
  const maxTotalChars = options.maxTotalChars ?? 100000;

  const buf = Buffer.from(base64, "base64");
  let eocd = -1;
  const scanStart = Math.max(0, buf.length - 65558);
  for (let i = buf.length - 22; i >= scanStart; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("not a zip");

  const count = buf.readUInt16LE(eocd + 10);
  let offset = buf.readUInt32LE(eocd + 16);
  const entries = [];

  for (let n = 0; n < count && entries.length < 100; n += 1) {
    if (buf.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buf.readUInt16LE(offset + 10);
    const compSize = buf.readUInt32LE(offset + 20);
    const nameLen = buf.readUInt16LE(offset + 28);
    const extraLen = buf.readUInt16LE(offset + 30);
    const commentLen = buf.readUInt16LE(offset + 32);
    const localOffset = buf.readUInt32LE(offset + 42);
    const name = buf.slice(offset + 46, offset + 46 + nameLen).toString("utf8");
    offset += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith("/") || name.includes("..")) continue;
    entries.push({ name, method, compSize, localOffset });
  }

  const out = [];
  let total = 0;
  for (const entry of entries) {
    if (out.length >= maxFiles || total >= maxTotalChars) break;
    try {
      const nameLen = buf.readUInt16LE(entry.localOffset + 26);
      const extraLen = buf.readUInt16LE(entry.localOffset + 28);
      const dataStart = entry.localOffset + 30 + nameLen + extraLen;
      const data = buf.slice(dataStart, dataStart + entry.compSize);
      let raw;
      if (entry.method === 0) raw = data;
      else if (entry.method === 8) raw = zlib.inflateRawSync(data);
      else continue;
      const content = raw.toString("utf8");
      if (!looksLikeText(content)) continue;
      const clipped = content.slice(0, maxFileChars);
      total += clipped.length;
      out.push({ name: entry.name, content: clipped });
    } catch {
    }
  }
  return out;
}
