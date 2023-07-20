const express = require('express');
const { runPython, gradePython } = require('./pythonWorker');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.post('/runcode', async (req, res) => {
  const { code, input } = req.body;
  // validation
  if (!code) {
    return res.status(400).json({ message: 'Code is required' });
  }

  try {
    const result = await runPython(code, input);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || error });
  }
});

app.post('/grade', async (req, res) => {
  try {
    const { code, testCases } = req.body;
    // validation
    if (!code) {
      return res.status(400).json({ message: 'Code is required' });
    }
    if (!testCases) {
      return res.status(400).json({ message: 'Test cases are required' });
    }
    const results = [];
    let grade = 0;
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      // use gradePython
      const result = await gradePython(code, testCase.input, testCase.output);
      results.push(result);
      if (result.success) {
        grade++;
      }
    }
    grade = Math.round(grade / testCases.length * 10000) / 100; // round to 2 decimal places
    res.status(200).json({ results, grade });  
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || error });
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/validate-python', (req, res) => {
  const { spawn } = require('child_process');
  const pythonProcess = spawn('python3', ['--version']);

  pythonProcess.stdout.on('data', (data) => {
    res.send(`Python version: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    res.send(`Error executing Python: ${data}`);
  });
});

app.listen(port, () => {
  console.log(`API server is running on port ${port}`);
});
