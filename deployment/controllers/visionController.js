const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient();

const analyzeImage = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image base64 requise.' });
  }

  try {
    const [labelResult] = await client.labelDetection({
      image: { content: imageBase64 },
    });

    const [colorResult] = await client.imageProperties({
      image: { content: imageBase64 },
    });

    const labels = labelResult.labelAnnotations.map(label => label.description);

    const colorsRaw = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
    const colors = colorsRaw.slice(0, 3).map(color => {
      const rgb = color.color;
      return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
    });

    res.json({ objets: labels, couleurs: colors });
  } catch (err) {
    console.error('Erreur analyse Vision:', err);
    res.status(500).json({ error: 'Erreur serveur durant l’analyse.' });
  }
};

function toHex(component) {
  const hex = (component || 0).toString(16).toUpperCase();
  return hex.length === 1 ? '0' + hex : hex;
}

module.exports = { analyzeImage };

