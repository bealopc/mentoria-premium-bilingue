const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const ALLOWED_LANGS = ['es', 'en'];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Cargar Base de Datos
const getData = () => JSON.parse(fs.readFileSync('./database.json', 'utf8'));

const sanitizeToPlainText = (raw) => {
  if (typeof raw !== 'string') return '';

  const withoutTags = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return withoutTags
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildTranslations = (translations, lang) => {
  const t = {};
  Object.keys(translations).forEach((k) => {
    const item = translations[k] || {};
    t[k] = typeof item[lang] === 'string' ? item[lang] : '';
  });
  return t;
};

const pageMiddleware = (req, res, next) => {
  const langParam = req.params.lang;

  if (!langParam) {
    const query = new URLSearchParams(req.query).toString();
    return res.redirect(`/es${query ? `?${query}` : ''}`);
  }

  if (!ALLOWED_LANGS.includes(langParam)) {
    const query = new URLSearchParams(req.query).toString();
    return res.redirect(`/es${query ? `?${query}` : ''}`);
  }

  const db = getData();
  const isAdmin = req.query.admin === 'true';
  const t = buildTranslations(db.translations, langParam);

  req.pageData = {
    db,
    t,
    lang: langParam,
    isAdmin
  };

  return next();
};

app.get('/', (req, res) => {
  const query = new URLSearchParams(req.query).toString();
  return res.redirect(`/es${query ? `?${query}` : ''}`);
});

app.get('/:lang?', pageMiddleware, (req, res) => {
  const { db, t, lang, isAdmin } = req.pageData;

  return res.render('index', {
    t,
    lang,
    isAdmin,
    settings: db.settings,
    courses: db.courses
  });
});

app.post('/api/update', (req, res) => {
  try {
    const { key, lang, value } = req.body;

    if (typeof key !== 'string' || !/^[a-z0-9_]+$/i.test(key)) {
      return res.status(400).json({ success: false, error: 'key inválida' });
    }

    if (typeof lang !== 'string' || !ALLOWED_LANGS.includes(lang)) {
      return res.status(400).json({ success: false, error: 'lang inválido' });
    }

    const db = getData();

    if (!db.translations[key]) {
      return res.status(404).json({ success: false, error: 'key no encontrada' });
    }

    const sanitizedValue = sanitizeToPlainText(value);
    db.translations[key][lang] = sanitizedValue;

    fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));

    return res.json({ success: true });
  } catch (error) {
    console.error('Error en /api/update:', error);
    return res.status(500).json({ success: false, error: 'error interno' });
  }
});

app.listen(PORT, () => {
  console.log(`Web bilingüe en http://localhost:${PORT}/es?admin=true`);
});
