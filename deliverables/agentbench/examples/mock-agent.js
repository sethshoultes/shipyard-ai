#!/usr/bin/env node

/**
 * Mock Agent for AgentBench Testing
 *
 * This is a simple echo agent that demonstrates:
 * - Reading input from stdin
 * - Processing with simple keyword-based responses
 * - Writing output to stdout
 * - Exiting cleanly with exit code 0
 *
 * Usage:
 *   node mock-agent.js
 *   echo "hello" | node mock-agent.js
 *
 * This agent recognizes certain keywords and responds accordingly:
 * - Input containing "refund" -> outputs about refund processing
 * - Input containing "balance" -> outputs account balance
 * - Input containing "error" -> outputs error response
 * - Default -> echoes back the input in a formatted response
 */

let inputData = '';

// Read from stdin
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  inputData += chunk;
});

// Process when stdin ends
process.stdin.on('end', () => {
  const input = inputData.trim();
  let output = '';

  // Simple keyword-based responses
  if (input.toLowerCase().includes('charged twice') || input.toLowerCase().includes('duplicate charge')) {
    output = 'I understand you were charged twice. Let me help you resolve this issue. I will investigate the duplicate charge and get back to you within 24 hours with a resolution.';
  } else if (input.toLowerCase().includes('refund')) {
    output = 'Your refund request has been received. We will process it within 5-7 business days. Your refund ID is REF-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '.';
  } else if (input.toLowerCase().includes('balance')) {
    output = 'Your current account balance is $1,250.50. You have no outstanding charges.';
  } else if (input.toLowerCase().includes('error')) {
    output = 'An error occurred while processing your request. Please try again later or contact support.';
  } else if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
    output = 'Hello! How can I help you today?';
  } else {
    // Default: echo back with a friendly message
    output = 'I received your message: "' + input + '". How else can I assist you?';
  }

  // Write to stdout and exit cleanly
  console.log(output);
  process.exit(0);
});

// Handle timeout (shouldn't happen in normal usage)
setTimeout(() => {
  console.log('Agent timeout');
  process.exit(1);
}, 10000);
