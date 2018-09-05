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
      //console.log("\nPromise Returned : Source List:")
      aSourceFileList = result;
      //console.log(aSourceFileList);
      fnAsyncDirectoryRead(targetSettings).then(function (result) {
        //console.log("\nPromise Returned : Target List:")
        aTargetFileList = result;
        //console.log(aTargetFileList);
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
      if (srcElement == destElement) {
        aFinalList.push(srcElement);
      }
    }));

  console.log("\nFinal Matching List:" + aFinalList.length);
  console.log(aFinalList);

  aAddedFileList = _.difference(aDestFileList, aSrcFileList);
  console.log("\nAdded in Destination:" + aAddedFileList.length);
  console.log(aAddedFileList);

  aRemovedFileList = _.difference(aSrcFileList, aDestFileList);
  console.log("\nDeleted from Source:" + aRemovedFileList.length);
  console.log(aRemovedFileList);
}

var fnCompareFileContent = function () {
  console.log("\nComparing File Content for Files available in both directories:");
  var aDiffList = [];

  for (i=0; i < aFinalList.length; i++) {
    var srcFileContent = fs.readFileSync(rootDir + '/src/' + aFinalList[i], "utf8");
    var destFileContent = fs.readFileSync(rootDir + '/dest/' + aFinalList[i], "utf8");
    
    var diff = jsdiff.structuredPatch(rootDir + '/src/' + aFinalList[i], rootDir + '/dest/' + aFinalList[i],
    srcFileContent, destFileContent,
    '/src/' + aFinalList[i], '/dest/' + aFinalList[i]);
    console.log("\nDifference between '" + diff.oldHeader + "' and '" + diff.newHeader + "'");
    console.log(diff.hunks[0].lines);
    if (diff.hunks[0] && diff.hunks[0].lines) {
      aDiffList.push(diff);
    }  
  }
}

var fnAsyncDirectoryRead = function (oSettings) {
  return new Promise(function (resolve, reject) {
    readdirp(oSettings)
      .on('data', function (entry) {
        //console.log(entry);
        aFileList.push(entry.path);

        // aFileList.push({
        //   fileName : entry.path,
        //   fullPath : entry.fullPath
        // });
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