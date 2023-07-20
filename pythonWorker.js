const async = require('async');
const { spawn } = require('child_process');

// Set the maximum number of concurrent processes
const MAX_CONCURRENT_JOB = 10;

// Set the maximum timeout for a process
// 2 seconds
const MAX_TIMEOUT = 2000; 

const jobQueue = async.queue(worker, MAX_CONCURRENT_JOB);

// Worker function for the job queue above
function worker(task, callback) {
  const { code, input } = task;

  // Create a new Python process
  const pythonProcess = spawn('python3', ['-c', code]);

  // Initialize output and error strings
  let output = '';
  let error = '';
  let processTimedOut = false;
  let haveCalledBack = false;

  // Handle stdout data
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  // Handle stderr data
  pythonProcess.stderr.on('data', (data) => {
    error += data.toString();
  });

  // Handle any errors that occur during execution
  pythonProcess.on('error', (error) => {
    if (!haveCalledBack) {
      haveCalledBack = true;
      callback({ success: false, message: 'Internal server error: ' + error });
    }
  });

  // When the Python process finishes
  pythonProcess.on('close', (code) => {
    clearTimeout(timeoutId); // Clear the timeout if the process finishes before timeout
    if (haveCalledBack) return;

    haveCalledBack = true;
    if (processTimedOut) {
      // If the process timed out, then return an error
      callback({ success: false, message: `Code execution timed out after ${MAX_TIMEOUT} ms` });
    } else if (code === 0) {
      // process output
      output = output.trim().replaceAll('\r\n', '\n').replaceAll('\r', '\n');
      // If the exit code is 0, then the process completed successfully
      callback({ success: true, message: output });
    } else {
      // If the exit code is not 0, then the process failed
      callback({ success: false, message: 'Compile error: ' + error });
    }
  });

  // If input is provided, write it to the Python process
  if (input) {
    pythonProcess.stdin.write(input);
    pythonProcess.stdin.end();
  } else {
    pythonProcess.stdin.end();
  }

  // Set a timeout for the process
  const timeoutId = setTimeout(() => {
    processTimedOut = true;
    pythonProcess.kill(); // Terminate the Python process when the timeout expires
  }, MAX_TIMEOUT);
}

// Run the Python code
async function runPython(code, input) {
  return new Promise((resolve, reject) => {
    // Add the task to the job queue
    try {
      jobQueue.push({ code, input }, (result) => {
        resolve(result);
      });
    } catch (error) {
      resolve({ success: false, message: 'Internal server error: ' + error });
    }
  });
}

// Grade the Python code
async function gradePython(code, input, expected_output) {
  return new Promise((resolve, reject) => {
    // Add the task to the job queue
    try {
      jobQueue.push({ code, input }, (result) => {
        if (result.success) {
          if (result.message === expected_output) {
            resolve({ success: true, message: 'Matched result!' });
          } else {
            resolve({ success: false, message: `Wrong answer! Expected output: ${expected_output}\nYour output: ${result.message}` });
          }
        } else {
          resolve(result);
        }
      });
    } catch (error) {
      resolve({ success: false, message: 'Internal server error: ' + error });
    }
  });
}

module.exports = { runPython, gradePython };
