import {
  sequelize,
  SCHEMA,
  Organization,
  Workspace,
  Team,
  Application,
  Project,
  Resource,
  Reference,
} from "./models/index.mjs";

/**
 * Helper: create a resource and increment the parent project's resourceCount.
 */
async function seedResource(data, proj, app, team, ws, org) {
  const slug = `${proj.slug}>>${data.localSlug}`;
  const fqdpId = slug.replaceAll(">>", "/");
  const resource = await Resource.create({
    ...data,
    slug,
    fqdpId,
    projectId: proj.id,
    projectName: proj.name,
    applicationId: app.id,
    applicationName: app.name,
    teamId: team.id,
    teamName: team.name,
    workspaceId: ws.id,
    workspaceName: ws.name,
    organizationId: org.id,
    organizationName: org.name,
  });
  await proj.increment("resourceCount");
  console.log(`  Seeded resource: ${resource.name} (${data.resourceType}, ${data.status})`);
  return resource;
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // ========================================================================
    // Organization 1: Active — full hierarchy with many children
    // ========================================================================
    const org1 = await Organization.create({
      name: "Acme Corporation",
      slug: "acme-corp",
      description: "Sample organization for FQDP Management System",
      status: "active",
      metadata: { tags: ["enterprise", "design"], customFields: { industry: "technology" } },
    });
    console.log(`Seeded org: ${org1.name} (active, with metadata)`);

    // --- Workspace 1a: active, with description ---
    const ws1a = await Workspace.create({
      name: "Design System",
      slug: "acme-corp>>design-system",
      description: "Core design system workspace",
      status: "active",
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await org1.increment("workspaceCount");
    console.log(`  Seeded workspace: ${ws1a.name} (active)`);

    // --- Workspace 1b: inactive, no description ---
    const ws1b = await Workspace.create({
      name: "Legacy Platform",
      slug: "acme-corp>>legacy-platform",
      description: null,
      status: "inactive",
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await org1.increment("workspaceCount");
    console.log(`  Seeded workspace: ${ws1b.name} (inactive, no description)`);

    // --- Team under ws1a: active ---
    const team1 = await Team.create({
      name: "Frontend Team",
      slug: "acme-corp>>design-system>>frontend-team",
      description: "Frontend development team",
      status: "active",
      workspaceId: ws1a.id,
      workspaceName: ws1a.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await ws1a.increment("teamCount");
    console.log(`  Seeded team: ${team1.name} (active)`);

    // --- Team under ws1a: archived ---
    const team2 = await Team.create({
      name: "QA Team",
      slug: "acme-corp>>design-system>>qa-team",
      description: null,
      status: "archived",
      metadata: { tags: ["testing"] },
      workspaceId: ws1a.id,
      workspaceName: ws1a.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await ws1a.increment("teamCount");
    console.log(`  Seeded team: ${team2.name} (archived, no description, with metadata)`);

    // --- Team under ws1b: inactive ---
    const team3 = await Team.create({
      name: "Backend Team",
      slug: "acme-corp>>legacy-platform>>backend-team",
      description: "Backend services team",
      status: "inactive",
      workspaceId: ws1b.id,
      workspaceName: ws1b.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await ws1b.increment("teamCount");
    console.log(`  Seeded team: ${team3.name} (inactive)`);

    // --- Application under team1: active ---
    const app1 = await Application.create({
      name: "Web Application",
      slug: "acme-corp>>design-system>>frontend-team>>web-app",
      description: "Main web application",
      status: "active",
      teamId: team1.id,
      teamName: team1.name,
      workspaceId: ws1a.id,
      workspaceName: ws1a.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await team1.increment("applicationCount");
    console.log(`  Seeded application: ${app1.name} (active)`);

    // --- Application under team1: archived, no description ---
    const app2 = await Application.create({
      name: "Mobile App",
      slug: "acme-corp>>design-system>>frontend-team>>mobile-app",
      description: null,
      status: "archived",
      teamId: team1.id,
      teamName: team1.name,
      workspaceId: ws1a.id,
      workspaceName: ws1a.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await team1.increment("applicationCount");
    console.log(`  Seeded application: ${app2.name} (archived, no description)`);

    // --- Project under app1: active ---
    const proj1 = await Project.create({
      name: "Dashboard Redesign",
      slug: "acme-corp>>design-system>>frontend-team>>web-app>>dashboard-redesign",
      description: "Dashboard redesign project",
      status: "active",
      applicationId: app1.id,
      applicationName: app1.name,
      teamId: team1.id,
      teamName: team1.name,
      workspaceId: ws1a.id,
      workspaceName: ws1a.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await app1.increment("projectCount");
    console.log(`  Seeded project: ${proj1.name} (active)`);

    // --- Project under app1: inactive ---
    const proj2 = await Project.create({
      name: "Settings Page",
      slug: "acme-corp>>design-system>>frontend-team>>web-app>>settings-page",
      description: null,
      status: "inactive",
      metadata: { tags: ["low-priority"] },
      applicationId: app1.id,
      applicationName: app1.name,
      teamId: team1.id,
      teamName: team1.name,
      workspaceId: ws1a.id,
      workspaceName: ws1a.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await app1.increment("projectCount");
    console.log(`  Seeded project: ${proj2.name} (inactive, no description, with metadata)`);

    // --- Project under app2: archived ---
    const proj3 = await Project.create({
      name: "Onboarding Flow",
      slug: "acme-corp>>design-system>>frontend-team>>mobile-app>>onboarding-flow",
      description: "Archived onboarding flow project",
      status: "archived",
      applicationId: app2.id,
      applicationName: app2.name,
      teamId: team1.id,
      teamName: team1.name,
      workspaceId: ws1a.id,
      workspaceName: ws1a.name,
      organizationId: org1.id,
      organizationName: org1.name,
    });
    await app2.increment("projectCount");
    console.log(`  Seeded project: ${proj3.name} (archived)`);

    // ========================================================================
    // Resources under proj1 — cover all 8 resource types + status variations
    // ========================================================================
    console.log("\n  --- Resources under Dashboard Redesign (proj1) ---");

    // 1. figma — active, all optional fields present, with externalLinks
    await seedResource({
      name: "Main Layout",
      localSlug: "main-layout",
      description: "Primary layout design file",
      status: "active",
      resourceName: "main-layout.figma",
      resourceType: "figma",
      resourceUrl: "https://figma.com/file/abc123/main-layout",
      resourceSize: 2048000,
      metadata: { tags: ["layout", "primary"], customFields: { version: "2.1" } },
      externalLinks: [
        { system: "figma", url: "https://figma.com/file/abc123", resourceId: "abc123" },
        { system: "jira", url: "https://acme.atlassian.net/browse/DES-101", resourceId: "DES-101" },
      ],
    }, proj1, app1, team1, ws1a, org1);

    // 2. sketch — active, no resourceUrl, no resourceSize
    await seedResource({
      name: "Icon Set",
      localSlug: "icon-set",
      description: "Sketch icon library",
      status: "active",
      resourceName: "icons.sketch",
      resourceType: "sketch",
      resourceUrl: null,
      resourceSize: null,
    }, proj1, app1, team1, ws1a, org1);

    // 3. xd — inactive, no description
    await seedResource({
      name: "Prototype V1",
      localSlug: "prototype-v1",
      description: null,
      status: "inactive",
      resourceName: "prototype-v1.xd",
      resourceType: "xd",
      resourceUrl: "https://xd.adobe.com/view/xyz789",
      resourceSize: 5120000,
    }, proj1, app1, team1, ws1a, org1);

    // 4. pdf — archived
    await seedResource({
      name: "Brand Guidelines",
      localSlug: "brand-guidelines",
      description: "Corporate brand guidelines document",
      status: "archived",
      resourceName: "brand-guidelines-v3.pdf",
      resourceType: "pdf",
      resourceUrl: "https://storage.example.com/brand-guidelines-v3.pdf",
      resourceSize: 3145728,
    }, proj1, app1, team1, ws1a, org1);

    // 5. image — active, with metadata, no externalLinks
    await seedResource({
      name: "Hero Banner",
      localSlug: "hero-banner",
      description: "Homepage hero banner image",
      status: "active",
      resourceName: "hero-banner.png",
      resourceType: "image",
      resourceUrl: "https://cdn.example.com/hero-banner.png",
      resourceSize: 1024000,
      metadata: { tags: ["hero", "homepage"], customFields: { dimensions: "1920x1080" } },
    }, proj1, app1, team1, ws1a, org1);

    // 6. code — active, with externalLinks to github
    await seedResource({
      name: "Component Library",
      localSlug: "component-library",
      description: "React component source code",
      status: "active",
      resourceName: "components.tsx",
      resourceType: "code",
      resourceUrl: "https://github.com/acme-corp/web-app/tree/main/src/components",
      resourceSize: 45000,
      externalLinks: [
        { system: "github", url: "https://github.com/acme-corp/web-app", resourceId: "acme-corp/web-app" },
      ],
    }, proj1, app1, team1, ws1a, org1);

    // 7. document — inactive, no URL, no size, no description
    await seedResource({
      name: "Meeting Notes",
      localSlug: "meeting-notes",
      description: null,
      status: "inactive",
      resourceName: "kickoff-notes.docx",
      resourceType: "document",
      resourceUrl: null,
      resourceSize: null,
    }, proj1, app1, team1, ws1a, org1);

    // 8. other — archived, minimal fields
    await seedResource({
      name: "Misc Asset",
      localSlug: "misc-asset",
      description: null,
      status: "archived",
      resourceName: "data-export.csv",
      resourceType: "other",
      resourceUrl: null,
      resourceSize: null,
    }, proj1, app1, team1, ws1a, org1);

    // ========================================================================
    // Resources under proj2 — sparse project (inactive), fewer resources
    // ========================================================================
    console.log("\n  --- Resources under Settings Page (proj2) ---");

    await seedResource({
      name: "Settings Mockup",
      localSlug: "settings-mockup",
      description: "Figma mockup for settings page",
      status: "active",
      resourceName: "settings-mockup.figma",
      resourceType: "figma",
      resourceUrl: "https://figma.com/file/def456/settings",
      resourceSize: 1500000,
    }, proj2, app1, team1, ws1a, org1);

    await seedResource({
      name: "Settings Spec",
      localSlug: "settings-spec",
      description: "Technical specification document",
      status: "active",
      resourceName: "settings-spec.pdf",
      resourceType: "pdf",
      resourceUrl: null,
      resourceSize: 256000,
    }, proj2, app1, team1, ws1a, org1);

    // ========================================================================
    // Resources under proj3 — archived project, 1 archived resource
    // ========================================================================
    console.log("\n  --- Resources under Onboarding Flow (proj3) ---");

    await seedResource({
      name: "Onboarding Wireframes",
      localSlug: "onboarding-wireframes",
      description: "Initial wireframes for onboarding flow",
      status: "archived",
      resourceName: "onboarding-wireframes.sketch",
      resourceType: "sketch",
      resourceUrl: null,
      resourceSize: 890000,
    }, proj3, app2, team1, ws1a, org1);

    // ========================================================================
    // Organization 2: Archived — minimal, proves multi-org support
    // ========================================================================
    const org2 = await Organization.create({
      name: "Beta Labs",
      slug: "beta-labs",
      description: null,
      status: "archived",
    });
    console.log(`\nSeeded org: ${org2.name} (archived, no description)`);

    const ws2 = await Workspace.create({
      name: "Research",
      slug: "beta-labs>>research",
      description: "Research workspace",
      status: "archived",
      organizationId: org2.id,
      organizationName: org2.name,
    });
    await org2.increment("workspaceCount");
    console.log(`  Seeded workspace: ${ws2.name} (archived)`);

    const team4 = await Team.create({
      name: "Data Science",
      slug: "beta-labs>>research>>data-science",
      description: "Data science and ML team",
      status: "archived",
      workspaceId: ws2.id,
      workspaceName: ws2.name,
      organizationId: org2.id,
      organizationName: org2.name,
    });
    await ws2.increment("teamCount");
    console.log(`  Seeded team: ${team4.name} (archived)`);

    const app3 = await Application.create({
      name: "ML Pipeline",
      slug: "beta-labs>>research>>data-science>>ml-pipeline",
      description: "Machine learning pipeline application",
      status: "archived",
      teamId: team4.id,
      teamName: team4.name,
      workspaceId: ws2.id,
      workspaceName: ws2.name,
      organizationId: org2.id,
      organizationName: org2.name,
    });
    await team4.increment("applicationCount");
    console.log(`  Seeded application: ${app3.name} (archived)`);

    const proj4 = await Project.create({
      name: "Model Training UI",
      slug: "beta-labs>>research>>data-science>>ml-pipeline>>model-training-ui",
      description: "UI for model training workflows",
      status: "archived",
      applicationId: app3.id,
      applicationName: app3.name,
      teamId: team4.id,
      teamName: team4.name,
      workspaceId: ws2.id,
      workspaceName: ws2.name,
      organizationId: org2.id,
      organizationName: org2.name,
    });
    await app3.increment("projectCount");
    console.log(`  Seeded project: ${proj4.name} (archived)`);

    await seedResource({
      name: "Training Dashboard",
      localSlug: "training-dashboard",
      description: "Dashboard design for model training",
      status: "archived",
      resourceName: "training-dashboard.figma",
      resourceType: "figma",
      resourceUrl: "https://figma.com/file/ghi789/training-dashboard",
      resourceSize: 3200000,
      externalLinks: [
        { system: "figma", url: "https://figma.com/file/ghi789", resourceId: "ghi789" },
      ],
    }, proj4, app3, team4, ws2, org2);

    // ========================================================================
    // References — sample external references
    // ========================================================================
    console.log("\n--- Seeding References ---");

    await Reference.create({
      entityType: "organization",
      entityId: org1.id,
      name: "Acme Corp Website",
      link: "https://www.acme-corp.example.com",
      type: "page",
      externalUid: "acme-corp-website",
      description: "Corporate website for Acme Corporation",
      status: "active",
    });
    console.log("  Seeded reference: Acme Corp Website (organization)");

    await Reference.create({
      entityType: "organization",
      entityId: org1.id,
      name: "Acme Design System Docs",
      link: "https://design.acme-corp.example.com",
      type: "page",
      externalUid: "acme-design-docs",
      description: "Design system documentation site",
      status: "active",
    });
    console.log("  Seeded reference: Acme Design System Docs (organization)");

    await Reference.create({
      entityType: "workspace",
      entityId: ws1a.id,
      name: "Design Tokens Repository",
      link: "https://github.com/acme-corp/design-tokens",
      type: "repository",
      externalUid: "acme-corp/design-tokens",
      description: "GitHub repo for design tokens",
      status: "active",
    });
    console.log("  Seeded reference: Design Tokens Repository (workspace)");

    await Reference.create({
      entityType: "team",
      entityId: team1.id,
      name: "Frontend CI/CD Pipeline",
      link: "https://ci.acme-corp.example.com/pipelines/frontend",
      type: "service",
      externalUid: "ci-pipeline-frontend",
      description: "Continuous integration pipeline for frontend team",
      status: "active",
    });
    console.log("  Seeded reference: Frontend CI/CD Pipeline (team)");

    await Reference.create({
      entityType: "application",
      entityId: app1.id,
      name: "Web App Storybook",
      link: "https://storybook.acme-corp.example.com",
      type: "component",
      externalUid: "web-app-storybook",
      description: "Storybook component explorer for web application",
      status: "active",
    });
    console.log("  Seeded reference: Web App Storybook (application)");

    await Reference.create({
      entityType: "project",
      entityId: proj1.id,
      name: "Dashboard Figma Project",
      link: "https://figma.com/project/dashboard-redesign",
      type: "page",
      externalUid: "figma-dashboard-proj",
      description: "Figma project for dashboard redesign",
      status: "active",
    });
    console.log("  Seeded reference: Dashboard Figma Project (project)");

    await Reference.create({
      entityType: "resource",
      entityId: (await Resource.findOne({ where: { name: "Component Library" } })).id,
      name: "NPM Package",
      link: "https://www.npmjs.com/package/@acme/components",
      type: "repository",
      externalUid: "npm-acme-components",
      description: "Published NPM package for the component library",
      status: "active",
    });
    console.log("  Seeded reference: NPM Package (resource)");

    await Reference.create({
      entityType: "organization",
      entityId: org2.id,
      name: "Beta Labs Wiki",
      link: "https://wiki.beta-labs.example.com",
      type: "page",
      externalUid: "beta-labs-wiki",
      description: "Internal wiki for Beta Labs",
      status: "archived",
    });
    console.log("  Seeded reference: Beta Labs Wiki (organization, archived)");

    // ========================================================================
    // Summary
    // ========================================================================
    console.log("\n--- Seed Summary ---");
    console.log("Organizations: 2 (active, archived)");
    console.log("Workspaces:    3 (active, inactive, archived)");
    console.log("Teams:         4 (active, archived, inactive, archived)");
    console.log("Applications:  3 (active, archived, archived)");
    console.log("Projects:      4 (active, inactive, archived, archived)");
    console.log("Resources:    12 (all 8 types, all 3 statuses, optional field variations)");
    console.log("References:    8 (across all entity types)");
    console.log("\nSeeding complete. Full FQDP hierarchy created with compound slugs (>> separator).");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
