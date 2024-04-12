require('dotenv/config')
const profileG = require('../../schemas/userProfile.js');
const axios = require('axios');
const {EmbedBuilder} = require('discord.js');

async function verifyLicenseExist(licenseKey) {
    try {
        const formData = new URLSearchParams();
        formData.append('license_key', licenseKey);
        formData.append('product_id', process.env.product_id);

        const response = await axios.post('https://api.gumroad.com/v2/licenses/verify', formData);

        const responseData = response.data;

        if (responseData.success) {
           console.log(responseData.purchase);
            return responseData.purchase;
        } else {
            throw new Error(responseData.message);
        }
    } catch (error) {
        throw new Error('Failed to verify license: ' + error.message);
    }
}

async function verifyLicense() {
    try {
        const response = await axios.get(`https://api.gumroad.com/v2/products/${process.env.product_id}/subscribers`, {
            headers: {
                Authorization: `Bearer ${process.env.auth_token}`
            }
        });

        const responseData = response.data;

        if (responseData.success) {
            return await verifyLicenseExist(responseData.subscribers.find(data => data.status === 'alive').license_key);
        } else {
            throw new Error(responseData.message);
        }
    } catch (error) {
        throw new Error('Failed to verify license: ' + error.message);
    }
}

module.exports = async (member, client) => {
    if (member.user.bot) return;

    const profileData = await profileG.findOne({ userId: member.user.id });

    const guild = client.guilds.cache.get(member.guild.id);

    const user = await guild.members.fetch(member.user.id);
    const roleToAdd = guild.roles.cache.find(role => role.name === process.env.role_name);

    const data = await verifyLicense()
    if (data['Discord ID'] === member.user.id) {
        if (!profileData) {
          const userProfile = new profileG({
              userId: member.user.id,
              emailId: data.email,
              guildId: member.guild.id,
              linked: true,
          });
          await userProfile.save();
          await user.roles.add(roleToAdd);
        } else if (profileData.linked) {
          return await interaction.reply({ content: 'Your account is already linked.', ephemeral: true });
      } else {
          const userProfile = await profileG.findOneAndUpdate({ userId: member.user.id }, { emailId: data.email, linked: true }, { new: true });

          await userProfile.save();
          await user.roles.add(roleToAdd);
      }
    }
}