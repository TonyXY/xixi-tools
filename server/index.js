const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3003' }));
app.use(express.json());

// Root from which user folders are discovered. Adjust if needed.
const BASE_ROOT = '/Users/xiaoyang';
let currentFolder = null;
const TMP_DIR = path.join(__dirname, 'tmp');
const THUMB_DIR = path.join(TMP_DIR, 'thumbs');

fs.mkdirSync(THUMB_DIR, { recursive: true });

const SUPPORTED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']);

function isPhoto(file) {
  return SUPPORTED_EXT.has(path.extname(file).toLowerCase());
}

function walkDir(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(walkDir(full));
      } else if (entry.isFile()) {
        if (isPhoto(full)) {
          results.push(full);
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return results;
}

app.get('/api/folders', (req, res) => {
  let folders = [];
  try {
    const entries = fs.readdirSync(BASE_ROOT, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        folders.push({ name: e.name, path: path.join(BASE_ROOT, e.name) });
      }
    }
  } catch (err) {
    // ignore if base root doesn't exist
    folders = [];
  }
  res.json({ folders });
});

app.post('/api/select-folder', (req, res) => {
  const { folderPath } = req.body || {};
  if (!folderPath) {
    return res.status(400).json({ error: 'folderPath required' });
  }
  try {
    const stat = fs.statSync(folderPath);
    if (!stat.isDirectory()) throw new Error('not dir');
    currentFolder = folderPath;
    res.json({ ok: true, currentFolder });
  } catch (err) {
    res.status(400).json({ error: 'Invalid folder path' });
  }
});

app.get('/api/photos', (req, res) => {
  if (!currentFolder) {
    return res.status(400).json({ error: 'No folder selected' });
  }
  const files = walkDir(currentFolder);
  const photos = files.map(p => path.relative(currentFolder, p));
  res.json({ currentFolder, photos });
});

app.get('/api/thumbnail/*', async (req, res) => {
  if (!currentFolder) return res.status(400).json({ error: 'No folder selected' });
  const relPath = req.params[0];
  const abs = path.join(currentFolder, relPath);
  if (!fs.existsSync(abs)) return res.status(404).end();
  const ext = path.extname(abs).toLowerCase();
  if (!SUPPORTED_EXT.has(ext)) return res.status(415).end();

  // thumbnail cache key using relative path
  const thumbName = relPath.split(path.sep).join('_');
  const thumbPath = path.join(THUMB_DIR, thumbName);
  try {
    if (!fs.existsSync(thumbPath)) {
      await sharp(abs)
        .resize(300, 300, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
    }
    res.sendFile(thumbPath);
  } catch (e) {
    res.status(500).json({ error: 'Thumbnail generation failed' });
  }
});

app.get('/api/photo/*', (req, res) => {
  if (!currentFolder) return res.status(400).json({ error: 'No folder selected' });
  const relPath = req.params[0];
  const abs = path.join(currentFolder, relPath);
  if (!fs.existsSync(abs)) return res.status(404).end();
  res.sendFile(abs);
});

const PORT = 3005;
app.listen(PORT, () => console.log(`Photo Gallery server listening on http://localhost:${PORT}`));
