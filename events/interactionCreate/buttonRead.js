const profileG = require("../../schemas/userProfile.js");
require("dotenv/config");
const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require("discord.js");
const panelS = require("../../schemas/panelStore.js");

module.exports = async (interaction) => {
  if (!interaction.isButton()) return;
  
  const panelData = await panelS.findOne();
  if (!panelData) return;
    
  if (panelData.buttons.includes(interaction.customId)) {
    
    if (interaction.customId === "sync") {

      const syncmodal = new ModalBuilder()
        .setCustomId("sync")
        .setTitle("Authenticate!");

      const emailId = new TextInputBuilder()
        .setCustomId("email")
        .setLabel("Your Email ID:")
        .setStyle(TextInputStyle.Short);

      const license = new TextInputBuilder()
        .setCustomId("license")
        .setLabel("Your License Key:")
        .setStyle(TextInputStyle.Short);

      const firstActionRow = new ActionRowBuilder().addComponents(emailId);
      const secondActionRow = new ActionRowBuilder().addComponents(license);

      syncmodal.addComponents(firstActionRow, secondActionRow);
      
      await interaction.showModal(syncmodal);
      
    } else if (interaction.customId === "unlink") {
      
      const profileData = await profileG.findOne({
        userId: interaction.user.id,
      });
      
      const guild = interaction.guild;
      const role = guild.roles.cache.find(
        (role) => role.name === process.env.role_name,
      );

      if (profileData && profileData.linked) {
        const userProfile = await profileG.findOneAndUpdate(
          { userId: interaction.user.id },
          { $unset: { emailId: "" }, linked: false },
          { new: true },
        );

        await userProfile.save();
        const logEmbed = new EmbedBuilder()
          .setTitle("Account Unlinked ✅")
          .setDescription(
            `${interaction.user} has successfully unlinked their account.`,
          )
          .setColor("Red");

        const channelId = process.env.log_channel_id;
        const channel = interaction.guild.channels.cache.get(channelId);

        await interaction.member.roles.remove(role);
        channel.send({ embeds: [logEmbed] });
        return await interaction.reply({
          content: "Your discord account was unlinked successfully!",
          ephemeral: true,
        });
    } else {
        return await interaction.reply({
          content: "Your discord account isn't linked!",
          ephemeral: true,
        });
    }
   }
  }
}