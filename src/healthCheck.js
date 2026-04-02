// Health Check HTTP Server
// Provides a simple HTTP endpoint to check if the bot is running
// Useful for uptime monitoring services like UptimeRobot

const http = require('http');

class HealthCheckServer {
    constructor(bot, port = 3000) {
        this.bot = bot;
        this.port = port;
        this.server = null;
        this.startTime = new Date();
    }

    start() {
        this.server = http.createServer((req, res) => {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            res.setHeader('Content-Type', 'application/json');

            // Health check endpoint
            if (req.url === '/health' || req.url === '/') {
                const uptime = Math.floor((new Date() - this.startTime) / 1000);
                const stats = this.bot.messageManager.getStats();
                
                const healthData = {
                    status: 'ok',
                    timestamp: new Date().toISOString(),
                    uptime: uptime,
                    uptimeFormatted: this.formatUptime(uptime),
                    whatsapp: {
                        connected: this.bot.isReady,
                        status: this.bot.isReady ? 'connected' : 'disconnected'
                    },
                    messages: {
                        morning: {
                            total: stats.morning.total,
                            used: stats.morning.used,
                            remaining: stats.morning.remaining
                        },
                        night: {
                            total: stats.night.total,
                            used: stats.night.used,
                            remaining: stats.night.remaining
                        },
                        random: {
                            total: stats.random.total,
                            used: stats.random.used,
                            remaining: stats.random.remaining
                        }
                    },
                    config: {
                        targetNumber: this.bot.config.targetNumber ? '***' + this.bot.config.targetNumber.slice(-4) : 'not set',
                        timezone: process.env.TIMEZONE || 'Asia/Kolkata'
                    }
                };

                res.writeHead(200);
                res.end(JSON.stringify(healthData, null, 2));
            }
            // Status endpoint (simple)
            else if (req.url === '/status') {
                const statusData = {
                    status: this.bot.isReady ? 'running' : 'starting',
                    uptime: Math.floor((new Date() - this.startTime) / 1000)
                };

                res.writeHead(200);
                res.end(JSON.stringify(statusData));
            }
            // Ping endpoint (minimal)
            else if (req.url === '/ping') {
                res.writeHead(200);
                res.end('pong');
            }
            // 404 for other routes
            else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        });

        this.server.listen(this.port, () => {
            console.log(`✅ Health check server running on port ${this.port}`);
            console.log(`📊 Health endpoint: http://localhost:${this.port}/health`);
            console.log(`🏓 Ping endpoint: http://localhost:${this.port}/ping`);
        });

        // Handle server errors
        this.server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${this.port} is already in use`);
                console.log(`💡 Trying port ${this.port + 1}...`);
                this.port = this.port + 1;
                this.start();
            } else {
                console.error('❌ Health check server error:', error);
            }
        });
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                console.log('✅ Health check server stopped');
            });
        }
    }

    formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

        return parts.join(' ');
    }
}

module.exports = HealthCheckServer;
