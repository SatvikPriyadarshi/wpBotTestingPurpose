const fs = require('fs').promises;
const path = require('path');

class MessageManager {
    constructor(config) {
        this.config = config;
        this.morningMessages = [];
        this.nightMessages = [];
        this.randomMessages = [];
        this.usedMessages = {
            morning: [],
            night: [],
            random: []
        };
    }

    // Load all messages from JSON files
    async loadMessages() {
        try {
            // Load morning messages
            const morningData = await fs.readFile(this.config.messages.morningFile, 'utf8');
            this.morningMessages = JSON.parse(morningData);
            
            // Load night messages
            const nightData = await fs.readFile(this.config.messages.nightFile, 'utf8');
            this.nightMessages = JSON.parse(nightData);
            
            // Load random messages
            const randomData = await fs.readFile(this.config.messages.randomFile, 'utf8');
            this.randomMessages = JSON.parse(randomData);
            
            // Load used messages
            try {
                const usedData = await fs.readFile(this.config.messages.usedFile, 'utf8');
                this.usedMessages = JSON.parse(usedData);
            } catch (error) {
                // If file doesn't exist, start fresh
                console.log('No used messages file found, starting fresh...');
                await this.saveUsedMessages();
            }
            
            console.log(`Loaded ${this.morningMessages.length} morning messages`);
            console.log(`Loaded ${this.nightMessages.length} night messages`);
            console.log(`Loaded ${this.randomMessages.length} random messages`);
            
            return true;
        } catch (error) {
            console.error('Error loading messages:', error);
            return false;
        }
    }

    // Get a random message from a category
    async getRandomMessage(category) {
        let availableMessages = [];
        let usedList = [];
        
        switch(category) {
            case 'morning':
                availableMessages = this.morningMessages;
                usedList = this.usedMessages.morning;
                break;
            case 'night':
                availableMessages = this.nightMessages;
                usedList = this.usedMessages.night;
                break;
            case 'random':
                availableMessages = this.randomMessages;
                usedList = this.usedMessages.random;
                break;
            default:
                throw new Error(`Unknown message category: ${category}`);
        }
        
        // If all messages are used, reset and start over
        if (usedList.length >= availableMessages.length) {
            console.log(`All ${category} messages have been used. Reshuffling...`);
            this.usedMessages[category] = [];
            usedList = [];
            await this.saveUsedMessages();
        }
        
        // Filter out used messages
        const unusedMessages = availableMessages.filter(msg => !usedList.includes(msg));
        
        if (unusedMessages.length === 0) {
            // This shouldn't happen with the reset above, but just in case
            this.usedMessages[category] = [];
            await this.saveUsedMessages();
            return availableMessages[Math.floor(Math.random() * availableMessages.length)];
        }
        
        // Pick a random unused message
        const randomIndex = Math.floor(Math.random() * unusedMessages.length);
        const selectedMessage = unusedMessages[randomIndex];
        
        // Mark as used
        this.usedMessages[category].push(selectedMessage);
        await this.saveUsedMessages();
        
        return selectedMessage;
    }

    // Save used messages to file
    async saveUsedMessages() {
        try {
            await fs.writeFile(
                this.config.messages.usedFile,
                JSON.stringify(this.usedMessages, null, 2),
                'utf8'
            );
            return true;
        } catch (error) {
            console.error('Error saving used messages:', error);
            return false;
        }
    }

    // Reset used messages for a category
    async resetUsedMessages(category) {
        if (category && this.usedMessages[category]) {
            this.usedMessages[category] = [];
        } else {
            // Reset all
            this.usedMessages = {
                morning: [],
                night: [],
                random: []
            };
        }
        await this.saveUsedMessages();
        console.log(`Reset used messages for ${category || 'all categories'}`);
    }

    // Get statistics
    getStats() {
        return {
            morning: {
                total: this.morningMessages.length,
                used: this.usedMessages.morning.length,
                remaining: this.morningMessages.length - this.usedMessages.morning.length
            },
            night: {
                total: this.nightMessages.length,
                used: this.usedMessages.night.length,
                remaining: this.nightMessages.length - this.usedMessages.night.length
            },
            random: {
                total: this.randomMessages.length,
                used: this.usedMessages.random.length,
                remaining: this.randomMessages.length - this.usedMessages.random.length
            }
        };
    }
}

module.exports = MessageManager;