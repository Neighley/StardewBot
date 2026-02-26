const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const pool = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('news')
        .setDescription('Affiche les informations du jour (météo, saison, événements)'),

    async execute(interaction) {
        const userId = interaction.user.id;

        // Récupérer les données saison + météo
        const world = await pool.query('SELECT season, weather FROM world_state WHERE id = 1');
        const { season, weather } = world.rows[0];

        // Récupérer le daily
        const user = await pool.query('SELECT lastDaily FROM "User" WHERE discordid = $1', [userId]);
        const lastDaily = user.rows[0]?.lastDaily;

        // Date du jour 
        const now = new Date();
        const dateStr = now.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const hourStr = now.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        });

        const seasonMessages = {
            spring: "Il fait bon, il fait doux, c'est le printemps ! Le moment parfait pour se balader en forêt 🌸",
            summer: "Le soleil brille, et il fait chaud, l'été est arrivé ! Parfait pour aller à la plage ☀️",
            fall: "Les feuilles tombent, les couleurs changent, c'est l'automne 🍂 Rien de mieux qu'un bon café chez Gus !",
            winter: "La neige recouvre les arbres, on est en hiver ! Attention à ne pas glisser ❄️"
        };

        const weatherMessages = {
            sunny: {
                main: "Aujourd'hui, le temps est ensoleillé.",
                desc: "N'oubliez pas la crème solaire !"
            },
            rainy: {
                main: "Aujourd'hui, le temps est pluvieux.",
                desc: "Sortez les parapluies !"
            },
            stormy: {
                main: "Aujourd'hui, il y a de l'orage.",
                desc: "Mieux vaut rester à l'intérieur !"
            },
            windy: {
                main: "Aujourd'hui, il y a du vent.",
                desc: "Accrochez-vous à votre chapeau !"
            },
            snowy: {
                main: "Aujourd'hui, le sol est enneigé.",
                desc: "Parfait pour faire un bonhomme de neige !"
            }
        };

        // Daily
        let dailyMessage = "";
        if (!lastDaily) {
            dailyMessage = "Votre daily est disponible ! Utilisez la commande /daily.";
        } else {
            const remaining = getDailyRemaining(new Date(lastDaily).getTime());
            dailyMessage = remaining 
                ? `Votre daily sera disponible dans ${formatDuration(remaining)}.`
                : "Votre daily est disponible ! Utilisez la commande /daily.";
        }

        const embed = new EmbedBuilder()
            .setTitle('📰  Nouvelles du jour bonjour')
            .setColor([133, 204, 255])
            .setThumbnail('https://raw.githubusercontent.com/Neighley/StardewBot/profil/stardewbot-assets/ui/ClockWithJournal.png')
            .setDescription(
                `Aujourd'hui, nous sommes le **${dateStr}**, et il est **${hourStr}**.\n\n` +
                `${seasonMessages[season]}\n` + 
                `${weatherMessages[weather].main}\n` + 
                `${weatherMessages[weather].desc}\n\n` + 
                `${dailyMessage}`
            )
            .setTimestamp();
        
        return interaction.reply({ embeds: [embed] });
    }
};

function getDailyRemaining(lastDaily) {
    if (!lastDaily) return null;
    const now = new Date();
    const last = new Date(lastDaily);

    // if the user already claimed today, compute time until next midnight
    if (last.toDateString() === now.toDateString()) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const diff = tomorrow - now;
        if (diff <= 0) return null;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${hours}h ${minutes}m ${seconds}s`;
    }

    return null;
}