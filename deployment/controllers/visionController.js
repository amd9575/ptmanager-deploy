const vision = require('@google-cloud/vision');
const sharp = require('sharp');

const { Translate } = require('@google-cloud/translate').v2;
const translate = new Translate();
const client = new vision.ImageAnnotatorClient();
//Liste des objets pour lequels on doit detecter la couleur
const clothesObjects = ['vêtement', 'robe', 'pantalon', 'chaussure', 'sac', 't-shirt', 'pull', 'chemise', 'pantalon'];
const luggageObjects = ['valise', 'bagage', 'sac de voyage', 'sac à dos'];

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

function regrouperObjets(detectedNames) {
  const noms = detectedNames.map(n => n.toLowerCase());

  if (noms.includes("clé") && noms.includes("porte-clés")) return ["Trousseau de clés"];
  if (noms.includes("sac") && noms.includes("dos")) return ["Sac à dos"];
  if (noms.includes("sac") && noms.includes("voyage")) return ["Sac de voyage"];
  if (noms.includes("valise") || noms.includes("bagage")) return ["Valise"];
  if (noms.includes("portable") || noms.includes("téléphone")) return ["Téléphone portable"];

  // Sinon on retourne les 1ers noms traduits
  return [...new Set(detectedNames)].slice(0, 1);
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

// Fonction pour découper l'image selon une bounding box normalisée
async function cropImageFromBoundingBox(imageBuffer, boundingPoly) {
  // boundingPoly.normalizedVertices = [{x, y}, ...] avec x,y entre 0 et 1

  // Calcule les min/max des coordonnées
  const xs = boundingPoly.normalizedVertices.map(v => v.x);
  const ys = boundingPoly.normalizedVertices.map(v => v.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);

  // Charger l’image avec sharp pour obtenir ses dimensions exactes
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width;
  const height = metadata.height;

  // Calcul coordonnées en pixels
  const left = Math.round(xMin * width);
  const top = Math.round(yMin * height);
  const cropWidth = Math.round((xMax - xMin) * width);
  const cropHeight = Math.round((yMax - yMin) * height);

  // Découper l’image
  const croppedBuffer = await sharp(imageBuffer)
    .extract({ left, top, width: cropWidth, height: cropHeight })
    .toBuffer();

  return croppedBuffer;
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

//Detection de l'objet dans l'image en utilisant la spacialisation. plus précis que la labellisation 
async function detectObjectsWithLocalization(imageBase64) {
  try {
    // Appel à objectLocalization avec l'image en base64
    const [result] = await client.objectLocalization({ image: { content: imageBase64 } });
    const objects = result.localizedObjectAnnotations;

    // Parcours des objets détectés
    objects.forEach(object => {
      console.log(`Objet détecté : ${object.name}`);
      console.log(`Confiance : ${object.score}`);

      // Coordonnées normalisées de la boîte englobante
      console.log('Bounding box :');
      object.boundingPoly.normalizedVertices.forEach((v, i) =>
        console.log(`  Point ${i + 1}: (x=${v.x}, y=${v.y})`)
      );
    });

    return objects;

  } catch (error) {
    console.error('Erreur objectLocalization:', error);
    throw error;
  }
}
function appartientCategorie(objet, categorieList) {
  return categorieList.includes(objet.toLowerCase());
}

const analyzeImage = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Le fomat de l\'image est incorrect. Foormat de l\'image base64 requise.' });
  }

  try {
      console.log('Début analyse image');
      const imageBuffer = Buffer.from(imageBase64, 'base64');

    // Localiser objets
//const [localizationResult] = await client.objectLocalization({ image: { content: imageBase64 } });
      const [localizationResult] = await client.objectLocalization({ image: { content: imageBuffer } });

console.log('Résultat localisation obtenu');

      const localizedObjects = localizationResult.localizedObjectAnnotations;

//if (localizedObjects.length === 0) {
//   return res.status(404).json({ error: 'Aucun objet détecté.' });
//}

      // 🛑 Fallback si aucun objet localisé (ex : clés non reconnues)
      if (!localizedObjects.length) {
         console.warn("Aucun objet localisé, fallback sur labelDetection");

         const [labelResult] = await client.labelDetection({ image: { content: imageBuffer } });
         const labelNames = await extractRelevantTranslatedLabels(labelResult.labelAnnotations);
         const objets = regrouperObjets(labelNames);

         const [colorResult] = await client.imageProperties({ image: { content: imageBuffer } });
         const colorsRaw = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];

         const couleurs = colorsRaw.slice(0, 1).map(color => {
         const rgb = color.color;
         return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
        });

        return res.json({ objets, couleurs });
      }

    // Premier objet détecté
