/**
 * Library Analytics Routes — Figma API SDK
 */

export default async function libraryAnalyticsRoutes(server, { libraryAnalyticsClient }) {
  server.get('/analytics/libraries/:teamId/actions', async (request) => {
    const { teamId } = request.params;
    const { start_date, end_date, group_by, order, cursor, page_size } = request.query;
    return libraryAnalyticsClient.getActions(teamId, {
      startDate: start_date, endDate: end_date, groupBy: group_by,
      order, cursor, pageSize: page_size,
    });
  });

  server.get('/analytics/libraries/:teamId/usages', async (request) => {
    const { teamId } = request.params;
    const { start_date, end_date, group_by, order, cursor, page_size } = request.query;
    return libraryAnalyticsClient.getUsages(teamId, {
      startDate: start_date, endDate: end_date, groupBy: group_by,
      order, cursor, pageSize: page_size,
    });
  });

  return Promise.resolve();
}
