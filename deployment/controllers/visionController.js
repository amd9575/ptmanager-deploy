const vision = require('@google-cloud/vision');
const { Translate } = require('@google-cloud/translate').v2;
const sharp = require('sharp');

const client = new vision.ImageAnnotatorClient();
const translate = new Translate();

function toHex(component) {
  const hex = (component || 0).toString(16).toUpperCase();
  return hex.length === 1 ? '0' + hex : hex;
}

async function translateToFrench(text) {
  try {
    const [translated] = await translate.translate(text, 'fr');
    return translated;
  } catch (error) {
    console.error("Erreur de traduction :", error.message);
    return text; // fallback si erreur
  }
}

async function cropToMainObject(base64Image) {
  const [cropResult] = await client.cropHints({
    image: { content: base64Image }
  });

  const hints = cropResult.cropHintsAnnotation?.cropHints;
  if (!hints || hints.length === 0) return base64Image;

  const bounds = hints[0].boundingPoly.vertices;
  const [x, y, x2, y2] = [
    bounds[0].x || 0,
    bounds[0].y || 0,
    bounds[2].x || 0,
    bounds[2].y || 0
  ];
  const width = x2 - x;
  const height = y2 - y;

  const imageBuffer = Buffer.from(base64Image, "base64");

  const croppedBuffer = await sharp(imageBuffer)
    .extract({ left: x, top: y, width, height })
    .toBuffer();

  return croppedBuffer.toString("base64");
}

const analyzeImage = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image base64 requise.' });
  }

  console.log('Path vers les credentials :', process.env.GOOGLE_APPLICATION_CREDENTIALS);

  try {
    // 📸 Rogner l’image pour isoler l’objet principal
    const croppedBase64 = await cropToMainObject(imageBase64);

    // 🧠 Détection des objets
    const [labelResult] = await client.labelDetection({ image: { content: croppedBase64 } });
    const labels = labelResult.labelAnnotations
      .slice(0, 3) // Limite à 3 labels max
      .map(label => label.description);

//    const translatedLabels = await Promise.all(labels.map(translateToFrench));
   const labels = await Promise.all(labelResult.labelAnnotations
    .slice(0, 2) // Limite à 2 objets max
    .map(label => translateToFrench(label.description))
   );


    // 🎨 Couleurs dominantes
    const [colorResult] = await client.imageProperties({ image: { content: croppedBase64 } });
    const colorsRaw = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];

    const colors = colorsRaw.slice(0, 3).map(color => {
      const rgb = color.color;
      return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
    });

    res.json({ objets: translatedLabels, couleurs: colors });

  } catch (err) {
    console.error('Erreur analyse Vision:', err);
    res.status(500).json({ error: 'Erreur serveur durant l’analyse.' });
  }
};

module.exports = {
  analyzeImage,
  translateToFrench
};

