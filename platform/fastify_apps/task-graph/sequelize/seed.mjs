/**
 * Task Graph Seed Data
 *
 * Seeds the database with sample data for development.
 *
 * @module seed
 */

import { randomUUID } from 'node:crypto';
import {
  sequelize,
  TaskTemplate,
  Task,
  Step,
  Dependency,
  Checkpoint,
  ExecutionLog,
  TaskStatus,
  StepStatus,
  RepeatInterval,
  ExecutionEventType,
} from './models/index.mjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Clear existing data in reverse dependency order
    await ExecutionLog.destroy({ where: {}, truncate: true, cascade: true });
    await Checkpoint.destroy({ where: {}, truncate: true, cascade: true });
    await Step.destroy({ where: {}, truncate: true, cascade: true });
    await Dependency.destroy({ where: {}, truncate: true, cascade: true });
    await Task.destroy({ where: {}, truncate: true, cascade: true });
    await TaskTemplate.destroy({ where: {}, truncate: true, cascade: true });
    console.log('Cleared existing data.');

    // Sample user IDs (external references)
    const userIds = {
      alice: 'user:alice-developer',
      bob: 'user:bob-engineer',
      carol: 'user:carol-manager',
    };

    // Create task template
    const templates = await TaskTemplate.bulkCreate([
      {
        id: randomUUID(),
        name: 'Bug Fix Template',
        description: 'Template for bug fix tasks',
        template: {
          steps: [
            { token: 'investigate', content: 'Investigate the bug' },
            { token: 'fix', content: 'Implement the fix' },
            { token: 'test', content: 'Write tests' },
            { token: 'review', content: 'Code review' },
          ],
        },
        category: 'development',
        tags: ['bug', 'fix'],
        isActive: true,
      },
      {
        id: randomUUID(),
        name: 'Feature Template',
        description: 'Template for new feature tasks',
        template: {
          steps: [
            { token: 'design', content: 'Design the feature' },
            { token: 'implement', content: 'Implement the feature' },
            { token: 'test', content: 'Write tests' },
            { token: 'document', content: 'Write documentation' },
            { token: 'review', content: 'Code review' },
          ],
        },
        category: 'development',
        tags: ['feature', 'new'],
        isActive: true,
      },
    ]);
    console.log(`  Created ${templates.length} task templates`);

    // Create tasks
    const taskIds = [
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
      randomUUID(),
    ];
    const tasks = await Task.bulkCreate([
      {
        id: taskIds[0],
        title: 'Setup database schema',
        description: 'Create all required tables for the task-graph application',
        status: TaskStatus.DONE,
        repeatInterval: RepeatInterval.NONE,
        creatorId: userIds.alice,
        assignedToId: userIds.bob,
        metadata: { priority: 'high' },
      },
      {
        id: taskIds[1],
        title: 'Implement REST API',
        description: 'Create CRUD endpoints for tasks and steps',
        status: TaskStatus.IN_PROGRESS,
        repeatInterval: RepeatInterval.NONE,
        creatorId: userIds.alice,
        assignedToId: userIds.bob,
        metadata: { priority: 'high' },
      },
      {
        id: taskIds[2],
        title: 'Build frontend UI',
        description: 'Create React components for task management',
        status: TaskStatus.PENDING,
        repeatInterval: RepeatInterval.NONE,
        creatorId: userIds.carol,
        assignedToId: userIds.alice,
        metadata: { priority: 'medium' },
      },
      {
        id: taskIds[3],
        title: 'Design to Product Requirement',
        description: 'Convert design documents and specifications into structured product requirements',
        status: TaskStatus.PENDING,
        repeatInterval: RepeatInterval.NONE,
        creatorId: userIds.carol,
        assignedToId: userIds.alice,
        metadata: { priority: 'high', category: 'conversion' },
      },
      {
        id: taskIds[4],
        title: 'Figma to Component Extract',
        description: 'Extract component specifications and styles from Figma designs into code-ready formats',
        status: TaskStatus.PENDING,
        repeatInterval: RepeatInterval.NONE,
        creatorId: userIds.alice,
        assignedToId: userIds.bob,
        metadata: { priority: 'high', category: 'conversion' },
      },
      {
        id: taskIds[5],
        title: 'Product Requirement to Code',
        description: 'Transform product requirements into implementation code with tests',
        status: TaskStatus.PENDING,
        repeatInterval: RepeatInterval.NONE,
        creatorId: userIds.carol,
        assignedToId: userIds.bob,
        metadata: { priority: 'high', category: 'conversion' },
      },
      {
        id: taskIds[6],
        title: 'JSON Browser Recording to Playwright Script',
        description: 'Convert JSON browser recordings into executable Playwright test scripts',
        status: TaskStatus.PENDING,
        repeatInterval: RepeatInterval.NONE,
        creatorId: userIds.alice,
        assignedToId: userIds.bob,
        metadata: { priority: 'medium', category: 'conversion' },
      },
    ]);
    console.log(`  Created ${tasks.length} tasks`);

    // Create dependencies
    await Dependency.bulkCreate([
      {
        prerequisiteId: taskIds[0],
        dependentId: taskIds[1],
        allowSkip: false,
      },
      {
        prerequisiteId: taskIds[1],
        dependentId: taskIds[2],
        allowSkip: true,
      },
    ]);
    console.log('  Created 2 dependencies');

    // Create steps for second task
    const steps = await Step.bulkCreate([
      {
        id: randomUUID(),
        token: 'design',
        content: 'Design API endpoints and data structures',
        order: 1,
        status: StepStatus.COMPLETED,
        taskId: taskIds[1],
        completedAt: new Date(),
      },
      {
        id: randomUUID(),
        token: 'implement',
        content: 'Implement task CRUD endpoints',
        order: 2,
        status: StepStatus.IN_PROGRESS,
        taskId: taskIds[1],
        startedAt: new Date(),
      },
      {
        id: randomUUID(),
        token: 'test',
        content: 'Write integration tests',
        order: 3,
        status: StepStatus.PENDING,
        taskId: taskIds[1],
      },
    ]);

    // Create steps for Design to Product Requirement task
    const designToPrdSteps = await Step.bulkCreate([
      {
        id: randomUUID(),
        token: 'analyze',
        content: 'Analyze design documents and identify key features',
        order: 1,
        status: StepStatus.PENDING,
        taskId: taskIds[3],
      },
      {
        id: randomUUID(),
        token: 'extract',
        content: 'Extract functional requirements from design specs',
        order: 2,
        status: StepStatus.PENDING,
        taskId: taskIds[3],
      },
      {
        id: randomUUID(),
        token: 'structure',
        content: 'Structure requirements into PRD format',
        order: 3,
        status: StepStatus.PENDING,
        taskId: taskIds[3],
      },
      {
        id: randomUUID(),
        token: 'validate',
        content: 'Validate requirements for completeness and clarity',
        order: 4,
        status: StepStatus.PENDING,
        taskId: taskIds[3],
      },
    ]);

    // Create steps for Figma to Component Extract task
    const figmaToComponentSteps = await Step.bulkCreate([
      {
        id: randomUUID(),
        token: 'parse',
        content: 'Parse Figma file and extract component hierarchy',
        order: 1,
        status: StepStatus.PENDING,
        taskId: taskIds[4],
      },
      {
        id: randomUUID(),
        token: 'styles',
        content: 'Extract styles, colors, typography, and spacing',
        order: 2,
        status: StepStatus.PENDING,
        taskId: taskIds[4],
      },
      {
        id: randomUUID(),
        token: 'generate',
        content: 'Generate component specifications and props',
        order: 3,
        status: StepStatus.PENDING,
        taskId: taskIds[4],
      },
      {
        id: randomUUID(),
        token: 'output',
        content: 'Output code-ready component definitions',
        order: 4,
        status: StepStatus.PENDING,
        taskId: taskIds[4],
      },
    ]);

    // Create steps for Product Requirement to Code task
    const prdToCodeSteps = await Step.bulkCreate([
      {
        id: randomUUID(),
        token: 'parse_prd',
        content: 'Parse product requirements document',
        order: 1,
        status: StepStatus.PENDING,
        taskId: taskIds[5],
      },
      {
        id: randomUUID(),
        token: 'architecture',
        content: 'Design code architecture and module structure',
        order: 2,
        status: StepStatus.PENDING,
        taskId: taskIds[5],
      },
      {
        id: randomUUID(),
        token: 'implement',
        content: 'Generate implementation code',
        order: 3,
        status: StepStatus.PENDING,
        taskId: taskIds[5],
      },
      {
        id: randomUUID(),
        token: 'tests',
        content: 'Generate unit and integration tests',
        order: 4,
        status: StepStatus.PENDING,
        taskId: taskIds[5],
      },
    ]);

    // Create steps for JSON Browser Recording to Playwright Script task
    const jsonToPlaywrightSteps = await Step.bulkCreate([
      {
        id: randomUUID(),
        token: 'load',
        content: 'Load and validate JSON browser recording',
        order: 1,
        status: StepStatus.PENDING,
        taskId: taskIds[6],
      },
      {
        id: randomUUID(),
        token: 'transform',
        content: 'Transform recorded actions to Playwright commands',
        order: 2,
        status: StepStatus.PENDING,
        taskId: taskIds[6],
      },
      {
        id: randomUUID(),
        token: 'selectors',
        content: 'Optimize selectors for reliability',
        order: 3,
        status: StepStatus.PENDING,
        taskId: taskIds[6],
      },
      {
        id: randomUUID(),
        token: 'script',
        content: 'Generate executable Playwright test script',
        order: 4,
        status: StepStatus.PENDING,
        taskId: taskIds[6],
      },
    ]);

    const totalSteps = steps.length + designToPrdSteps.length + figmaToComponentSteps.length + prdToCodeSteps.length + jsonToPlaywrightSteps.length;
    console.log(`  Created ${totalSteps} steps`);

    // Create checkpoint
    await Checkpoint.create({
      id: randomUUID(),
      checkpointData: {
        completedSteps: [steps[0].id],
        currentStep: steps[1].id,
        state: { lastAction: 'step_started' },
      },
      checkpointType: 'task_state',
      taskId: taskIds[1],
    });
    console.log('  Created 1 checkpoint');

    // Create execution logs
    const correlationId = randomUUID();
    await ExecutionLog.bulkCreate([
      {
        id: randomUUID(),
        eventType: ExecutionEventType.TASK_CREATED,
        eventData: { taskId: taskIds[1], title: tasks[1].title },
        correlationId,
        taskId: taskIds[1],
        userId: userIds.alice,
      },
      {
        id: randomUUID(),
        eventType: ExecutionEventType.TASK_STARTED,
        eventData: { taskId: taskIds[1] },
        correlationId,
        taskId: taskIds[1],
        userId: userIds.bob,
      },
      {
        id: randomUUID(),
        eventType: ExecutionEventType.STEP_COMPLETED,
        eventData: { stepId: steps[0].id, token: steps[0].token },
        correlationId,
        taskId: taskIds[1],
        stepId: steps[0].id,
        userId: userIds.bob,
      },
    ]);
    console.log('  Created 3 execution logs');

    console.log('Seed data created successfully.');
  } catch (error) {
    console.error('Seed failed:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
