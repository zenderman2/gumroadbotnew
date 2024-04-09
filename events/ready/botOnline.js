const { ActivityType } = require('discord.js');
const cron = require('node-cron');
const profileG = require('../../schemas/userProfile.js');
const axios = require('axios');
require('dotenv/config')

async function verifyLicense(profileData) {
    try {
        const emailId = profileData.emailId;

        const response = await axios.get(`https://api.gumroad.com/v2/products/${process.env.product_id}/subscribers`, {
            params: {
                email: emailId,
            },
            headers: {
                Authorization: `Bearer ${process.env.auth_token}`
            }
        });

        const responseData = response.data;

        if (responseData.success) {
            const success = responseData.subscribers.some(data => data.status === 'alive');
            return success;
        } else {
            throw new Error(responseData.message);
        }
    } catch (error) {
        throw new Error('Failed to verify license: ' + error.message);
    }
}

async function verifyLicensesForAllUsers(client) {
    try {

        const allProfiles = await profileG.find({});

        for (const profile of allProfiles) {
            const success = await verifyLicense(profile);
            const guildId = profile.guildId;
            const userId = profile.userId;   

            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
                continue;
            }

            const member = await guild.members.fetch(userId);
            const roleToRemove = guild.roles.cache.find(role => role.name === process.env.role_name);           

            if (!success && roleToRemove && member.roles.cache.has(roleToRemove.id) && profile.linked) {
                await member.roles.remove(roleToRemove);
                const userProfile = await profileG.findOneAndUpdate({ userId: profile.userId }, { $unset: { emailId: "" }, linked: false }, { new: true });

                await userProfile.save();
            }
        }

        console.log('License verification for all users completed.');
    } catch (error) {
        console.error('Error occurred during license verification:', error);
    }
}

module.exports = async (client) => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("Panel", { type: ActivityType.Watching });

    cron.schedule('0 0 */24 * * *', async () => {
      console.log('Running license verification for all users...');
      await verifyLicensesForAllUsers(client);
    });
}