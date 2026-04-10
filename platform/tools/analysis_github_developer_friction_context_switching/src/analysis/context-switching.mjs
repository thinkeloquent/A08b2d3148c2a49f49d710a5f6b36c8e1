import { FOCUS_CLASSIFICATION } from "../domain/models.mjs";

/**
 * Context Switching Analyzer — measures how frequently a developer
 * switches between repositories in their activity timeline.
 *
 * Metrics computed:
 * - contextSwitchRate = totalSwitches / (totalActivities - 1)
 * - focusScore = 1 - contextSwitchRate (higher = more focused)
 * - Focus sessions: consecutive same-repo activity groups
 * - Daily/weekly trends, per-repo metrics, repo pair affinity
 */
export class ContextSwitchingAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Analyze context switching metrics from a unified activity timeline.
   * @param {Array} activities - Activities with { timestamp, repository, type, reference, url, title }
   * @param {{ log: Function }} deps
   * @returns {object} context switching analytics
   */
  analyze(activities, { log }) {
    if (!Array.isArray(activities)) {
      throw new Error("ContextSwitchingAnalyzer expects an array of activities");
    }

    if (activities.length === 0) {
      return this.emptyResult();
    }

    // Sort activities chronologically
    const sorted = [...activities].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Detect context switches
    const switches = [];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].repository !== sorted[i - 1].repository) {
        switches.push({
          from: sorted[i - 1].repository,
          to: sorted[i].repository,
          fromActivity: sorted[i - 1],
          toActivity: sorted[i],
          timeBetweenMs:
            new Date(sorted[i].timestamp) - new Date(sorted[i - 1].timestamp),
        });
      }
    }

    const totalActivities = sorted.length;
    const totalSwitches = switches.length;
    const contextSwitchRate =
      totalActivities > 1 ? totalSwitches / (totalActivities - 1) : 0;
    const focusScore = round(1 - contextSwitchRate);
    const focusClassification = classifyFocus(contextSwitchRate);

    // Unique repositories
    const uniqueRepos = [...new Set(sorted.map((a) => a.repository))];

    // Focus sessions — consecutive same-repo groups
    const focusSessions = computeFocusSessions(sorted, this.options.minSessionGapMinutes || 30);

    const avgFocusSessionLength =
      focusSessions.length > 0
        ? round(
            focusSessions.reduce((s, f) => s + f.activities, 0) /
              focusSessions.length
          )
        : 0;

    // Average time between switches (in hours)
    const avgTimeBetweenSwitchesHours =
      switches.length > 0
        ? round(
            switches.reduce((s, sw) => s + sw.timeBetweenMs, 0) /
              switches.length /
              (1000 * 60 * 60)
          )
        : null;

    // Longest focus session
    const longestFocusSession =
      focusSessions.length > 0
        ? focusSessions.reduce((best, s) =>
            s.activities > best.activities ? s : best
          )
        : null;

    // Daily breakdown
    const dailyBreakdown = computeDailyBreakdown(sorted);

    // Weekly trends
    const weeklyTrends = computeWeeklyTrends(sorted);

    // Per-repository metrics
    const repositoryMetrics = computeRepositoryMetrics(sorted, switches);

    // Repo pair switches
    const repoPairSwitches = computeRepoPairSwitches(switches);

    return {
      summary: {
        totalActivities,
        totalContextSwitches: totalSwitches,
        contextSwitchRate: round(contextSwitchRate),
        focusScore,
        focusClassification,
        uniqueRepositories: uniqueRepos.length,
        avgFocusSessionLength,
        avgTimeBetweenSwitchesHours,
        longestFocusSession: longestFocusSession
          ? {
              repository: longestFocusSession.repository,
              activities: longestFocusSession.activities,
              durationHours: longestFocusSession.durationHours,
            }
          : null,
      },
      weeklyTrends,
      dailyBreakdown,
      repositoryMetrics,
      repoPairSwitches,
      focusSessions,
    };
  }

  emptyResult() {
    return {
      summary: {
        totalActivities: 0,
        totalContextSwitches: 0,
        contextSwitchRate: 0,
        focusScore: 1,
        focusClassification: "deep_focus",
        uniqueRepositories: 0,
        avgFocusSessionLength: 0,
        avgTimeBetweenSwitchesHours: null,
        longestFocusSession: null,
      },
      weeklyTrends: [],
      dailyBreakdown: [],
      repositoryMetrics: [],
      repoPairSwitches: [],
      focusSessions: [],
    };
  }
}

/**
 * Classify focus level based on context switch rate.
 */
function classifyFocus(contextSwitchRate) {
  if (contextSwitchRate < FOCUS_CLASSIFICATION.DEEP_FOCUS.max)
    return FOCUS_CLASSIFICATION.DEEP_FOCUS.label;
  if (contextSwitchRate < FOCUS_CLASSIFICATION.FOCUSED.max)
    return FOCUS_CLASSIFICATION.FOCUSED.label;
  if (contextSwitchRate < FOCUS_CLASSIFICATION.MODERATE.max)
    return FOCUS_CLASSIFICATION.MODERATE.label;
  if (contextSwitchRate < FOCUS_CLASSIFICATION.FRAGMENTED.max)
    return FOCUS_CLASSIFICATION.FRAGMENTED.label;
  return FOCUS_CLASSIFICATION.HIGHLY_FRAGMENTED.label;
}

