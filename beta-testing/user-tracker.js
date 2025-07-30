/**
 * Beta User Tracking System
 * Tracks user onboarding, testing progress, and feedback
 */

class BetaUserTracker {
    constructor() {
        this.users = new Map();
        this.sessions = new Map();
        this.feedback = [];
        this.startTime = Date.now();
    }

    // User Registration
    registerUser(userId, userType, source) {
        const user = {
            id: userId,
            type: userType, // crypto-native, environmental, developer, foundation
            source: source, // twitter, discord, reddit, email, etc.
            registeredAt: Date.now(),
            status: 'registered',
            completedScenarios: [],
            feedback: [],
            lastActive: Date.now()
        };

        this.users.set(userId, user);
        this.logEvent('user_registered', { userId, userType, source });
        return user;
    }

    // Session Tracking
    startSession(userId, scenario) {
        const sessionId = `${userId}_${Date.now()}`;
        const session = {
            id: sessionId,
            userId: userId,
            scenario: scenario,
            startTime: Date.now(),
            events: [],
            completed: false
        };

        this.sessions.set(sessionId, session);
        this.logEvent('session_started', { sessionId, userId, scenario });
        return sessionId;
    }

    // Event Logging
    logEvent(eventType, data) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            data: data
        };

        console.log(`📊 [${new Date().toISOString()}] ${eventType}:`, data);

        // Store event for analytics
        if (!this.events) this.events = [];
        this.events.push(event);
    }

    // Scenario Completion
    completeScenario(userId, scenario, success, feedback) {
        const user = this.users.get(userId);
        if (user) {
            user.completedScenarios.push({
                scenario,
                success,
                completedAt: Date.now(),
                feedback
            });
            user.lastActive = Date.now();

            this.logEvent('scenario_completed', { userId, scenario, success });
        }
    }

    // Feedback Collection
    collectFeedback(userId, type, rating, comments) {
        const feedback = {
            userId,
            type, // ux, technical, feature, bug
            rating, // 1-5
            comments,
            timestamp: Date.now()
        };

        const user = this.users.get(userId);
        if (user) {
            user.feedback.push(feedback);
        }

        this.feedback.push(feedback);
        this.logEvent('feedback_collected', feedback);
    }

    // Analytics
    getAnalytics() {
        const totalUsers = this.users.size;
        const usersByType = {};
        const usersBySource = {};
        const scenarioCompletion = {};

        for (const user of this.users.values()) {
            // User type distribution
            usersByType[user.type] = (usersByType[user.type] || 0) + 1;

            // Source distribution
            usersBySource[user.source] = (usersBySource[user.source] || 0) + 1;

            // Scenario completion rates
            for (const completed of user.completedScenarios) {
                if (!scenarioCompletion[completed.scenario]) {
                    scenarioCompletion[completed.scenario] = { total: 0, success: 0 };
                }
                scenarioCompletion[completed.scenario].total++;
                if (completed.success) {
                    scenarioCompletion[completed.scenario].success++;
                }
            }
        }

        return {
            totalUsers,
            usersByType,
            usersBySource,
            scenarioCompletion,
            averageRating: this.feedback.reduce((sum, f) => sum + f.rating, 0) / this.feedback.length || 0,
            totalFeedback: this.feedback.length
        };
    }

    // Daily Report
    generateDailyReport() {
        const analytics = this.getAnalytics();
        const report = `
📊 BETA TESTING DAILY REPORT
============================
Date: ${new Date().toLocaleDateString()}

👥 USER METRICS:
Total Users: ${analytics.totalUsers}/100
- Crypto-native: ${analytics.usersByType['crypto-native'] || 0}/50
- Environmental: ${analytics.usersByType['environmental'] || 0}/25
- Developers: ${analytics.usersByType['developers'] || 0}/15
- Foundations: ${analytics.usersByType['foundations'] || 0}/10

📈 ACQUISITION SOURCES:
${Object.entries(analytics.usersBySource)
    .map(([source, count]) => `- ${source}: ${count}`)
    .join('\n')}

✅ SCENARIO COMPLETION:
${Object.entries(analytics.scenarioCompletion)
    .map(([scenario, data]) => {
        const rate = ((data.success / data.total) * 100).toFixed(1);
        return `- ${scenario}: ${data.success}/${data.total} (${rate}%)`;
    })
    .join('\n')}

⭐ FEEDBACK:
Average Rating: ${analytics.averageRating.toFixed(1)}/5.0
Total Feedback: ${analytics.totalFeedback} submissions

🎯 TARGETS:
Registration: ${analytics.totalUsers}/100 (${(analytics.totalUsers/100*100).toFixed(1)}%)
Completion Rate: Target >80% per scenario
Satisfaction: Target >4.0/5.0 (Current: ${analytics.averageRating.toFixed(1)})
        `;

        return report;
    }
}

module.exports = BetaUserTracker;
