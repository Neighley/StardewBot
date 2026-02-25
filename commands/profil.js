const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const pool = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Affiche le profil d\'un utilisateur')
        .addUserOption(option =>
            option.setName('utilisateur')
                .setDescription('L\'utilisateur dont vous voulez voir le profil')
                .setRequired(false)),

    async execute(interaction) {
        // Pour les slash commands: récupérer l'utilisateur de l'option
        // Pour les boutons: utiliser l'utilisateur actuel
        const targetUser = interaction.isChatInputCommand() 
            ? (interaction.options.getUser('utilisateur') || interaction.user)
            : interaction.user;
        const discordId = targetUser.id;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('relations')
                    .setLabel('Voir les relations')
                    .setStyle(ButtonStyle.Primary)
            );

        try {
            let userResult = await pool.query('SELECT * FROM "User" WHERE discordid = $1', [discordId]);
            if (userResult.rows.length === 0) {
                await pool.query('INSERT INTO "User" (discordid, money, lastdaily, createdat) VALUES ($1, $2, $3, NOW())', 
                    [discordId, 0, null]
                );

                userResult = await pool.query('SELECT * FROM "User" WHERE discordid = $1', [discordId]);
            }

            const user = userResult.rows[0];

            const embed = new EmbedBuilder()
                .setTitle(`Profil de ${targetUser.username}`)
                .setColor('#ae8af7')
                .setThumbnail(targetUser.displayAvatarURL({ extension: 'png', size: 128 }))
                .addFields(
                    { name: 'Argent', value: `${user.money} pièce(s) d\'or`, inline: true },
                    { name: 'Dernier daily', value: user.lastdaily ? new Date(user.lastdaily).toLocaleString() : 'Jamais', inline: true },
                    { name: 'Date de création', value: new Date(user.createdat).toLocaleString(), inline: false }
                );

            // Si l'interaction vient d'un bouton / composant, on met à jour le message original
            if (interaction.isMessageComponent()) {
                await interaction.update({ embeds: [embed], components: [row] });

            } else {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({ embeds: [embed], components: [row] });
                } else {
                    await interaction.reply({ embeds: [embed], components: [row] });
                }
            }

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Une erreur est survenue lors de la récupération du profil.', ephemeral: true });
        }
    }
};