/**
 * Compute focus sessions — consecutive same-repo activity groups.
 * A new session starts when the repo changes or the gap exceeds minSessionGapMinutes.
 */
function computeFocusSessions(sorted, minSessionGapMinutes) {
  if (sorted.length === 0) return [];

  const gapMs = minSessionGapMinutes * 60 * 1000;
  const sessions = [];
  let currentSession = {
    repository: sorted[0].repository,
    start: sorted[0].timestamp,
    end: sorted[0].timestamp,
    activities: 1,
  };

  for (let i = 1; i < sorted.length; i++) {
    const sameRepo = sorted[i].repository === currentSession.repository;
    const gap =
      new Date(sorted[i].timestamp) - new Date(currentSession.end);
    const withinGap = gap <= gapMs;

    if (sameRepo && withinGap) {
      currentSession.end = sorted[i].timestamp;
      currentSession.activities++;
    } else {
      sessions.push(finalizeSession(currentSession));
      currentSession = {
        repository: sorted[i].repository,
        start: sorted[i].timestamp,
        end: sorted[i].timestamp,
        activities: 1,
      };
    }
  }

  sessions.push(finalizeSession(currentSession));
  return sessions;
}

function finalizeSession(session) {
  const durationMs = new Date(session.end) - new Date(session.start);
  return {
    repository: session.repository,
    start: session.start,
    end: session.end,
    activities: session.activities,
    durationHours: round(durationMs / (1000 * 60 * 60)),
  };
}

/**
 * Compute daily breakdown of activities and switches.
 */
function computeDailyBreakdown(sorted) {
  const dayMap = new Map();

  sorted.forEach((activity, i) => {
    const date = activity.timestamp.split("T")[0];

    if (!dayMap.has(date)) {
      dayMap.set(date, { activities: 0, switches: 0, repos: new Set() });
    }

    const day = dayMap.get(date);
    day.activities++;
    day.repos.add(activity.repository);

    // Check if this is a switch from the previous activity
    if (i > 0 && sorted[i].repository !== sorted[i - 1].repository) {
      day.switches++;
    }
  });

  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      switches: data.switches,
      repos: data.repos.size,
      activities: data.activities,
    }));
}

/**
 * Compute weekly trends.
 */
function computeWeeklyTrends(sorted) {
  const weekMap = new Map();

  sorted.forEach((activity, i) => {
    const actDate = new Date(activity.timestamp);
    const weekStart = new Date(actDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weekMap.has(weekKey)) {
      weekMap.set(weekKey, {
        activities: 0,
        switches: 0,
        repos: new Set(),
      });
    }

    const week = weekMap.get(weekKey);
    week.activities++;
    week.repos.add(activity.repository);

    if (i > 0 && sorted[i].repository !== sorted[i - 1].repository) {
      week.switches++;
    }
  });

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, data]) => {
      const rate =
        data.activities > 1
          ? data.switches / (data.activities - 1)
          : 0;
      return {
        weekStart,
        switches: data.switches,
        repos: data.repos.size,
        activities: data.activities,
        focusScore: round(1 - rate),
      };
    });
}

/**
 * Compute per-repository metrics including switch counts.
 */
function computeRepositoryMetrics(sorted, switches) {
  const repoMap = new Map();

  sorted.forEach((activity) => {
    if (!repoMap.has(activity.repository)) {
      repoMap.set(activity.repository, {
        activities: 0,
        switchesTo: 0,
        switchesFrom: 0,
      });
    }
    repoMap.get(activity.repository).activities++;
  });

  switches.forEach((sw) => {
    if (repoMap.has(sw.from)) repoMap.get(sw.from).switchesFrom++;
    if (repoMap.has(sw.to)) repoMap.get(sw.to).switchesTo++;
  });

  // Determine primary repo (most activities)
  let maxActivities = 0;
  let primaryRepo = null;
  for (const [repo, data] of repoMap) {
    if (data.activities > maxActivities) {
      maxActivities = data.activities;
      primaryRepo = repo;
    }
  }

  return Array.from(repoMap.entries())
    .sort(([, a], [, b]) => b.activities - a.activities)
    .map(([repo, data]) => ({
      repository: repo,
      activities: data.activities,
      switchesTo: data.switchesTo,
      switchesFrom: data.switchesFrom,
      isPrimary: repo === primaryRepo,
    }));
}

/**
 * Compute repo pair switch counts (from → to).
 */
function computeRepoPairSwitches(switches) {
  const pairMap = new Map();

  switches.forEach((sw) => {
    const key = `${sw.from}→${sw.to}`;
    pairMap.set(key, (pairMap.get(key) || 0) + 1);
  });

  return Array.from(pairMap.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([key, count]) => {
      const [from, to] = key.split("→");
      return { from, to, count };
    });
}

/**
 * Round to 2 decimal places.
 */
function round(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 100) / 100;
}
