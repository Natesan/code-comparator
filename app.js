var inquirer = require('inquirer');
var readdirp = require('readdirp');
var _ = require('lodash');
var fs = require('fs');
var jsdiff = require('diff');
var writeFile = require('write');

let rootDir = process.cwd();

var aFileList = [];
var aFinalList = [];
var aAddedFileList = [];
var aRemovedFileList = [];
var aSourceFileList = [];
var aTargetFileList = [];
var aDiffContent = [];

var constants = {
  CHECK_DIRECTORY: "Check Directories"
};

var sourceSettings = {
  root: rootDir + '/src/',
  entryType: 'files',
  filter: '*.js'
};

var targetSettings = {
  root: rootDir + '/dest/',
  entryType: 'files',
  filter: '*.js'
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
        fnWriteReport();
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
  console.log("\nComparing File Content for Files available in both directories...");
   
  aFinalList.forEach((aFinalListItem) => {
    var srcFileContent = fs.readFileSync(rootDir + '/src/' + aFinalListItem, "utf8");
    var destFileContent = fs.readFileSync(rootDir + '/dest/' + aFinalListItem, "utf8");
    
    var diff = jsdiff.structuredPatch(rootDir + '/src/' + aFinalListItem, rootDir + '/dest/' + aFinalListItem,
    srcFileContent, destFileContent,
    '/src/' + aFinalListItem, '/dest/' + aFinalListItem);
    if (diff.hunks[0] && diff.hunks[0].lines) {
      //console.log("\nDifference between '" + diff.oldHeader + "' and '" + diff.newHeader + "'");
      //console.log(diff.hunks[0].lines);
      aDiffContent.push(diff);
    }  
  });
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

var fnWriteReport = function(){
  var sDiffContent = [];

  console.log("\nWriting Report to File...");
  console.log("\nFinal Matching List:" + aFinalList.length);
  console.log("\nAdded in Destination:" + aAddedFileList.length);
  console.log("\nDeleted from Source:" + aRemovedFileList.length);

  sDiffContent.push("\nFinal Matching List:" + aFinalList.length);
  sDiffContent.push("\nAdded in Destination:" + aAddedFileList.length);
  sDiffContent.push("\nDeleted from Source:" + aRemovedFileList.length);

  sDiffContent.push("\n\nFinal Matching List:\n");
  aFinalList.forEach((finalListItem) => {
    sDiffContent.push(finalListItem + '\n');
  });
  
  sDiffContent.push("\n\nAdded in Destination:\n");
  aAddedFileList.forEach((addedListItem) => {
    sDiffContent.push(addedListItem + '\n');
  });
  
  sDiffContent.push("\n\nDeleted from Source:\n");
  aRemovedFileList.forEach((removedListItem) => {
    sDiffContent.push(removedListItem + '\n');
  });

  aDiffContent.forEach((diffItem) => {
    sDiffContent.push("\n\nDifference between '" + diffItem.oldHeader + "' and '" + diffItem.newHeader + "'\n");
    sDiffContent.push(diffItem.hunks[0].lines);
  });
  
  writeFile('result/diff.patch', sDiffContent, function(err) {
    if (err) console.log(err);
  });
}