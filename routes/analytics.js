const express = require("express");
const router = express.Router();
const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const path = require("path");

const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
  ? JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS)
  : require(path.join(__dirname, "..", "config", "mitti-analytics-key.json"));

const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });

const PROPERTY_ID = "545658225";

// GET /api/analytics/overview?days=7
router.get("/overview", async (req, res) => {
  try {
    const days = req.query.days || 7;

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
      ],
    });

    const row = response.rows?.[0]?.metricValues || [];

    res.json({
      activeUsers: row[0]?.value || 0,
      newUsers: row[1]?.value || 0,
      pageViews: row[2]?.value || 0,
      avgSessionDuration: row[3]?.value || 0,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
});

// GET /api/analytics/top-pages?days=7
router.get("/top-pages", async (req, res) => {
  try {
    const days = req.query.days || 7;

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    });

    const pages = (response.rows || []).map((row) => ({
      path: row.dimensionValues[0].value,
      views: row.metricValues[0].value,
    }));

    res.json(pages);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch top pages" });
  }
});
// GET /api/analytics/realtime
router.get("/realtime", async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${PROPERTY_ID}`,
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "unifiedScreenName" }],
    });

    const activeUsers =
      response.rows?.reduce(
        (sum, row) => sum + parseInt(row.metricValues[0].value, 10),
        0,
      ) || 0;

    const byPage = (response.rows || []).map((row) => ({
      page: row.dimensionValues[0].value,
      users: row.metricValues[0].value,
    }));

    res.json({ activeUsers, byPage });
  } catch (error) {
    console.error("Realtime analytics error:", error);
    res.status(500).json({ error: "Failed to fetch realtime analytics" });
  }
});
module.exports = router;
