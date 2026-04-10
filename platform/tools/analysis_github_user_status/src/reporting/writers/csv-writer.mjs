import fs from "fs/promises";

/**
 * Write a CSV report to disk.
 * @param {Array} users - Array of user status objects
 * @param {string} filePath
 */
export async function writeCsvReport(users, filePath) {
  const csvHeaders =
    "username,status,id,name,created_at,updated_at,public_repos,followers,following,bio,location,company,blog,twitter_username,error\n";
  const csvRows = users
    .map(
      (user) =>
        [
          user.username,
          user.status,
          user.details?.id || "",
          user.details?.name || "",
          user.details?.created_at || "",
          user.details?.updated_at || "",
          user.details?.public_repos || "",
          user.details?.followers || "",
          user.details?.following || "",
          user.details?.bio || "",
          user.details?.location || "",
          user.details?.company || "",
          user.details?.blog || "",
          user.details?.twitter_username || "",
          user.error || "",
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
    )
    .join("\n");

  await fs.writeFile(filePath, csvHeaders + csvRows);
}
