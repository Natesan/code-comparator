# code-comparator
A quick code comparison utility which reduces the hassle of file by file comparison.

Utility to scan given two directories and check for the following
1. Files that are available on both the directories 
2. Files that are available in the source but not in the destination directory
3. Files that are available in the destination but not in the source directory

Reporting capabilities include 
1. Report the files that match between the two directories
2. Consolidated patch of all the differences 

## How to use
- Fire the terminal in the code-comparator directory
- Run 'npm install' to install all the dependencies
- Copy the source files into the src directory
- Copy the target files to be compared with in the dest directory
- Run 'node app.js' in the terminal
- Choose the mode in which the utility is expected to run
- Find the reports in the result directory
