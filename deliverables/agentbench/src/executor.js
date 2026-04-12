const { spawn } = require('child_process');

async function executeAgent(agentConfig, input) {
  const startTime = Date.now();
  const timeout = agentConfig.timeout || 30000;
  try {
    if (agentConfig.command) {
      return await executeSubprocess(agentConfig.command, input, timeout, startTime);
    } else if (agentConfig.endpoint) {
      return await executeHttp(agentConfig.endpoint, input, timeout, startTime);
    }
    return { output: null, error: 'Agent config must have either command or endpoint', executionTime: Date.now() - startTime };
  } catch (err) {
    return { output: null, error: err.message || String(err), executionTime: Date.now() - startTime };
  }
}

async function executeSubprocess(command, input, timeout, startTime) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      child.kill();
      resolve({ output: null, error: `Agent subprocess timed out after ${timeout}ms`, executionTime: Date.now() - startTime });
    }, timeout);
    let stdout = '';
    let stderr = '';
    const child = spawn('sh', ['-c', command], { stdio: ['pipe', 'pipe', 'pipe'] });
    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });
    child.on('error', (err) => {
      clearTimeout(timeoutId);
      resolve({ output: null, error: `Agent subprocess error: ${err.message}`, executionTime: Date.now() - startTime });
    });
    child.on('close', (code) => {
      clearTimeout(timeoutId);
      if (code !== 0) {
        resolve({ output: null, error: `Agent exited with code ${code}`, executionTime: Date.now() - startTime });
      } else {
        resolve({ output: stdout, error: stderr ? `stderr: ${stderr}` : null, executionTime: Date.now() - startTime });
      }
    });
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    } else {
      child.stdin.end();
    }
  });
}

async function executeHttp(endpoint, input, timeout, startTime) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      return { output: null, error: `Agent endpoint returned HTTP ${response.status}`, executionTime: Date.now() - startTime };
    }
    const data = await response.json();
    return { output: data.output || data, error: null, executionTime: Date.now() - startTime };
  } catch (err) {
    if (err.name === 'AbortError') {
      return { output: null, error: `Agent endpoint timed out after ${timeout}ms`, executionTime: Date.now() - startTime };
    }
    if (err.message && err.message.includes('ECONNREFUSED')) {
      return { output: null, error: 'Agent endpoint unreachable', executionTime: Date.now() - startTime };
    }
    return { output: null, error: `Agent endpoint error: ${err.message}`, executionTime: Date.now() - startTime };
  }
}

module.exports = { executeAgent };
