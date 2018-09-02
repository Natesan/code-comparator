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
      if (srcElement.fileName == destElement.fileName) {
        //console.log(srcElement);
        aFinalList.push({
          srcFilePath : srcElement.fullPath,
          srcFileName : srcElement.fileName,
          destFilePath : destElement.fullPath,
          destFileName : destElement.fileName
        });
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
  //console.log(aFinalList[0]);

  var srcFileContent = fs.readFileSync(aFinalList[0].srcFilePath, "utf8");
  //console.log(srcFileContent);
  var destFileContent = fs.readFileSync(aFinalList[0].destFilePath, "utf8");
  //console.log(destFileContent);
  
  //var diff = jsdiff.diffLines(srcFileContent, destFileContent, {newlineIsToken: true});
  var aDiffList = [];
  
  var diff1 = jsdiff.structuredPatch(aFinalList[0].srcFilePath, aFinalList[0].destFilePath,
    srcFileContent, destFileContent,
    aFinalList[0].srcFileName, aFinalList[0].destFileName);
  console.log(diff1);
  console.log(diff1.hunks[0].lines);
  
  
  // for (i=0; i<aFinalList.length; i++) {
  //   var diff = jsdiff.structuredPatch(aFinalList[i].srcFilePath, aFinalList[i].destFilePath, 
  //                                     srcFileContent, destFileContent,
  //                                     aFinalList[i].srcFileName, aFinalList[i].destFileName);
  //   if (diff.hunks[0] && diff.hunks[0].lines) {
  //     aDiffList.push(diff);
  //     console.log(aDiffList[i]);
  //     console.log(aDiffList[i].hunks)
  //   }  
  // }


  
  //diff.hunks[0] && diff.hunks[0].lines && console.log(diff.hunks[0].lines);

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