import fs from "fs/promises";

/**
 * Write a CSV report to disk.
 * @param {Array} commits
 * @param {string} filePath
 */
export async function writeCsvReport(commits, filePath) {
  const csvHeaders =
    "SHA,Message,Date,Repository,Type,PullRequest,Author,URL,TotalChanges,Additions,Deletions,FilesCount,ParentsCount\n";
  const csvRows = commits
    .map(
      (commit) =>
        `"${commit.sha}","${commit.message.replace(/"/g, '""')}","${
          commit.date
        }","${commit.repository}","${commit.type}","${
          commit.pullRequest || ""
        }","${commit.author}","${commit.url}","${
          commit.stats?.total || 0
        }","${commit.stats?.additions || 0}","${
          commit.stats?.deletions || 0
        }","${commit.files?.length || 0}","${commit.parents?.length || 0}"`
    )
    .join("\n");

  await fs.writeFile(filePath, csvHeaders + csvRows);
}
