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

            const { lastdaily } = user;

            // format last daily as a human-friendly relative string
            function formatLastDaily(ts) {
                if (!ts) return "Jamais";
                const last = new Date(ts);
                const now = new Date();
                const diffMs = now - last;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                if (diffDays === 0) return "aujourd'hui";
                if (diffDays === 1) return "hier";
                if (diffDays === 2) return "avant-hier";
                return `il y a ${diffDays} jours`;
            }

            const lastDailyStr = formatLastDaily(lastdaily);
            const creationStr = formatCreationDate(user.createdat);

            const embed = new EmbedBuilder()
                .setTitle(`Profil de ${targetUser.username}`)
                .setColor(0xae8af7)
                .setThumbnail(targetUser.displayAvatarURL({ extension: 'png', size: 128 }))
                .addFields(
                    { name: 'Argent', value: `${user.money} <:coin:1476599428835053629>`, inline: true },
                    { name: 'Dernier daily', value: lastDailyStr, inline: true },
                    { name: 'Date de création', value: creationStr, inline: false }
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

function formatCreationDate(date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `Le ${day}/${month}/${year} à ${hours}h${minutes}`;
}