//    const mainObject = localizedObjects[0];
      const translatedNames = [];
      for (const obj of localizedObjects) {
        const name = await translateToFrench(obj.name);
        if (!isTooGeneric(name)) {
          translatedNames.push(name);
        }
      }
const objets = regrouperObjets(translatedNames);

console.log('Objet principal détecté:', mainObject.name);

    const translatedName = await translateToFrench(mainObject.name);

console.log('Nom traduit:', translatedName);

    if (isTooGeneric(translatedName)) {
      console.warn(`Nom trop générique détecté: ${translatedName}`);
    }

    // Décider d'afficher la couleur selon la catégorie
    const afficherCouleur = clothesObjects.includes(translatedName.toLowerCase()) ||
                           luggageObjects.includes(translatedName.toLowerCase());

    let couleurs = [];

    if (!afficherCouleur) {
      // Renvoi explicite en cas d'objet non pris en charge
        return res.json({
          objets: [translatedName || "inconnu"],
          couleurs: []
        });
    }
    else{
      // Découper image autour de l'objet
      const croppedImageBuffer = await cropImageFromBoundingBox(imageBuffer, mainObject.boundingPoly);
//const croppedBase64 = croppedImageBuffer.toString('base64');

      // Analyser couleurs sur zone recadrée
//const [colorResult] = await client.imageProperties({ image: { content: croppedBase64 } });
      const [colorResult] = await client.imageProperties({ image: { content: croppedImageBuffer } });
      const colorsRaw = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];

      // Garder la couleur dominante uniquement
      couleurs = colorsRaw.slice(0, 1).map(color => {
        const rgb = color.color;
        return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
      });
    }

    // Envoyer la réponse
    res.json({
      objets: [translatedName],
      couleurs
    });

  } catch (err) {
    if (err.code === 7) {
      console.error('PERMISSION_DENIED : accès API refusé.', err);
      return res.status(403).json({ error: 'Accès API refusé. Veuillez vérifier vos droits.' });
    } else if (err.code === 8 || err.code === 429) {
      console.error('RESOURCE_EXHAUSTED ou trop de requêtes : quota API épuisé.', err);
      return res.status(429).json({ error: 'Quota API épuisé. Réessayez plus tard.' });
    } else {
      console.error('Erreur serveur durant l’analyse Vision:', err);
      return res.status(500).json({ error: 'Erreur serveur durant l’analyse.' });
    }
  }
};

// --- Contrôleur principal utilisant labelDetection---

//const analyzeImage = async (req, res) => {
//  const { imageBase64 } = req.body;

//  if (!imageBase64) {
//    return res.status(400).json({ error: 'Image base64 requise.' });
//  }

//  console.log('Path vers les credentials :', process.env.GOOGLE_APPLICATION_CREDENTIALS);

//  try {
////const [labelResult] = await client.labelDetection({ image: { content: imageBase64 } });
//    const [localizationResult] = await client.objectLocalization({ image: { content: imageBase64 } });
//    const [colorResult] = await client.imageProperties({ image: { content: imageBase64 } });

//// const objets = await extractRelevantTranslatedLabels(labelResult.labelAnnotations);

   // Ici on récupère les objets détectés
//    const localizedObjects = localizationResult.localizedObjectAnnotations;

    // Traduction et filtrage identiques à votre fonction extractRelevantTranslatedLabels,
    // mais adaptée à partir de localizedObjects[].name
//    const objets = [];
//    for (const obj of localizedObjects) {
//      const nomTraduit = await translateToFrench(obj.name);
//      if (!isTooGeneric(nomTraduit)) {
//        objets.push(nomTraduit);
//      }
//      if (objets.length >= 3) break; // Limite max 3 objets
//    }


//    const colorsRaw = colorResult.imagePropertiesAnnotation?.dominantColors?.colors || [];
//    const couleurs = colorsRaw.slice(0, 3).map(color => {
//      const rgb = color.color;
//      return `#${toHex(rgb.red)}${toHex(rgb.green)}${toHex(rgb.blue)}`;
//    });

//    res.json({ objets, couleurs });
//  } catch (err) {
//    console.error('Erreur analyse Vision:', err);
//    res.status(500).json({ error: 'Erreur serveur durant l’analyse.' });
//  }
//};



module.exports = {
  analyzeImage,
  translateToFrench,
};

