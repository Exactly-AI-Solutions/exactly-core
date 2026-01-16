import { initDb } from './client';
import { tenants } from './schema/tenants';
import { agentConfigs } from './schema/agents';
import { createExactlyChatbotPrompt } from '@exactly/agents';

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const db = initDb(databaseUrl);

  console.log('Seeding database...');

  // Create Exactly homepage tenant
  await db
    .insert(tenants)
    .values({
      id: 'exactly-homepage',
      name: 'Exactly Homepage',
      allowedDomains: ['exactly.ai', '*.exactly.ai', 'localhost', '127.0.0.1', '*.vercel.app'],
      uiConfig: {
        components: {
          suggestions: true,
          quickActions: true,
          fileUpload: false,
          feedbackButtons: true,
          typingIndicator: true,
        },
        greeting: 'Hi! I\'m the Exactly assistant. How can I help you today?',
        placeholderText: 'Ask me anything about Exactly...',
        suggestedPrompts: [
          'What is Exactly?',
          'How do I get started?',
          'Tell me about pricing',
        ],
        theme: {
          primaryColor: '#0066FF',
          backgroundColor: '#FFFFFF',
          textColor: '#1A1A1A',
          position: 'bottom-right',
          borderRadius: 12,
        },
      },
      isActive: true,
    })
    .onConflictDoNothing();

  // Create test client tenant
  await db
    .insert(tenants)
    .values({
      id: 'test-client',
      name: 'Test Client',
      allowedDomains: ['test-client.com', '*.test-client.com', 'localhost'],
      uiConfig: {
        components: {
          suggestions: true,
          quickActions: false,
          fileUpload: false,
          feedbackButtons: true,
          typingIndicator: true,
        },
        greeting: 'Hello! How can I assist you?',
        placeholderText: 'Type your message...',
        suggestedPrompts: [
          'What services do you offer?',
          'Contact support',
        ],
        theme: {
          primaryColor: '#10B981',
          backgroundColor: '#F9FAFB',
          textColor: '#111827',
          position: 'bottom-right',
          borderRadius: 8,
        },
      },
      isActive: true,
    })
    .onConflictDoNothing();

  // Create agent config for Exactly homepage using the comprehensive prompt
  const exactlySystemPrompt = createExactlyChatbotPrompt();

  await db
    .insert(agentConfigs)
    .values({
      id: 'exactly-homepage-agent',
      tenantId: 'exactly-homepage',
      model: 'gpt-5.2',
      temperature: '0.7',
      maxTokens: 4096,
      systemPrompt: exactlySystemPrompt,
      instructions: [],
      tools: [], // Tools are loaded via code, not database
    })
    .onConflictDoUpdate({
      target: agentConfigs.id,
      set: {
        systemPrompt: exactlySystemPrompt,
        model: 'gpt-5.2',
      },
    });

  // Create agent config for test client
  await db
    .insert(agentConfigs)
    .values({
      id: 'test-client-agent',
      tenantId: 'test-client',
      model: 'gpt-5.2',
      temperature: '0.7',
      maxTokens: 4096,
      systemPrompt: 'You are a helpful assistant for Test Client. Answer questions about their services.',
      instructions: [],
      tools: [],
    })
    .onConflictDoNothing();

  console.log('Seed completed successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
