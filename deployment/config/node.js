const fs = require('fs');

const json = require('./service-account.json');
const encoded = JSON.stringify(json);

console.log(encoded);
