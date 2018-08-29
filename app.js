var inquirer = require('inquirer');
var readdirp = require('readdirp');
var _ = require('lodash');
var fs = require('fs');
var jsdiff = require('diff');

let rootDir = "C:/natlab/code-comparator/code-comparator/test/";

var aFileList = [];
var aFinalList = [];
var aAddedFileList = [];
var aRemovedFileList = [];
var aSourceFileList = [];
var aTargetFileList = [];

var constants = {
  CHECK_DIRECTORY: "Check Directories"
};

var sourceSettings = {
  root: rootDir + 'src/',
  entryType: 'files'
};

var targetSettings = {
  root: rootDir + 'dest/',
  entryType: 'files'
};

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
    fnAsyncDirectoryRead(sourceSettings).then(function (result) {
      console.log("\nPromise Returned : Source List:")
      aSourceFileList = result;
      console.log(aSourceFileList);
      fnAsyncDirectoryRead(targetSettings).then(function (result) {
        console.log("\nPromise Returned : Target List:")
        aTargetFileList = result;
        console.log(aTargetFileList);
        fnCompareFileList(aSourceFileList, aTargetFileList);
        fnCompareFileContent();
      });
    });
  }
}

var fnCompareFileList = function (aSrcFileList, aDestFileList) {
  if (!aSrcFileList || !aDestFileList)
    return;

  aSrcFileList.forEach((srcElement) =>
    aDestFileList.forEach((destElement) => {
      console.log(destElement);
      if (srcElement.fileName == destElement.fileName) {
        aFinalList.push({
          srcFilePath : srcElement.fullPath,
          destFilePath : destElement.fullPath
        });
      }
    }));

  console.log("\nFinal Matching List:");
  console.log(aFinalList);

  console.log("\nAdded in Destination:");
  aAddedFileList = _.difference(aDestFileList, aSrcFileList);
  console.log(aAddedFileList);

  console.log("\nDeleted from Source:");
  aRemovedFileList = _.difference(aSrcFileList, aDestFileList);
  console.log(aRemovedFileList);
}

var fnCompareFileContent = function () {
  console.log("\nComparing File Content for Files available in both directories:");
  console.log(aFinalList[0]);

  var srcFileContent = fs.readFileSync(aFinalList[0].srcFilePath, "utf8");
  console.log(srcFileContent);
  var destFileContent = fs.readFileSync(aFinalList[0].destFilePath, "utf8");
  console.log(destFileContent);
  
  var diff = jsdiff.diffChars(srcFileContent, destFileContent);
  console.log(diff);

  //TODO : Logic to compute the difference between read files
  // diff.forEach(function (part) {
  //   // green for additions, red for deletions
  //   // grey for common parts
  //   let color = part.added ? 'green' : part.removed ? 'red' : 'grey';
  //   process.stderr.write(part.value[color]);
  // });
  
}

var fnAsyncDirectoryRead = function (oSettings) {
  return new Promise(function (resolve, reject) {
    readdirp(oSettings)
      .on('data', function (entry) {
        //console.log(entry);
        aFileList.push({
          fileName : entry.path,
          fullPath : entry.fullPath
        });
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