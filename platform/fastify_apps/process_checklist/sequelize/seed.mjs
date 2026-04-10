import {
  sequelize,
  Template,
  Step,
  ChecklistInstance,
  ChecklistStep,
} from "./models/index.mjs";

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Seed a sample template
    const template = await Template.create({
      template_id: "project-onboarding",
      name: "Project Onboarding Checklist",
      description:
        "Standard checklist for onboarding new projects into the platform",
      version: 1,
      category: "Development",
    });
    console.log(`  Created template: ${template.template_id}`);

    // Seed steps
    const steps = [
      {
        step_id: "setup-repo",
        template_id: "project-onboarding",
        order: 1,
        title: "Set up repository for {{ProjectName}}",
        description: "Create and configure project repository",
        required: true,
        tags: ["setup", "git"],
        dependencies: [],
      },
      {
        step_id: "configure-ci",
        template_id: "project-onboarding",
        order: 2,
        title: "Configure CI/CD pipeline",
        description: "Set up continuous integration and deployment",
        required: true,
        tags: ["ci", "automation"],
        dependencies: [
          "project-onboarding.setup-repo[required]",
        ],
      },
      {
        step_id: "add-docs",
        template_id: "project-onboarding",
        order: 3,
        title: "Add documentation for {{ProjectName}}",
        description: "Create README and initial documentation",
        required: false,
        tags: ["docs"],
        dependencies: [
          "project-onboarding.setup-repo[required]",
        ],
      },
    ];

    for (const stepData of steps) {
      await Step.create(stepData);
    }
    console.log(`  Created ${steps.length} steps`);

    console.log("Seed complete.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
