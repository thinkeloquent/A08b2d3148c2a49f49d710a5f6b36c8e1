/**
 * Write report to database via Sequelize (optional — only imported when format === "database").
 * @param {object} report - Full report object
 * @param {object} config - Validated config with databaseUrl
 * @returns {Promise<string>} created report ID
 */
export async function writeDatabaseReport(report, config) {
  // Dynamic import to keep Sequelize optional
  const { Sequelize, DataTypes } = await import("sequelize");

  if (!config.databaseUrl) {
    throw new Error("Database URL is required for database export");
  }

  const sequelize = new Sequelize(config.databaseUrl, {
    logging: config.verbose ? console.log : false,
    dialect: config.databaseUrl.includes("postgres") ? "postgres" : "sqlite",
  });

  const Report = sequelize.define("Report", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    searchUser: { type: DataTypes.STRING, allowNull: false },
    reportVersion: { type: DataTypes.STRING, defaultValue: "1.0" },
    dateRangeStart: { type: DataTypes.DATE, allowNull: true },
    dateRangeEnd: { type: DataTypes.DATE, allowNull: true },
    repositoriesAnalyzed: { type: DataTypes.JSON },
    enabledModules: { type: DataTypes.JSON },
    summary: { type: DataTypes.JSON },
    analytics: { type: DataTypes.JSON },
    rawData: { type: DataTypes.JSON },
    metaTags: { type: DataTypes.JSON },
    generatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  await sequelize.sync({ force: false });

  const data = report;
  const reportData = {
    searchUser: data.metadata.searchUser,
    reportVersion: data.metadata.reportVersion,
    repositoriesAnalyzed: data.metadata.repositoriesAnalyzed,
    enabledModules: data.metadata.enabledModules,
    summary: data.summary,
    analytics: data.analytics,
    rawData: data.rawData,
    metaTags: data.metadata.metaTags || {},
    generatedAt: new Date(data.metadata.generatedAt),
  };

  if (data.metadata.dateRange) {
    reportData.dateRangeStart = new Date(data.metadata.dateRange.start);
    reportData.dateRangeEnd = new Date(data.metadata.dateRange.end);
  }

  const record = await Report.create(reportData);
  await sequelize.close();

  return record.id;
}
