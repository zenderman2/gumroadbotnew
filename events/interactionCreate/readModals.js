require('dotenv/config')
const profileG = require('../../schemas/userProfile.js');
const axios = require('axios');
const {EmbedBuilder} = require('discord.js');

async function verifyLicense(emailId) {
    try {
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
            return responseData.subscribers;
        } else {
            throw new Error(responseData.message);
        }
    } catch (error) {
        throw new Error('Failed to verify license: ' + error.message);
    }
}

module.exports = async (interaction) => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId === 'sync') {
        const profileData = await profileG.findOne({ userId: interaction.user.id })

        if (!profileData) {
            const emailId = interaction.fields.getTextInputValue('email');
            const license = interaction.fields.getTextInputValue('license');

            const guild = interaction.guild;
            const role = guild.roles.cache.find(role => role.name === process.env.role_name);
            const member = await guild.members.fetch(interaction.user.id);

            try {
                const generatedData = await verifyLicense(emailId);

                if (generatedData.some(data => data.license_key === license && data.status === 'alive')) {
                    const userProfile = new profileG({
                        userId: interaction.user.id,
                        emailId: emailId,
                        guildId: interaction.guild.id,
                        linked: true,
                    });

                    const logEmbed = new EmbedBuilder()
                      .setTitle('Account Synchronized ✅')
                      .setDescription(`${interaction.user} has successfully linked their account.`)
                      .setColor('Green')

                    await userProfile.save();
                    const channelId = process.env.log_channel_id;
                    const channel = interaction.guild.channels.cache.get(channelId);
                    if (member.roles.cache.has(role)) {
                      channel.send({embeds: [logEmbed]})
                      return await interaction.reply({ content: 'Your submission was verified successfully!', ephemeral: true });
                    }
                    channel.send({embeds: [logEmbed]})
                    await interaction.member.roles.add(role);
                    return await interaction.reply({ content: 'Your submission was verified successfully!', ephemeral: true });
                }

                return await interaction.reply({ content: 'Failed to verify either email or license key.\n``What you can do?\n->Make sure you paste it exactly the same.\n->Make sure your subscription is still on.``', ephemeral: true });

            } catch (error) {
                await interaction.reply({ content: 'An error occurred while verifying your license.', ephemeral: true });
            } 
        } else {
            const profileData = await profileG.findOne({ userId: interaction.user.id })
            if (profileData.linked) {
                return await interaction.reply({ content: 'Your account is already linked.', ephemeral: true });
            } else if (profileData) {
              const emailId = interaction.fields.getTextInputValue('email');
              const license = interaction.fields.getTextInputValue('license');

              const guild = interaction.guild;
              const role = guild.roles.cache.find(role => role.name === process.env.role_name);
              const member = await guild.members.fetch(interaction.user.id);

              try {
                  const generatedData = await verifyLicense(emailId);

                  if (generatedData.some(data => data.license_key === license && data.status === 'alive')) {
                    
                    const userProfile = await profileG.findOneAndUpdate({ userId: interaction.user.id }, { emailId: emailId, linked: true }, { new: true });

                    await userProfile.save();

                    const logEmbed = new EmbedBuilder()
                    .setTitle('Account Synchronized ✅')
                    .setDescription(`${interaction.user} has successfully linked their account.`)
                    .setColor('Green')
                    
                    const channelId = process.env.log_channel_id;
                    const channel = interaction.guild.channels.cache.get(channelId);
                    
                      if (member.roles.cache.has(role)) {
                        channel.send({embeds: [logEmbed]})
                        return await interaction.reply({ content: 'Your submission was verified successfully!', ephemeral: true });
                      }
                      channel.send({embeds: [logEmbed]})
                      await interaction.member.roles.add(role);
                      return await interaction.reply({ content: 'Your submission was verified successfully!', ephemeral: true });
                  }

                  return await interaction.reply({ content: 'Failed to verify either email or license key.\n``What you can do?\n->Make sure you paste it exactly the same.\n->Make sure your subscription is still on.``', ephemeral: true });
            } catch (e) {
                await interaction.reply({ content: 'An error occurred while verifying your license.', ephemeral: true });
            }
        }
    }
  }
}
