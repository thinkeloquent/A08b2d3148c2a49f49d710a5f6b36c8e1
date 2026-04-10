import type { SchemaTemplate } from './types';

export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    id: 'contact-info',
    name: 'Contact Information',
    description: 'Extract contact details like name, email, phone',
    examples: [
      {
        id: 'contact-1',
        label: 'Business card',
        prompt: 'Extract the contact information from this message: "Hi, I\'m John Smith from Acme Corp. You can reach me at john.smith@acme.com or call me at (555) 123-4567."',
      },
      {
        id: 'contact-2',
        label: 'Email signature',
        prompt: 'Extract contact details from this email signature: "Best regards, Maria Garcia | Senior Developer | TechStart Inc. | maria.g@techstart.io | Mobile: +1 (415) 555-0199"',
      },
      {
        id: 'contact-3',
        label: 'Informal intro',
        prompt: 'Parse contact info from: "Hey! I\'m Alex Chen, freelance designer. Hit me up at alex@designstudio.co or text 555-888-1234 if you need any graphics work!"',
      },
    ],
    schema: {
      name: 'ContactInfo',
      properties: {
        name: { type: 'string', description: 'Full name of the person' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        company: { type: 'string', description: 'Company or organization name' },
      },
      required: ['name', 'email'],
    },
  },
  {
    id: 'product-details',
    name: 'Product Details',
    description: 'Extract product information with price and features',
    examples: [
      {
        id: 'product-1',
        label: 'Car listing',
        prompt: 'Extract product details from: "The 2024 Tesla Model S Plaid features 1,020 horsepower, tri-motor AWD, and 396-mile range. Available now for $89,990. Key features: 200 mph top speed, 0-60 in 1.99s, and premium interior."',
      },
      {
        id: 'product-2',
        label: 'Electronics',
        prompt: 'Parse this product listing: "iPhone 15 Pro Max - $1,199. The most powerful iPhone yet with A17 Pro chip, titanium design, and 5x optical zoom. Features: 256GB storage, USB-C, Action Button. Category: Electronics."',
      },
      {
        id: 'product-3',
        label: 'Home appliance',
        prompt: 'Extract product info: "Dyson V15 Detect - Complete home cleaning for $749. Includes laser dust detection, LCD screen showing particle counts, and 60-minute runtime. Category: Home Appliances."',
      },
    ],
    schema: {
      name: 'ProductDetails',
      properties: {
        title: { type: 'string', description: 'Product title or name' },
        price: { type: 'number', description: 'Price in USD' },
        description: { type: 'string', description: 'Brief product description' },
        features: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of key features',
        },
        category: { type: 'string', description: 'Product category' },
      },
      required: ['title', 'price'],
    },
  },
  {
    id: 'summary-points',
    name: 'Summary with Key Points',
    description: 'Summarize content into main points and conclusion',
    examples: [
      {
        id: 'summary-1',
        label: 'Remote work article',
        prompt: 'Summarize the key points from this article about remote work: "Remote work has transformed how companies operate. Studies show productivity often increases when employees work from home. However, challenges include maintaining team cohesion and work-life balance. Companies are adopting hybrid models to balance flexibility with collaboration. The future of work will likely blend remote and in-office arrangements."',
      },
      {
        id: 'summary-2',
        label: 'Tech announcement',
        prompt: 'Summarize this tech news: "Apple announced its latest M3 chip lineup today, promising 30% faster CPU performance and 40% better GPU efficiency. The chips use 3nm technology and will power the new MacBook Pro models. Pricing starts at $1,599 for the base model. Pre-orders begin next week with shipping in November."',
      },
      {
        id: 'summary-3',
        label: 'Research findings',
        prompt: 'Extract key points from: "A new study reveals that regular exercise improves cognitive function in adults over 50. Participants who exercised 150 minutes weekly showed 23% better memory retention. The research followed 5,000 subjects over 3 years. Scientists recommend combining cardio with strength training for optimal brain health benefits."',
      },
    ],
    schema: {
      name: 'Summary',
      properties: {
        title: { type: 'string', description: 'Title or topic of the summary' },
        main_points: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of main points or takeaways',
        },
        conclusion: { type: 'string', description: 'Final conclusion or summary' },
      },
      required: ['main_points', 'conclusion'],
    },
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze sentiment with score and reasoning',
    examples: [
      {
        id: 'sentiment-1',
        label: 'Positive review',
        prompt: 'Analyze the sentiment of this customer review: "I absolutely love this product! The quality exceeded my expectations and shipping was incredibly fast. The only minor issue was the packaging could be better, but overall I\'m thrilled with my purchase and will definitely buy again!"',
      },
      {
        id: 'sentiment-2',
        label: 'Negative feedback',
        prompt: 'Analyze this review: "Extremely disappointed with this purchase. The item arrived damaged and customer service was unhelpful. After 3 weeks of back and forth emails, I still haven\'t received a refund. Would not recommend to anyone."',
      },
      {
        id: 'sentiment-3',
        label: 'Mixed opinion',
        prompt: 'Determine the sentiment: "The restaurant has amazing food - best pasta I\'ve ever had. However, the service was slow and our waiter seemed distracted. The ambiance is nice but it\'s quite loud. Worth visiting for the food alone, just don\'t go if you\'re in a hurry."',
      },
    ],
    schema: {
      name: 'SentimentAnalysis',
      properties: {
        sentiment: {
          type: 'string',
          description: 'Overall sentiment: positive, negative, or neutral',
        },
        score: {
          type: 'number',
          description: 'Sentiment score from -1 (negative) to 1 (positive)',
        },
        reasoning: { type: 'string', description: 'Explanation for the sentiment' },
        key_phrases: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key phrases that influenced the sentiment',
        },
      },
      required: ['sentiment', 'score', 'reasoning'],
    },
  },
  {
    id: 'task-extraction',
    name: 'Task Extraction',
    description: 'Extract action items and tasks from text',
    examples: [
      {
        id: 'task-1',
        label: 'Meeting notes',
        prompt: 'Extract the tasks from this meeting note: "Team meeting recap: Sarah needs to finish the design mockups by Friday. Mike will review the API documentation and share feedback. Everyone should update their project status in the tracker. We also need someone to schedule the client demo - probably best if Alex handles that since he\'s the project lead."',
      },
      {
        id: 'task-2',
        label: 'Email thread',
        prompt: 'Find action items in this email: "Hi team, following up on our discussion: 1) Please submit your Q4 reports by end of week. 2) Jennifer will coordinate with marketing on the launch timeline. 3) We need volunteers for the company retreat planning committee. 4) Don\'t forget to complete the security training - deadline is December 15th."',
      },
      {
        id: 'task-3',
        label: 'Project update',
        prompt: 'Extract tasks from: "Sprint planning update: Backend team (Tom) to complete API endpoints. Frontend (Lisa) blocked on designs - needs to sync with UX. QA should start writing test cases. Product owner to clarify requirements for the notification feature. Target: release candidate by next Tuesday."',
      },
    ],
    schema: {
      name: 'TaskExtraction',
      properties: {
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              priority: { type: 'string' },
              assignee: { type: 'string' },
            },
          },
          description: 'List of extracted tasks',
        },
        deadline_mentioned: { type: 'boolean', description: 'Whether a deadline was mentioned' },
        summary: { type: 'string', description: 'Brief summary of all tasks' },
      },
      required: ['tasks'],
    },
  },
  {
    id: 'code-review',
    name: 'Code Review Analysis',
    description: 'Analyze code for issues, improvements, and best practices',
    examples: [
      {
        id: 'code-1',
        label: 'Function review',
        prompt: 'Review this code: "function fetchData(url) { var data = null; $.ajax({url: url, async: false, success: function(resp) { data = resp; }}); return data; }" Identify issues and suggest improvements.',
      },
      {
        id: 'code-2',
        label: 'Security check',
        prompt: 'Check for security issues: "app.get(\'/user/:id\', (req, res) => { db.query(`SELECT * FROM users WHERE id = ${req.params.id}`, (err, result) => res.json(result)); });"',
      },
    ],
    schema: {
      name: 'CodeReview',
      properties: {
        issues: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of identified issues',
        },
        severity: { type: 'string', description: 'Overall severity: low, medium, high, critical' },
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Improvement suggestions',
        },
        best_practices_violated: {
          type: 'array',
          items: { type: 'string' },
          description: 'Best practices that were violated',
        },
      },
      required: ['issues', 'severity'],
    },
  },
];
