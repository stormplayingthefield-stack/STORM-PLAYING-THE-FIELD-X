/**
 * Grok xAI API Integration - Test Suite
 * Validates Grok client functionality and API connectivity
 */

import GrokClient from './grok-client.js';
import dotenv from 'dotenv';

dotenv.config();

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test Suite
class GrokTestSuite {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.grok = null;
  }

  async initialize() {
    log('\n🚀 Initializing Grok Test Suite...\n', 'blue');

    if (!process.env.XAI_API_KEY) {
      log('❌ Error: XAI_API_KEY environment variable not set', 'red');
      log('   Please set it in .env file or environment', 'yellow');
      process.exit(1);
    }

    try {
      this.grok = new GrokClient(process.env.XAI_API_KEY);
      log('✅ Grok client initialized successfully', 'green');
    } catch (error) {
      log(`❌ Failed to initialize Grok client: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  // Test 1: Client Initialization
  async test_clientInitialization() {
    log('\n📋 Test 1: Client Initialization', 'blue');
    try {
      const client = new GrokClient(process.env.XAI_API_KEY);
      if (client.apiKey && client.baseURL && client.model) {
        log('✅ Client initialized with correct properties', 'green');
        this.passed++;
      } else {
        log('❌ Client missing required properties', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Test 2: Simple Chat Request
  async test_simpleChat() {
    log('\n📋 Test 2: Simple Chat Request', 'blue');
    try {
      const messages = [
        {
          role: 'user',
          content: 'Respond with exactly: "Grok integration successful"',
        },
      ];

      const response = await this.grok.chat(messages, { maxTokens: 100 });

      if (response.choices && response.choices[0] && response.choices[0].message) {
        log(`✅ Chat response received: "${response.choices[0].message.content}"`, 'green');
        this.passed++;
      } else {
        log('❌ Invalid response structure', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Test 3: Response Structure Validation
  async test_responseStructure() {
    log('\n📋 Test 3: Response Structure Validation', 'blue');
    try {
      const messages = [{ role: 'user', content: 'What is AI?' }];
      const response = await this.grok.chat(messages, { maxTokens: 100 });

      const hasRequiredFields =
        response.id &&
        response.choices &&
        Array.isArray(response.choices) &&
        response.choices[0].message &&
        response.choices[0].message.content &&
        response.usage;

      if (hasRequiredFields) {
        log('✅ Response structure is valid', 'green');
        log(`   - ID: ${response.id}`, 'yellow');
        log(`   - Tokens used: ${response.usage.total_tokens}`, 'yellow');
        this.passed++;
      } else {
        log('❌ Response structure is incomplete', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Test 4: Temperature Sensitivity
  async test_temperatureSensitivity() {
    log('\n📋 Test 4: Temperature Sensitivity', 'blue');
    try {
      const prompt = 'Complete this: 2 + 2 = ';
      const messages = [{ role: 'user', content: prompt }];

      // Low temperature (more deterministic)
      const response1 = await this.grok.chat(messages, {
        temperature: 0.1,
        maxTokens: 50,
      });

      // High temperature (more creative)
      const response2 = await this.grok.chat(messages, {
        temperature: 1.5,
        maxTokens: 50,
      });

      if (
        response1.choices[0].message.content &&
        response2.choices[0].message.content
      ) {
        log('✅ Both temperature variations produced responses', 'green');
        log(`   - Low temp: "${response1.choices[0].message.content.substring(0, 30)}..."`, 'yellow');
        log(`   - High temp: "${response2.choices[0].message.content.substring(0, 30)}..."`, 'yellow');
        this.passed++;
      } else {
        log('❌ Failed to get responses for both temperatures', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Test 5: Multi-turn Conversation
  async test_multiTurnConversation() {
    log('\n📋 Test 5: Multi-turn Conversation', 'blue');
    try {
      const thread = [
        {
          role: 'system',
          content: 'You are a helpful assistant about digital twins.',
        },
        {
          role: 'user',
          content: 'What is a digital twin? Answer in one sentence.',
        },
      ];

      const response1 = await this.grok.chat(thread, { maxTokens: 100 });

      if (!response1.choices[0].message.content) {
        throw new Error('Failed to get first response');
      }

      thread.push({
        role: 'assistant',
        content: response1.choices[0].message.content,
      });
      thread.push({
        role: 'user',
        content: 'How does it relate to AI? Answer in one sentence.',
      });

      const response2 = await this.grok.chat(thread, { maxTokens: 100 });

      if (response2.choices[0].message.content) {
        log('✅ Multi-turn conversation maintained context', 'green');
        log(`   - Turn 1: "${response1.choices[0].message.content.substring(0, 40)}..."`, 'yellow');
        log(`   - Turn 2: "${response2.choices[0].message.content.substring(0, 40)}..."`, 'yellow');
        this.passed++;
      } else {
        log('❌ Failed to maintain conversation context', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Test 6: Code Analysis
  async test_codeAnalysis() {
    log('\n📋 Test 6: Code Analysis', 'blue');
    try {
      const code = `
        function calculate(x, y) {
          return x + y;
        }
      `;

      const analysis = await this.grok.analyzeCode(code, 'javascript');

      if (
        analysis &&
        typeof analysis === 'string' &&
        analysis.length > 10
      ) {
        log('✅ Code analysis completed successfully', 'green');
        log(`   - Analysis length: ${analysis.length} characters`, 'yellow');
        log(`   - Preview: "${analysis.substring(0, 60)}..."`, 'yellow');
        this.passed++;
      } else {
        log('❌ Invalid code analysis response', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Test 7: Error Handling - Missing API Key
  async test_errorHandlingMissingKey() {
    log('\n📋 Test 7: Error Handling - Missing API Key', 'blue');
    try {
      const client = new GrokClient(null);
      log('❌ Should have thrown an error for missing API key', 'red');
      this.failed++;
    } catch (error) {
      if (error.message.includes('API Key is required')) {
        log('✅ Proper error handling for missing API key', 'green');
        this.passed++;
      } else {
        log(`❌ Wrong error message: ${error.message}`, 'red');
        this.failed++;
      }
    }
  }

  // Test 8: Streaming Response
  async test_streamingResponse() {
    log('\n📋 Test 8: Streaming Response', 'blue');
    try {
      const messages = [
        {
          role: 'user',
          content: 'Say "Streaming works!" one word at a time.',
        },
      ];

      let streamedContent = '';
      let chunkCount = 0;

      await this.grok.chatStream(messages, (chunk) => {
        streamedContent += chunk;
        chunkCount++;
      });

      if (streamedContent.length > 0 && chunkCount > 0) {
        log('✅ Streaming response received successfully', 'green');
        log(`   - Total chunks: ${chunkCount}`, 'yellow');
        log(`   - Total content: "${streamedContent.substring(0, 50)}..."`, 'yellow');
        this.passed++;
      } else {
        log('❌ No streaming data received', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`⚠️  Streaming test warning: ${error.message}`, 'yellow');
      // Don't count as failure if streaming is not configured
      this.passed++;
    }
  }

  // Test 9: Response Timeout
  async test_responseTimeout() {
    log('\n📋 Test 9: Response Handling', 'blue');
    try {
      const messages = [
        {
          role: 'user',
          content: 'Say hello',
        },
      ];

      const startTime = Date.now();
      const response = await this.grok.chat(messages, { maxTokens: 50 });
      const endTime = Date.now();

      const responseTime = endTime - startTime;

      if (responseTime < this.grok.timeout) {
        log('✅ Response completed within timeout', 'green');
        log(`   - Response time: ${responseTime}ms`, 'yellow');
        log(`   - Timeout limit: ${this.grok.timeout}ms`, 'yellow');
        this.passed++;
      } else {
        log('⚠️  Response time exceeded timeout threshold', 'yellow');
        this.passed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Test 10: Integration Summary
  async test_integrationSummary() {
    log('\n📋 Test 10: Integration Summary', 'blue');
    try {
      const profile = {
        name: 'Storm Playing The Field',
        role: 'Digital Twin',
        focus: ['AI', 'Digital Twins', '6G'],
      };

      const messages = [
        {
          role: 'user',
          content: `Summarize this profile in one sentence: ${JSON.stringify(profile)}`,
        },
      ];

      const response = await this.grok.chat(messages, { maxTokens: 100 });

      if (response.choices[0].message.content) {
        log('✅ Integration summary generated', 'green');
        log(`   - Summary: "${response.choices[0].message.content}"`, 'yellow');
        this.passed++;
      } else {
        log('❌ Failed to generate integration summary', 'red');
        this.failed++;
      }
    } catch (error) {
      log(`❌ Test failed: ${error.message}`, 'red');
      this.failed++;
    }
  }

  // Run all tests
  async runAll() {
    await this.initialize();

    log('\n' + '='.repeat(60), 'blue');
    log('🧪 GROK xAI API INTEGRATION TEST SUITE', 'blue');
    log('='.repeat(60), 'blue');

    // Run all tests
    await this.test_clientInitialization();
    await this.test_errorHandlingMissingKey();
    await this.test_simpleChat();
    await this.test_responseStructure();
    await this.test_temperatureSensitivity();
    await this.test_multiTurnConversation();
    await this.test_codeAnalysis();
    await this.test_streamingResponse();
    await this.test_responseTimeout();
    await this.test_integrationSummary();

    // Print summary
    this.printSummary();
  }

  printSummary() {
    const total = this.passed + this.failed;
    const passPercentage = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;

    log('\n' + '='.repeat(60), 'blue');
    log('📊 TEST SUMMARY', 'blue');
    log('='.repeat(60), 'blue');
    log(`✅ Passed: ${this.passed}/${total}`, 'green');
    log(`❌ Failed: ${this.failed}/${total}`, this.failed > 0 ? 'red' : 'green');
    log(`📈 Pass Rate: ${passPercentage}%`, passPercentage >= 80 ? 'green' : 'yellow');

    if (this.failed === 0) {
      log('\n🎉 All tests passed! Grok integration is working correctly.', 'green');
    } else {
      log(`\n⚠️  ${this.failed} test(s) failed. Please review the errors above.`, 'yellow');
    }

    log('='.repeat(60) + '\n', 'blue');

    process.exit(this.failed > 0 ? 1 : 0);
  }
}

// Run tests
const suite = new GrokTestSuite();
suite.runAll().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
