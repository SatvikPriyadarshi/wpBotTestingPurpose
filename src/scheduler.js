const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const SCHEDULE_FILE = path.join(__dirname, '..', 'data', 'todaySchedule.json');

class Scheduler {
    constructor(bot, messageManager, config) {
        this.bot = bot;
        this.messageManager = messageManager;
        this.config = config;
        this.scheduledJobs = [];
        this.midnightJob = null;
        this.todayTimes = null; // { date: "YYYY-MM-DD", morning: {h,m}, night: {h,m}, random: {h,m} }
    }

    getTodayDateIST() {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    }

    getRandomTime(startHour, startMinute, endHour, endMinute) {
        const startTime = startHour * 60 + startMinute;
        let endTime = endHour * 60 + endMinute;

        if (endTime <= startTime) {
            endTime += 24 * 60;
        }

        const randomMinutes = Math.floor(Math.random() * (endTime - startTime)) + startTime;
        const hour = Math.floor(randomMinutes / 60) % 24;
        const minute = randomMinutes % 60;

        return { hour, minute };
    }

    loadTodaySchedule() {
        try {
            if (fs.existsSync(SCHEDULE_FILE)) {
                const data = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf8'));
                if (data.date === this.getTodayDateIST()) {
                    console.log(`Loaded existing schedule for today (${data.date})`);
                    return data;
                }
                console.log(`Saved schedule is for ${data.date}, today is ${this.getTodayDateIST()} — generating new times`);
            }
        } catch (err) {
            console.error('Could not read schedule file, generating fresh times:', err.message);
        }
        return null;
    }

    saveTodaySchedule(schedule) {
        try {
            fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(schedule, null, 2));
        } catch (err) {
            console.error('Could not save schedule file:', err.message);
        }
    }

    generateTodayTimes() {
        const morningTime = this.getRandomTime(
            this.config.timing.morning.startHour,
            this.config.timing.morning.startMinute,
            this.config.timing.morning.endHour,
            this.config.timing.morning.endMinute
        );

        const nightTime = this.getRandomTime(
            this.config.timing.night.startHour,
            this.config.timing.night.startMinute,
            this.config.timing.night.endHour,
            this.config.timing.night.endMinute
        );

        let randomTime = null;
        if (this.config.timing.randomDay.enabled) {
            randomTime = this.getRandomTime(
                this.config.timing.randomDay.startHour,
                this.config.timing.randomDay.startMinute,
                this.config.timing.randomDay.endHour,
                this.config.timing.randomDay.endMinute
            );
        }

        return {
            date: this.getTodayDateIST(),
            morning: morningTime,
            night: nightTime,
            random: randomTime
        };
    }

    scheduleMessage(time, category, description) {
        const { hour, minute } = time;
        const cronExpression = `${minute} ${hour} * * *`;

        console.log(`Scheduled ${description} for ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);

        const job = cron.schedule(cronExpression, async () => {
            try {
                console.log(`[${new Date().toISOString()}] Sending ${description}...`);
                const message = await this.messageManager.getRandomMessage(category);
                await this.bot.sendMessage(message);
                console.log(`[${new Date().toISOString()}] ${description} sent successfully`);

                const stats = this.messageManager.getStats();
                console.log(`Message stats - Morning: ${stats.morning.remaining}/${stats.morning.total}, Night: ${stats.night.remaining}/${stats.night.total}, Random: ${stats.random.remaining}/${stats.random.total}`);
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Error sending ${description}:`, error);
            }
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        this.scheduledJobs.push(job);
        return job;
    }

    scheduleDailyMessages() {
        const today = this.getTodayDateIST();

        // If we already have times locked for today and cron jobs are running, skip
        if (this.todayTimes && this.todayTimes.date === today && this.scheduledJobs.length > 0) {
            console.log(`Schedule already active for today (${today}) — skipping reschedule`);
            return;
        }

        console.log('Scheduling daily messages...');
        this.stopMessageJobs();

        // Try loading persisted schedule for today, otherwise generate new times
        let times = this.loadTodaySchedule();
        if (!times) {
            times = this.generateTodayTimes();
            this.saveTodaySchedule(times);
            console.log(`Generated and saved new schedule for ${times.date}`);
        }

        this.todayTimes = times;

        this.scheduleMessage(times.morning, 'morning', 'Good Morning message');
        this.scheduleMessage(times.night, 'night', 'Good Night message');

        if (times.random) {
            this.scheduleMessage(times.random, 'random', 'Random Daytime message');
        }

        // Set up midnight job to auto-generate tomorrow's schedule
        this.setupMidnightReschedule();

        console.log('All messages scheduled successfully!');
        console.log('Bot is running. Press Ctrl+C to stop.');
    }

    setupMidnightReschedule() {
        if (this.midnightJob) return; // already set up

        this.midnightJob = cron.schedule('1 0 * * *', () => {
            console.log(`[${new Date().toISOString()}] Midnight — generating new schedule for today`);
            this.todayTimes = null; // force new times
            this.stopMessageJobs();
            this.scheduleDailyMessages();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });
        console.log('Midnight reschedule job active (00:01 IST daily)');
    }

    stopMessageJobs() {
        this.scheduledJobs.forEach(job => job.stop());
        this.scheduledJobs = [];
        console.log('All scheduled message jobs stopped');
    }

    stopAllJobs() {
        this.stopMessageJobs();
        if (this.midnightJob) {
            this.midnightJob.stop();
            this.midnightJob = null;
        }
        console.log('All jobs stopped (including midnight reschedule)');
    }

    rescheduleMessages() {
        console.log('Force rescheduling messages with new times...');
        this.todayTimes = null;
        this.stopMessageJobs();
        this.scheduleDailyMessages();
    }

    getSchedule() {
        return {
            date: this.todayTimes?.date || 'N/A',
            morning: this.todayTimes?.morning || null,
            night: this.todayTimes?.night || null,
            random: this.todayTimes?.random || null,
            activeJobs: this.scheduledJobs.length
        };
    }
}

module.exports = Scheduler;