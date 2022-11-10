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

importer.process = (folder, model) => {
  _modelName = model;
  console.log('processing: ' + _modelName);

  const rl = readline.createInterface({
    input: fs.createReadStream(folder + model + '.json'),
    // output: process.stdout,
    console: false
  });

  var count = 0;
  rl.on('line', async function(line){
    count++;
    // console.log('No: '+ count);
    // if( count > 1){
    //   return;
    // }
    await insertRec(line);
  });


  rl.on('close', () => {
    console.log('total: '+ count);
  });

  // return count;
};

module.exports = importer;