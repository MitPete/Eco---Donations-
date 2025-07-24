#!/bin/bash

# 🧪 Beta Testing Activation Script
# This script sets up monitoring and tracking for beta user testing

echo "🚀 ACTIVATING BETA TESTING INFRASTRUCTURE"
echo "========================================="

# Create beta testing directories
mkdir -p beta-testing/{logs,feedback,metrics,reports}

# Create user tracking system
cat > beta-testing/user-tracker.js << 'EOF'
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
EOF

# Create feedback collection API
cat > beta-testing/feedback-api.js << 'EOF'
/**
 * Simple feedback collection API for beta testing
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Feedback storage
const feedbackFile = path.join(__dirname, 'feedback', 'submissions.json');

// Ensure feedback directory exists
if (!fs.existsSync(path.dirname(feedbackFile))) {
    fs.mkdirSync(path.dirname(feedbackFile), { recursive: true });
}

// Initialize feedback file
if (!fs.existsSync(feedbackFile)) {
    fs.writeFileSync(feedbackFile, JSON.stringify([]));
}

// Submit feedback endpoint
app.post('/api/feedback', (req, res) => {
    try {
        const feedback = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...req.body
        };
        
        // Read existing feedback
        const existing = JSON.parse(fs.readFileSync(feedbackFile));
        existing.push(feedback);
        
        // Save updated feedback
        fs.writeFileSync(feedbackFile, JSON.stringify(existing, null, 2));
        
        console.log('📝 New feedback received:', feedback.type, feedback.rating);
        
        res.json({ success: true, id: feedback.id });
    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ error: 'Failed to save feedback' });
    }
});

// Get feedback summary
app.get('/api/feedback/summary', (req, res) => {
    try {
        const feedback = JSON.parse(fs.readFileSync(feedbackFile));
        
        const summary = {
            total: feedback.length,
            averageRating: feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length || 0,
            byType: {},
            recent: feedback.slice(-10)
        };
        
        feedback.forEach(f => {
            summary.byType[f.type] = (summary.byType[f.type] || 0) + 1;
        });
        
        res.json(summary);
    } catch (error) {
        console.error('Error reading feedback:', error);
        res.status(500).json({ error: 'Failed to read feedback' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`📡 Feedback API running on port ${PORT}`);
});
EOF

# Create testing scenarios checklist
cat > beta-testing/testing-checklist.md << 'EOF'
# 🧪 Beta Testing Checklist

## User Onboarding (All Users)
- [ ] User receives welcome email with beta guide
- [ ] User successfully connects to platform
- [ ] User understands beta testing objectives
- [ ] User has testnet ETH for testing

## Scenario 1: First Donation (Target: All 100 users)
**Success Criteria**: >80% completion rate

- [ ] User navigates to donation page
- [ ] User selects foundation (Save The Oceans recommended)
- [ ] User enters donation amount (0.01 ETH)
- [ ] User confirms transaction in wallet
- [ ] User receives ECO tokens
- [ ] User views transaction in history
- [ ] User understands ECO token concept

**Feedback Points**:
- Donation flow intuitive? (1-5)
- Gas fees reasonable? (Y/N)
- ECO tokens concept clear? (Y/N)
- Any confusing steps? (Open text)

## Scenario 2: Auto-Donation Setup (Target: 50 crypto-native users)
**Success Criteria**: >30% adoption rate

- [ ] User navigates to auto-donation section
- [ ] User configures donation parameters
- [ ] User sets frequency (monthly recommended)
- [ ] User enables auto-donations
- [ ] User views subscription details
- [ ] User can modify/cancel subscription

**Feedback Points**:
- Trust in auto-donation system? (1-5)
- Permissions model clear? (Y/N)
- Would use in production? (Y/N)

## Scenario 3: Governance Participation (Target: 30 users with ECO)
**Success Criteria**: >20% participation rate

- [ ] User navigates to governance section
- [ ] User reads proposal details
- [ ] User casts vote on proposal
- [ ] User views voting results
- [ ] User understands voting power concept

**Feedback Points**:
- Proposals easy to understand? (1-5)
- Voting process clear? (Y/N)
- Feel engaged in governance? (Y/N)

## Scenario 4: Mobile Experience (Target: 50 users)
**Success Criteria**: >4.0/5.0 mobile rating

- [ ] User accesses platform on mobile
- [ ] User connects mobile wallet
- [ ] User completes donation on mobile
- [ ] User navigates interface on small screen

**Feedback Points**:
- Mobile interface quality? (1-5)
- Button/text sizing appropriate? (Y/N)
- Missing functionality on mobile? (Open text)

## Scenario 5: Foundation Onboarding (Target: 10 foundations)
**Success Criteria**: 100% completion (manual process)

- [ ] Foundation submits application
- [ ] Foundation provides verification documents
- [ ] Foundation sets up profile
- [ ] Foundation accesses dashboard
- [ ] Foundation tests withdrawal process

## Scenario 6: Error Recovery (Target: Random 25 users)
**Success Criteria**: >4.0/5.0 error handling rating

- [ ] User attempts donation with insufficient balance
- [ ] User experiences transaction failure
- [ ] User handles wallet disconnection
- [ ] User recovers from network issues

**Feedback Points**:
- Error messages helpful? (1-5)
- Recovery process clear? (Y/N)
- Lost any data during errors? (Y/N)

## Daily Tracking
- [ ] Monitor user registrations by segment
- [ ] Track scenario completion rates  
- [ ] Collect and analyze feedback
- [ ] Identify and prioritize bug fixes
- [ ] Update users on progress and fixes

## Weekly Reviews
- [ ] Generate comprehensive analytics report
- [ ] Conduct focus group sessions
- [ ] Plan feature improvements based on feedback
- [ ] Adjust testing scenarios if needed
- [ ] Communicate progress to stakeholders
EOF

# Create metrics dashboard
cat > beta-testing/metrics-dashboard.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Beta Testing Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { display: inline-block; margin: 10px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .metric h3 { margin-top: 0; color: #2E7D32; }
        .progress { width: 200px; height: 20px; background: #f0f0f0; border-radius: 10px; overflow: hidden; }
        .progress-bar { height: 100%; background: #4CAF50; transition: width 0.3s; }
        .status-good { color: #4CAF50; }
        .status-warning { color: #FF9800; }
        .status-error { color: #F44336; }
    </style>
</head>
<body>
    <h1>🧪 Beta Testing Dashboard</h1>
    <p>Real-time tracking of beta user testing progress</p>
    
    <div class="metric">
        <h3>User Registration</h3>
        <div class="progress">
            <div class="progress-bar" style="width: 0%" id="user-progress"></div>
        </div>
        <p><span id="user-count">0</span> / 100 users</p>
    </div>
    
    <div class="metric">
        <h3>Scenario Completion</h3>
        <div class="progress">
            <div class="progress-bar" style="width: 0%" id="scenario-progress"></div>
        </div>
        <p><span id="scenario-rate">0</span>% average completion</p>
    </div>
    
    <div class="metric">
        <h3>User Satisfaction</h3>
        <div class="progress">
            <div class="progress-bar" style="width: 0%" id="satisfaction-progress"></div>
        </div>
        <p><span id="satisfaction-rating">0.0</span> / 5.0 average rating</p>
    </div>
    
    <div class="metric">
        <h3>Active Issues</h3>
        <p class="status-good" id="issues-count">0 critical issues</p>
    </div>
    
    <h2>Segment Breakdown</h2>
    <div id="segments">
        <div class="metric">
            <h3>🚀 Crypto-Native</h3>
            <p><span id="crypto-count">0</span> / 50</p>
        </div>
        <div class="metric">
            <h3>🌱 Environmental</h3>
            <p><span id="env-count">0</span> / 25</p>
        </div>
        <div class="metric">
            <h3>👨‍💻 Developers</h3>
            <p><span id="dev-count">0</span> / 15</p>
        </div>
        <div class="metric">
            <h3>🏛️ Foundations</h3>
            <p><span id="foundation-count">0</span> / 10</p>
        </div>
    </div>
    
    <script>
        // Simulated data - replace with real API calls
        function updateDashboard() {
            // This would connect to your feedback API
            fetch('/api/feedback/summary')
                .then(response => response.json())
                .then(data => {
                    // Update metrics based on real data
                    console.log('Dashboard data:', data);
                })
                .catch(error => {
                    console.log('Demo mode - using simulated data');
                    
                    // Demo progress simulation
                    const progress = Math.min(100, (Date.now() % 100000) / 1000);
                    document.getElementById('user-progress').style.width = progress + '%';
                    document.getElementById('user-count').textContent = Math.floor(progress);
                });
        }
        
        // Update dashboard every 30 seconds
        updateDashboard();
        setInterval(updateDashboard, 30000);
    </script>
</body>
</html>
EOF

echo ""
echo "✅ Beta testing infrastructure activated!"
echo ""
echo "📁 Created directories:"
echo "   - beta-testing/logs (for testing logs)"
echo "   - beta-testing/feedback (for user feedback)"
echo "   - beta-testing/metrics (for analytics)"
echo "   - beta-testing/reports (for daily reports)"
echo ""
echo "🛠️ Created tools:"
echo "   - user-tracker.js (user progress tracking)"
echo "   - feedback-api.js (feedback collection API)"
echo "   - testing-checklist.md (scenario tracking)"
echo "   - metrics-dashboard.html (real-time dashboard)"
echo ""
echo "🚀 Next steps:"
echo "   1. Start feedback API: cd beta-testing && node feedback-api.js"
echo "   2. Open dashboard: open metrics-dashboard.html"
echo "   3. Begin user recruitment campaigns"
echo "   4. Monitor daily progress and feedback"
echo ""
echo "📊 Success metrics to track:"
echo "   - Registration: 100 users across 4 segments"
echo "   - Completion: >80% per scenario"
echo "   - Satisfaction: >4.0/5.0 rating"
echo "   - Issues: <5% critical error rate"
