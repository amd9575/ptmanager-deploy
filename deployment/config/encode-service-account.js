const fs = require('fs');
const path = require('path');

// Chemin vers ton fichier service-account.json
const filePath = path.join(__dirname, 'service-account.json');

// Lire le fichier
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Erreur lors de la lecture du fichier :', err);
    return;
  }

  try {
    const json = JSON.parse(data);
    const encoded = JSON.stringify(json);
    console.log('Voici la version encodée à copier :\n');
    console.log(encoded);
  } catch (parseErr) {
    console.error('Erreur de parsing JSON :', parseErr);
  }
});

