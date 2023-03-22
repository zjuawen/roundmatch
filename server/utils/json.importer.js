const fs = require('fs');
const readline = require('readline');
const db = require("../models");

const importer = {};

var _modelName;

async function insertRec(line) {
  // console.log(row);
  // code to insert the record
  // _modelName

  // console.log(line);
  var obj = JSON.parse(line);
  // console.log(obj);

  await db[_modelName].create(obj);
}

function process(filename) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filename),
    // output: process.stdout,
    console: false
  });

  var count = 0;
  rl.on('line', async function(line) {
    count++;
    // console.log('No: '+ count);
    // if( count > 1){
    //   return;
    // }
    await insertRec(line);
  });


  rl.on('close', () => {
    console.log('total: ' + count);
  });

}

importer.process = (folder, model) => {
  _modelName = model;
  console.log('processing: ' + _modelName);

  let filename = folder + model + '.json'
  process(filename)

};

importer.batchProcess = (folder, model) => {
  _modelName = model

  var dirFiles = fs.readdirSync(folder);
  console.log(dirFiles);

  for (let fileName of dirFiles) {
    if( !fileName.startsWith(model)){
      continue
    }
    // console.log(folder + fileName)
    process(folder + fileName)
  }

};

module.exports = importer;