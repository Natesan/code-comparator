var fs = require('fs');
var path = require('path');
var readdirp = require('readdirp');
var inquirer = require('inquirer');

let rootDir = "C:/natlab/code-comparator/code-comparator/test/";

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

    
    readdirp(sourceSettings)
    .on('data', function (entry) {
      aSourceFileList.push(entry.path);
      //fnReadFileSync(entry.fullPath);
    })
    .on('warn', function (warn) {
      console.log("Warn: ", warn);
    })
    .on('error', function (err) {
      console.log("Error: ", err);
    })
    .on('end', function () {
      console.log("\nResult:");
      console.log("Source Directory");
      console.log(aSourceFileList);
    });
    
    //fnTraverseDirectory(sourceSettings);
   
    readdirp(targetSettings)
    .on('data', function (entry) {
      aTargetFileList.push(entry.path);
      //fnReadFileSync(entry.fullPath);
    })
    .on('warn', function (warn) {
      console.log("Warn: ", warn);
    })
    .on('error', function (err) {
      console.log("Error: ", err);
    })
    .on('end', function () {
      console.log("\nResult:");
      console.log("Target Directory");
      console.log(aTargetFileList);
    });
  }
}

var fnTraverseDirectory = function (oSettings) {
  // Iterate recursively through a folder
}

var fnPrintResult = function () {
  console.log("Result:");
  console.log(aSourceFileList);
  console.log(aTargetFileList);
}