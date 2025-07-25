/**
 * Vercel Serverless Function for Beta Feedback Collection
 * Deployed as /api/feedback
 */

const fs = require('fs');
const path = require('path');

// In-memory storage for Vercel (you could use a database for production)
let feedbackData = [];

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'POST') {
            // Submit feedback
            const feedback = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                userAgent: req.headers['user-agent'],
                ...req.body
            };

            feedbackData.push(feedback);

            console.log('Beta Feedback Received:', {
                id: feedback.id,
                type: feedback.type,
                rating: feedback.rating,
                timestamp: feedback.timestamp
            });

            return res.status(201).json({
                success: true,
                message: 'Feedback received successfully',
                feedbackId: feedback.id
            });

        } else if (req.method === 'GET') {
            // Get feedback summary
            const summary = {
                totalFeedback: feedbackData.length,
                averageRating: feedbackData.length > 0
                    ? feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackData.length
                    : 0,
                feedbackTypes: feedbackData.reduce((types, f) => {
                    types[f.type] = (types[f.type] || 0) + 1;
                    return types;
                }, {}),
                recentFeedback: feedbackData
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .slice(0, 10)
                    .map(f => ({
                        id: f.id,
                        type: f.type,
                        rating: f.rating,
                        timestamp: f.timestamp,
                        feature: f.feature
                    })),
                lastUpdated: new Date().toISOString()
            };

            return res.status(200).json(summary);
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('Feedback API Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
