const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const pool = require("../db");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Récupèrer votre récompense quotidienne"),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Récupérer les informations utilisateur
        const user = await pool.query('SELECT id, money, lastdaily FROM "User" WHERE discordid = $1', [userId]);
        // S'il n'a pas de profil, lui dire de faire /start
        if (!user.rows.length) {
            return interaction.reply({ content: "❌ Vous n'avez pas encore de profil. Utilisez **/start** pour en créer un.", ephemeral: true });
        }

        const { money, lastdaily } = user.rows[0];

        const now = new Date();
        let remaining = null;

        if (lastdaily) {
            const lastDate = new Date(lastdaily);
            // same calendar day ?
            if (lastDate.toDateString() === now.toDateString()) {
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                remaining = tomorrow - now; // ms until next midnight
            }
        }

        if (remaining) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

            return interaction.reply({ content: `⏳ Vous avez déjà récupéré votre récompense quotidienne. Revenez dans ${hours}h ${minutes}m ${seconds}s.`, ephemeral: true });
        }

        const reward = Math.floor(Math.random() * (150 - 20 +1)) + 20;
        const newMoney = money + reward;

        await pool.query('UPDATE "User" SET money = $1, lastdaily = NOW() WHERE discordid = $2', [newMoney, userId]);

        const embed = new EmbedBuilder()
            .setTitle('🎁  Récompense quotidienne')
            .setColor(0xfbbf24)
            .setDescription(`Vous avez récupéré votre **daily** ! \n\n` +
                `Vous avez reçu ${reward} <:coin:1476599428835053629> !\n` +
                `Vous avez au total ${newMoney} <:coin:1476599428835053629>.`
            )
            .setTimestamp();
        
        return interaction.reply({ embeds: [embed] });
    }
};