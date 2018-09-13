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
var sMode = '';

var constants = {
  COMPARE_DIRECTORIES_ONLY: "Compare Directories Only",
  COMPARE_DIRECTORIES_REPORT: "Compare Directories and Report",
  COMPARE_DIRECTORIES_REPORT_DIFF: "Compare Directories, Report differences & Create Patch File"
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
    constants.COMPARE_DIRECTORIES_ONLY,
    constants.COMPARE_DIRECTORIES_REPORT,
    constants.COMPARE_DIRECTORIES_REPORT_DIFF
  ]
}]).then(answers => {
  initialize(answers);
});

var initialize = function (answers) {
  sMode = answers.action;

  fnAsyncDirectoryRead(sourceSettings).then(function (result) {
    aSourceFileList = result;
    fnAsyncDirectoryRead(targetSettings).then(function (result) {
      aTargetFileList = result;


      fnCompareFileList(aSourceFileList, aTargetFileList);
      fnCompareFileContent();

      fnWriteReport();
    });
  });

}

var fnCompareFileList = function (srcFileList, destFileList) {
  if (!srcFileList || !destFileList)
    return;

  srcFileList.forEach((srcElement) =>
    destFileList.forEach((destElement) => {
      if (srcElement == destElement) {
        aFinalList.push(srcElement);
      }
    }));

  console.log("\nFinal Matching List:" + aFinalList.length);
  console.log(aFinalList);

  aAddedFileList = _.difference(destFileList, srcFileList);
  console.log("\nAdded in Destination:" + aAddedFileList.length);
  console.log(aAddedFileList);

  aRemovedFileList = _.difference(srcFileList, destFileList);
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
      aDiffContent.push(diff);
    }
  });
}

var fnAsyncDirectoryRead = function (settings) {
  return new Promise(function (resolve, reject) {
    readdirp(settings)
      .on('data', function (entry) {
        aFileList.push(entry.path);
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

var fnWriteReport = function () {
  var sReportContent = [];
  var sDiffContent = [];
  
  console.log("\nFinal Matching List:" + aFinalList.length);
  console.log("\nAdded in Destination:" + aAddedFileList.length);
  console.log("\nDeleted from Source:" + aRemovedFileList.length);

  sReportContent.push("\nFinal Matching List:" + aFinalList.length);
  sReportContent.push("\nAdded in Destination:" + aAddedFileList.length);
  sReportContent.push("\nDeleted from Source:" + aRemovedFileList.length);

  sReportContent.push("\n\nFinal Matching List:\n");
  aFinalList.forEach((finalListItem) => {
    sReportContent.push(finalListItem + '\n');
  });

  sReportContent.push("\n\nAdded in Destination:\n");
  aAddedFileList.forEach((addedListItem) => {
    sReportContent.push(addedListItem + '\n');
  });

  sReportContent.push("\n\nDeleted from Source:\n");
  aRemovedFileList.forEach((removedListItem) => {
    sReportContent.push(removedListItem + '\n');
  });

  if (sMode === constants.COMPARE_DIRECTORIES_REPORT || sMode === constants.COMPARE_DIRECTORIES_REPORT_DIFF) {
    console.log("\nWriting Report to File...");
    writeFile('result/result.txt', sReportContent, function (err) {
      if (err) console.log(err);
    });
  }


  if (sMode === constants.COMPARE_DIRECTORIES_REPORT_DIFF) {
    aDiffContent.forEach((diffItem) => {
      sDiffContent.push("\n\nDifference between '" + diffItem.oldHeader + "' and '" + diffItem.newHeader + "'\n");
      sDiffContent.push(diffItem.hunks[0].lines);
    });
    console.log("\nCreating Patch File...");
    writeFile('result/diff.patch', sDiffContent, function (err) {
      if (err) console.log(err);
    });
  }
}