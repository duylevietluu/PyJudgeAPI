## PyJudgeAPI - Python Code Grading API

PyJudgeAPI is an ExpressJS API designed to execute and grade Python code on the server-side. This API provides a reliable and secure environment for running educational exercises, grading programming assignments, or testing code snippets in Python.

This API is part of the larger project [ObieCode](https://obiecode.vercel.app/), which is used to run Python in the backend.

### Features

- Execute Python Code: PyJudgeAPI allows users to submit Python code for execution on the server, providing real-time feedback on the output and potential errors.

- Code Grading: In addition to running Python code, PyJudgeAPI can be used to automatically grade assignments or code submissions based on predefined test cases and evaluation criteria.

- Dockerized Deployment: The API comes with a Dockerfile, making it easy to deploy and manage the application in containerized environments.

### Installation and Setup

To deploy PyJudgeAPI locally or in a server environment, follow these steps (please ensure that you installed `python3`):

1. Clone the repository: `git clone https://github.com/your_username/PyJudgeAPI.git`
2. Navigate to the project directory: `cd PyJudgeAPI`
3. Install dependencies: `npm install`
4. Run the API: `npm start`

For Docker deployment:

1. Build the Docker image: `docker build -t pyjudgeapi .`
2. Run the Docker container: `docker run -p 8080:8080 pyjudgeapi`

### API Endpoints

#### Execute Python Code

- Endpoint: `POST /runcode`
- Request body:
```js
{
  "code": "print('Hello, World!')",
  "input": null
}
```
- Response:
```js
{
  "success": true,
  "output": "Hello, World!\n"
}
```
- Error:
```js
{
  "success": false,
  "output": "Code is required"
}
```

#### Grade Python Code
- Endpoint: `POST /grade`
- Request body:
```js
{
  "code": "def add(a, b):\n    return a + b",
  "testCases": [
    {"input": [2, 3], "output": 5},
    {"input": [5, 7], "output": 12},
    {"input": [10, -3], "output": 7}
  ]
}
```
- Response:
```js
{
  "results": [
    {"success": true, "output": 5},
    {"success": true, "output": 12},
    {"success": true, "output": 7}
  ],
  "grade": 100
}
```

#### Check Python version and test if Python child process works

- Endpoint: `GET /validate-python`
- Response: `Python version: Python 3.8.10`

### Contributing

Contributions to PyJudgeAPI are welcome! If you find any issues or have suggestions for improvements, please feel free to open an issue or submit a pull request.

