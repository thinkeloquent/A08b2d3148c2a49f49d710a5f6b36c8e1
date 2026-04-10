import {
  sequelize,
  SCHEMA,
  Comment,
  CommentReply,
  PinnedNode,
} from "./models/index.mjs";

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");

    if (process.env.POSTGRES_SCHEMA_EXIST) {
      await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${SCHEMA}";`);
    }

    // Create sample Comment on a Figma file
    const comment1 = await Comment.create({
      figma_file_id: "abc123XYZ",
      node_id: "1:2",
      content: "The spacing on this button component looks off. Should be 16px padding.",
      author_name: "Alice Chen",
      author_handle: "alice.chen",
    });
    console.log(`Seeded comment: ${comment1.id}`);

    // Create a reply to the first comment
    const reply1 = await CommentReply.create({
      comment_id: comment1.id,
      content: "Good catch! I've updated the padding to match the design tokens.",
      author_name: "Bob Martinez",
      author_handle: "bob.martinez",
    });
    console.log(`Seeded reply: ${reply1.id}`);

    // Create another comment on the same file, different node
    const comment2 = await Comment.create({
      figma_file_id: "abc123XYZ",
      node_id: "3:14",
      content: "This icon set needs to be exported at 2x for retina displays.",
      author_name: "Carol Park",
      author_handle: "carol.park",
    });
    console.log(`Seeded comment: ${comment2.id}`);

    // Create a file-level comment (no node_id)
    const comment3 = await Comment.create({
      figma_file_id: "def456UVW",
      node_id: null,
      content: "Overall the component library is looking great. Ready for review.",
      author_name: "Alice Chen",
      author_handle: "alice.chen",
    });
    console.log(`Seeded comment: ${comment3.id}`);

    // Create a reply to the third comment
    const reply2 = await CommentReply.create({
      comment_id: comment3.id,
      content: "Thanks! I'll schedule a design review for Thursday.",
      author_name: "Bob Martinez",
      author_handle: "bob.martinez",
    });
    console.log(`Seeded reply: ${reply2.id}`);

    // Create sample pinned nodes
    const pin1 = await PinnedNode.create({
      figma_file_id: "abc123XYZ",
      node_id: "1:2",
      node_name: "Primary Button",
      node_type: "COMPONENT",
      tags: ["button", "cta", "primary"],
      description: "Primary call-to-action button used across all landing pages.",
      node_path: "Page 1 / Components / Buttons / Primary Button",
      pinned_by: "alice.chen",
    });
    console.log(`Seeded pin: ${pin1.id}`);

    const pin2 = await PinnedNode.create({
      figma_file_id: "abc123XYZ",
      node_id: "3:14",
      node_name: "Icon Set",
      node_type: "FRAME",
      tags: ["icons", "navigation"],
      description: "Icon set for the main navigation bar. Export at 2x.",
      node_path: "Page 1 / Assets / Icons / Icon Set",
      pinned_by: "bob.martinez",
    });
    console.log(`Seeded pin: ${pin2.id}`);

    console.log("\nSeeding complete. Sample comments, replies, and pins created.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
