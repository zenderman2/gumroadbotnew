const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const profileG = require('../schemas/userProfile.js');

module.exports = {
  data: {
      name: `unlink`,
      description: `Unlink someone's discord account from gumroad.`,
      options: [
        {
          name: 'user',
          description: 'The user to unlink.',
          type: 6,
          required: true,
        }
      ]
  },

  run: async ({ interaction }) => {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true })
   } else {
      const user = interaction.options.getUser('user');
      const profileData = await profileG.findOne({ userId: user.id });
      if (!profileData.linked) {
        return await interaction.reply({ content: 'The user is not linked.', ephemeral: true });
      } else {
        const userProfile = await profileG.findOneAndUpdate({ userId: interaction.user.id }, { $unset: { emailId: "" }, linked: false }, { new: true });

          await userProfile.save();
        const logEmbed = new EmbedBuilder()
          .setTitle('Account Unlinked ✅')
          .setDescription(`${user}'s account was unlinked by ${interaction.user}`)
          .setColor('Red')

        const channelId = process.env.log_channel_id;
        const channel = interaction.guild.channels.cache.get(channelId);
        const role = interaction.guild.roles.cache.find(role => role.name === process.env.role_name);

          await interaction.member.roles.remove(role);
          channel.send({embeds: [logEmbed]});
        
        await interaction.reply({ content: 'The user has been unlinked.', ephemeral: true });
      }
   }
  },
}