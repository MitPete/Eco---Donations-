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
