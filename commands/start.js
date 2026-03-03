const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const pool = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Créez votre profil pour commencer à jouer !'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Vérifier si l'utilisateur a déjà un profil
        const existingProfile = await pool.query(`
            SELECT * FROM "User" WHERE discordid = $1
        `, [userId]);

        if (existingProfile.rows.length > 0) {
            return interaction.reply({
                content: "🌾 Votre profil existe déjà ! Vous pouvez déjà utiliser les commandes de base.",
                ephemeral: true
            });
        }
        
        // Créer un nouveau profil pour l'utilisateur
        await pool.query(`
            INSERT INTO "User" (discordid, money, lastdaily, createdat)
            VALUES ($1, $2, $3, NOW())
        `, [userId, 50, null]);

        const embed = new EmbedBuilder()
            .setTitle('Bienvenue dans StardewBot ! 🌾')
            .setColor(0x34d399)
            .setDescription(`Votre profil a été créé avec succès, **${interaction.user.username}** !\n\n` +
                'Vous commencez avec **50** <:coin:1476599428835053629> pour vous lancer dans l\'aventure.\n' +
                'Vous retrouverez toutes les règles et commandes de base avec la commande `/help` !\n\n' +
                'Amusez-vous bien !\n' +
                '*© 2026 StardewBot - @neighskalye*'
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, extension: 'png', size: 512 }))
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};