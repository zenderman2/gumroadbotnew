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
const { PermissionsBitField } = require("discord.js");
require("dotenv/config");
const panelS = require("../schemas/panelStore.js");

module.exports = {
  data: {
    name: `gumroadpanel`,
    description: `Open a gumroad panel for account synchronization.`,
  },

  run: async ({ interaction }) => {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    try {
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

      //Button Part
      const sync = new ButtonBuilder()
        .setCustomId("sync")
        .setLabel("Verify")
        .setStyle(ButtonStyle.Success);

      const unlink = new ButtonBuilder()
        .setCustomId("unlink")
        .setLabel("Unlink")
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(sync, unlink);

      //Embed Message
      const embed = new EmbedBuilder()
        .setTitle("Account Synchronization")
        .setDescription(
          "> To ensure a seamless experience on our server, we have implemented an account linking system and role synchronization between **Tools** and **Discord**. Please use the buttons below to link your account.\n\n(1) **New Users** : Automatically granted subscriber role based on the Discord ID provided on your Gumroad checkout.\n\n(2) **Existing Users** : Click the **Verify** button and provide your email and license key to link your account.\n\n❗Unlink your account by clicking the third button `[Unlink]`\n\n> FAQ: What's this for? Priority support is offered those who are subscribed to the Tools premium.",
        )
        .setColor("#7AB6DA");

      const reply = interaction.channel.send({
        embeds: [embed],
        components: [row],
      })

      await interaction.reply({content: "Panel sent!", ephemeral: true});

      const panelData = await panelS.findOne();

      if (!panelData) {
        const panel = new panelS({
          messageId: reply.id,
          buttons: ["sync", "unlink"],
        });
        await panel.save();
      } else {
        const panel = await panelS.findOneAndUpdate({}, {messageId: reply.id}, {new: true})
        await panel.save();
      }
      
    } catch (error) {
      return interaction.reply({
        content: "An error occurred while making the panel.",
        ephemeral: true,
      });
    }
  },
};
