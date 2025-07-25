/**
 * Vercel Serverless Function for Platform Health Check
 * Deployed as /api/health
 */

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const healthData = {
            status: 'healthy',
            environment: 'beta',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0-beta',
            platform: 'vercel',
            services: {
                frontend: 'operational',
                api: 'operational',
                feedback: 'operational'
            },
            lastDeployed: process.env.VERCEL_GIT_COMMIT_SHA ?
                new Date().toISOString() : 'local-development'
        };

        return res.status(200).json(healthData);
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
