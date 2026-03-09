const cron = require('node-cron');

class Scheduler {
    constructor(bot, messageManager, config) {
        this.bot = bot;
        this.messageManager = messageManager;
        this.config = config;
        this.scheduledJobs = [];
    }

    // Generate a random time within a window
    getRandomTime(startHour, startMinute, endHour, endMinute) {
        const startTime = startHour * 60 + startMinute;
        let endTime = endHour * 60 + endMinute;
        
        // Handle midnight wrap-around
        if (endTime <= startTime) {
            endTime += 24 * 60;
        }
        
        const randomMinutes = Math.floor(Math.random() * (endTime - startTime)) + startTime;
        
        // Convert back to hours and minutes
        const hour = Math.floor(randomMinutes / 60) % 24;
        const minute = randomMinutes % 60;
        
        return { hour, minute };
    }

    // Schedule a message at a specific time
    scheduleMessage(time, category, description) {
        const { hour, minute } = time;
        
        // Create cron expression (minute hour * * *)
        const cronExpression = `${minute} ${hour} * * *`;
        
        console.log(`Scheduled ${description} for ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
        
        const job = cron.schedule(cronExpression, async () => {
            try {
                console.log(`[${new Date().toISOString()}] Sending ${description}...`);
                const message = await this.messageManager.getRandomMessage(category);
                const result = await this.bot.sendMessage(message);
                console.log(`[${new Date().toISOString()}] ${description} sent successfully`);
                
                // Log statistics
                const stats = this.messageManager.getStats();
                console.log(`Message stats - Morning: ${stats.morning.remaining}/${stats.morning.total}, Night: ${stats.night.remaining}/${stats.night.total}, Random: ${stats.random.remaining}/${stats.random.total}`);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Error sending ${description}:`, error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata" // Changed to IST timezone
        });
        
        this.scheduledJobs.push(job);
        return job;
    }

    // Schedule all daily messages
    scheduleDailyMessages() {
        console.log('Scheduling daily messages...');
        
        // Clear any existing jobs
        this.stopAllJobs();
        
        // Schedule morning message
        const morningTime = this.getRandomTime(
            this.config.timing.morning.startHour,
            this.config.timing.morning.startMinute,
            this.config.timing.morning.endHour,
            this.config.timing.morning.endMinute
        );
        
        this.scheduleMessage(
            morningTime,
            'morning',
            'Good Morning message'
        );
        
        // Schedule night message
        const nightTime = this.getRandomTime(
            this.config.timing.night.startHour,
            this.config.timing.night.startMinute,
            this.config.timing.night.endHour,
            this.config.timing.night.endMinute
        );
        
        this.scheduleMessage(
            nightTime,
            'night',
            'Good Night message'
        );
        
        // Schedule random daytime message (if enabled)
        if (this.config.timing.randomDay.enabled) {
            const randomTime = this.getRandomTime(
                this.config.timing.randomDay.startHour,
                this.config.timing.randomDay.startMinute,
                this.config.timing.randomDay.endHour,
                this.config.timing.randomDay.endMinute
            );
            
            this.scheduleMessage(
                randomTime,
                'random',
                'Random Daytime message'
            );
        }
        
        console.log('All messages scheduled successfully!');
        console.log('Bot is running. Press Ctrl+C to stop.');
    }

    // Stop all scheduled jobs
    stopAllJobs() {
        this.scheduledJobs.forEach(job => job.stop());
        this.scheduledJobs = [];
        console.log('All scheduled jobs stopped');
    }

    // Reschedule all messages (useful for testing or time changes)
    rescheduleMessages() {
        console.log('Rescheduling messages...');
        this.scheduleDailyMessages();
    }

    // Get current schedule
    getSchedule() {
        return this.scheduledJobs.map((job, index) => {
            const task = job.getTasks()[0];
            return {
                id: index,
                expression: task.cronExpression,
                nextRun: task.nextRun()
            };
        });
    }
}

module.exports = Scheduler;