/**
 * Analytics Utility
 * Handles analytics data collection, processing, and visualization
 */

class AnalyticsManager {
  constructor() {
    this.metrics = new Map();
    this.chartInstances = new Map();
    this.updateInterval = 30000; // 30 seconds
    this.dataRetentionDays = 30;
    this.isInitialized = false;
  }

  /**
   * Initialize analytics system
   */
  async initialize() {
    try {
      await this.loadHistoricalData();
      this.startMetricsCollection();
      this.isInitialized = true;
      console.log('Analytics Manager initialized');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Load historical analytics data
   */
  async loadHistoricalData() {
    // In a real application, this would fetch from backend
    // For now, initialize with sample data
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    this.metrics.set('donations', {
      current: 628.3,
      previous: 592.1,
      change: 6.1,
      trend: 'up',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now - (29 - i) * dayMs),
        value: Math.random() * 50 + 10
      }))
    });

    this.metrics.set('users', {
      current: 1247,
      previous: 1189,
      change: 4.9,
      trend: 'up',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now - (29 - i) * dayMs),
        value: Math.floor(Math.random() * 100 + 800)
      }))
    });

    this.metrics.set('transactions', {
      current: 342,
      previous: 318,
      change: 7.5,
      trend: 'up',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now - (29 - i) * dayMs),
        value: Math.floor(Math.random() * 30 + 5)
      }))
    });

    this.metrics.set('impact', {
      current: 89.2,
      previous: 86.7,
      change: 2.9,
      trend: 'up',
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(now - (29 - i) * dayMs),
        value: Math.random() * 20 + 70
      }))
    });
  }

  /**
   * Start periodic metrics collection
   */
  startMetricsCollection() {
    setInterval(() => {
      this.updateMetrics();
    }, this.updateInterval);
  }

  /**
   * Update metrics with new data
   */
  async updateMetrics() {
    try {
      // In a real application, this would fetch fresh data from backend
      const updates = await this.fetchLatestMetrics();

      for (const [key, newData] of Object.entries(updates)) {
        if (this.metrics.has(key)) {
          const existing = this.metrics.get(key);
          existing.previous = existing.current;
          existing.current = newData.current;
          existing.change = ((newData.current - existing.previous) / existing.previous) * 100;
          existing.trend = existing.change >= 0 ? 'up' : 'down';

          // Add new data point
          existing.data.push({
            date: new Date(),
            value: newData.current
          });

          // Keep only recent data
          const cutoff = Date.now() - (this.dataRetentionDays * 24 * 60 * 60 * 1000);
          existing.data = existing.data.filter(point => point.date.getTime() > cutoff);
        }
      }

      this.notifyMetricsUpdate();
    } catch (error) {
      console.error('Failed to update metrics:', error);
    }
  }

  /**
   * Fetch latest metrics from backend (mock)
   */
  async fetchLatestMetrics() {
    // Mock data - in real app this would be an API call
    return {
      donations: { current: Math.random() * 100 + 500 },
      users: { current: Math.floor(Math.random() * 200 + 1000) },
      transactions: { current: Math.floor(Math.random() * 50 + 250) },
      impact: { current: Math.random() * 30 + 70 }
    };
  }

  /**
   * Get metric data
   */
  getMetric(metricName) {
    return this.metrics.get(metricName);
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    const result = {};
    for (const [key, value] of this.metrics.entries()) {
      result[key] = { ...value };
    }
    return result;
  }

  /**
   * Get metrics for date range
   */
  getMetricsForDateRange(metricName, startDate, endDate) {
    const metric = this.metrics.get(metricName);
    if (!metric) return null;

    const start = startDate.getTime();
    const end = endDate.getTime();

    return metric.data.filter(point => {
      const pointTime = point.date.getTime();
      return pointTime >= start && pointTime <= end;
    });
  }

  /**
   * Calculate aggregated metrics
   */
  calculateAggregatedMetrics(data, aggregationType = 'sum') {
    if (!data || data.length === 0) return 0;

    switch (aggregationType) {
      case 'sum':
        return data.reduce((sum, point) => sum + point.value, 0);
      case 'average':
        return data.reduce((sum, point) => sum + point.value, 0) / data.length;
      case 'max':
        return Math.max(...data.map(point => point.value));
      case 'min':
        return Math.min(...data.map(point => point.value));
      default:
        return data[data.length - 1]?.value || 0;
    }
  }

  /**
   * Generate chart data for visualization
   */
  generateChartData(metricName, chartType = 'line') {
    const metric = this.metrics.get(metricName);
    if (!metric) return null;

    const labels = metric.data.map(point => point.date.toLocaleDateString());
    const values = metric.data.map(point => point.value);

    return {
      type: chartType,
      data: {
        labels,
        datasets: [{
          label: metricName.charAt(0).toUpperCase() + metricName.slice(1),
          data: values,
          borderColor: this.getMetricColor(metricName),
          backgroundColor: this.getMetricColor(metricName, 0.1),
          fill: chartType === 'area'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
  }

  /**
   * Get color for metric visualization
   */
  getMetricColor(metricName, alpha = 1) {
    const colors = {
      donations: `rgba(76, 175, 80, ${alpha})`,
      users: `rgba(33, 150, 243, ${alpha})`,
      transactions: `rgba(255, 152, 0, ${alpha})`,
      impact: `rgba(156, 39, 176, ${alpha})`
    };
    return colors[metricName] || `rgba(158, 158, 158, ${alpha})`;
  }

  /**
   * Export analytics data
   */
  exportData(format = 'json', dateRange = null) {
    const data = {};

    for (const [key, metric] of this.metrics.entries()) {
      let metricData = metric.data;

      if (dateRange) {
        metricData = this.getMetricsForDateRange(key, dateRange.start, dateRange.end);
      }

      data[key] = {
        current: metric.current,
        previous: metric.previous,
        change: metric.change,
        trend: metric.trend,
        data: metricData
      };
    }

    switch (format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'json':
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  /**
   * Convert data to CSV format
   */
  convertToCSV(data) {
    const headers = ['Metric', 'Date', 'Value'];
    const rows = [headers.join(',')];

    for (const [metricName, metric] of Object.entries(data)) {
      for (const point of metric.data) {
        rows.push([
          metricName,
          point.date.toISOString(),
          point.value
        ].join(','));
      }
    }

    return rows.join('\n');
  }

  /**
   * Get performance insights
   */
  getInsights() {
    const insights = [];

    for (const [metricName, metric] of this.metrics.entries()) {
      if (metric.change > 10) {
        insights.push({
          type: 'positive',
          message: `${metricName} increased by ${metric.change.toFixed(1)}%`,
          metric: metricName,
          impact: 'high'
        });
      } else if (metric.change < -5) {
        insights.push({
          type: 'negative',
          message: `${metricName} decreased by ${Math.abs(metric.change).toFixed(1)}%`,
          metric: metricName,
          impact: 'medium'
        });
      }
    }

    // Add correlation insights
    const donationsMetric = this.metrics.get('donations');
    const usersMetric = this.metrics.get('users');

    if (donationsMetric && usersMetric) {
      const donationsPerUser = donationsMetric.current / usersMetric.current;
      if (donationsPerUser > 0.5) {
        insights.push({
          type: 'insight',
          message: `High engagement: ${donationsPerUser.toFixed(2)} ETH per user`,
          metric: 'engagement',
          impact: 'high'
        });
      }
    }

    return insights;
  }

  /**
   * Set up real-time dashboard updates
   */
  setupDashboard(updateCallback) {
    if (typeof updateCallback !== 'function') {
      throw new Error('Update callback must be a function');
    }

    this.updateCallback = updateCallback;

    // Initial dashboard update
    updateCallback(this.getAllMetrics());
  }

  /**
   * Notify dashboard of metrics update
   */
  notifyMetricsUpdate() {
    if (this.updateCallback) {
      this.updateCallback(this.getAllMetrics());
    }

    // Dispatch custom event for other listeners
    window.dispatchEvent(new CustomEvent('metricsUpdated', {
      detail: this.getAllMetrics()
    }));
  }

  /**
   * Get dashboard summary
   */
  getDashboardSummary() {
    const metrics = this.getAllMetrics();
    const insights = this.getInsights();

    return {
      summary: {
        totalValue: Object.values(metrics).reduce((sum, m) => sum + m.current, 0),
        positiveMetrics: Object.values(metrics).filter(m => m.trend === 'up').length,
        negativeMetrics: Object.values(metrics).filter(m => m.trend === 'down').length
      },
      metrics,
      insights,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    for (const [key, chart] of this.chartInstances.entries()) {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    }
    this.chartInstances.clear();
    this.isInitialized = false;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsManager;
} else {
  window.AnalyticsManager = AnalyticsManager;
}
