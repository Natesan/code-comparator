var fs = require('fs');
var path = require('path');
var readdirp = require('readdirp');
var inquirer = require('inquirer');
var _ = require('lodash');

let rootDir = "C:/natlab/code-comparator/code-comparator/test/";

var aFileList = [];
var aSourceFileList = [];
var aTargetFileList = [];

var constants = {
  CHECK_DIRECTORY: "Check Directories"};

inquirer.prompt([{
  type: 'list',
  name: 'action',
  message: 'What do you want to perform?',
  choices: [
    constants.CHECK_DIRECTORY
  ]
}]).then(answers => {
  initialize(answers);
});

var initialize = function (answers) {
  if (answers.action === constants.CHECK_DIRECTORY) {
    var sourceSettings = {
      root: rootDir + 'src/',
      entryType: 'files'
    };

    var targetSettings = {
      root: rootDir + 'dest/',
      entryType: 'files'
    };

    fnAsyncDirectoryRead(sourceSettings).then(function(result){
      console.log("\nPromise Returned : Source List:")
      aSourceFileList = result;
      console.log(aSourceFileList);
      fnAsyncDirectoryRead(targetSettings).then(function(result){
        console.log("\nPromise Returned : Target List:")
        aTargetFileList = result;
        console.log(aTargetFileList);
        //TODO: Perform File List comparison
        fnCompareFileList(aSourceFileList, aTargetFileList);
      });  
    });
  }
}

var fnCompareFileList = function(aSrcFileList, aDestFileList) {
  if (!aSrcFileList || !aDestFileList)
    return;

  var aFinalList = [];

  aSrcFileList.forEach((srcElement) =>
    aDestFileList.forEach((destElement)  => {
      if (srcElement == destElement) {
        aFinalList.push(srcElement);
      }
    }
    )); 

  console.log("\nFinal Matching List:");
  console.log(aFinalList);

  console.log("\nAdded in Destination");
  var aAddedFileList = _.difference(aDestFileList, aSrcFileList);
  console.log(aAddedFileList);

  console.log("\nDeleted from Source");
  var aRemovedFileList = _.difference(aSrcFileList, aDestFileList);
  console.log(aRemovedFileList);

}

var fnAsyncDirectoryRead = function (oSettings) {
  return new Promise(function(resolve, reject) {
    readdirp(oSettings)
    .on('data', function (entry) {
      //console.log(entry);
      aFileList.push(entry.path);
      //fnReadFileSync(entry.fullPath);
    })
    .on('warn', function (warn) {
      console.log("Warn: ", warn);
    })
    .on('error', function (err) {
      console.log("Error: ", err);
      reject(err);
    })
    .on('end', function () {
      resolve(aFileList);
      aFileList = [];
    });
  });
}