const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();
const client = new vision.ImageAnnotatorClient();

// --- Utilitaires de conversion ---
function toHex(component) {
  const hex = (component || 0).toString(16).toUpperCase();
  return hex.length === 1 ? '0' + hex : hex;
}

// --- Vocabulaire trop générique à filtrer ---
const genericTerms = [
  "objet", "chose", "élément", "accessoire", "truc", "matériau",
  "surface", "fond", "conception", "modèle", "outil", "composant"
];

function isTooGeneric(term) {
  return genericTerms.includes(term.toLowerCase());
}

// --- Traduction via Google Translate API ---
async function translateToFrench(text) {
  try {
    const [translated] = await translate.translate(text, 'fr');
    return translated;
  } catch (error) {
    console.error("Erreur de traduction :", error.message);
    return text; // fallback en cas d’erreur
  }
}

// --- Extraction et filtrage intelligent des labels ---
async function extractRelevantTranslatedLabels(labelAnnotations, max = 3) {
  // 1. Filtrer ceux qui ont un score raisonnable (ex: > 0.6)
  const filteredByScore = labelAnnotations
    .filter(label => label.score >= 0.6)
    .sort((a, b) => b.score - a.score);

  const results = [];

  for (const label of filteredByScore) {
    if (results.length >= max) break;

    const isGeneric = isTooGeneric(label.description);
    const translated = await translateToFrench(label.description);

    // 2. Vérifie que la traduction n’est pas trop générique non plus
    if (!isGeneric && !isTooGeneric(translated)) {
      results.push(translated);
    }
  }

  // 3. Fallback : si aucun résultat pertinent, prendre le top label (même générique)
  if (results.length === 0 && labelAnnotations.length > 0) {
    const fallbackTranslated = await translateToFrench(labelAnnotations[0].description);
    results.push(fallbackTranslated);
  }

  return results;
}

// --- Contrôleur principal ---
const analyzeImage = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image base64 requise.' });
  }

  console.log('Path vers les credentials :', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  try {
    const [labelResult] = await client.labelDetection({ image: { content: imageBase64 } });
    const [colorResult] = await client.imageProperties({ image: { content: imageBase64 } });

    const objets = await extractRelevantTranslatedLabels(labelResult.labelAnnotations);

    const colorsRaw = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const couleurs = colorsRaw.slice(0, 3).map(color => {
      const rgb = color.color;
      return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
    });

    res.json({ objets, couleurs });
  } catch (err) {
    console.error('Erreur analyse Vision:', err);
    res.status(500).json({ error: 'Erreur serveur durant l’analyse.' });
  }
};

module.exports = {
  analyzeImage,
  translateToFrench,
};

