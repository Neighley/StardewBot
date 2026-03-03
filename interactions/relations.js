const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const pool = require('../db');

module.exports = async(interaction, client) => {
    // customId peut être : 'relations_<discordId>'
    // Extraire l'ID de l'utilisateur cible du customId
    const targetDiscordId = interaction.customId.split('_')[1];

    try {
        // Récupère l'utilisateur 'User' en base
        const userResult = await pool.query('SELECT * FROM "User" WHERE discordid = $1', [targetDiscordId]);
        const user = userResult.rows[0];

        // Récupère l'utilisateur Discord pour le bon avatar
        const discordUser = await client.users.fetch(targetDiscordId);

        const relationsResult = await pool.query(`
            SELECT p.id AS pnj_id, p.name, COALESCE(r.hearts, 0) AS hearts, COALESCE(r.xp_hearts, 0) AS xp_hearts,
                i.discordEmote AS icon
            FROM pnj p LEFT JOIN relationship r 
                ON r.pnj_id = p.id AND r.user_id = $1
            LEFT JOIN image i ON i.ref_id = p.id AND i.type = 'pnj'
            ORDER BY p.name
        `, [user.id]);

        const relations = relationsResult.rows;

        // Afficher tous les PNJ dans un seul embed en excluant certains noms
        const excluded = ['pierre', 'willy', 'clint', 'caroline', 'demetrius', 'dwarf', 'evelyn', 
            'george', 'jas', 'jodi', 'kent', 'krobus', 'lewis', 'linus', 'marnie', 'pam', 'robin', 
            'sandy', 'vincent', 'wizard', 'morris', 'marlon', 'leo', 'gus'];
        const filtered = relations.filter(r => r && r.name && !excluded.includes(r.name.toLowerCase()));
        // Emojis personnalisés pour les coeurs (relations) avec les pnjs
        const heartsemojis = {
            0: '<:pinkheart:1476168572123217971>',
            1: '<:pinkheart:1476168572123217971>',
            2: '<:purpleheart:1476168881688018954>',
            3: '<:purpleheart:1476168881688018954>',
            4: '<:greenheart:1476168784393015398>',
            5: '<:greenheart:1476168784393015398>',
            6: '<:yellowheart:1476168619368120371>',
            7: '<:yellowheart:1476168619368120371>',
            8: '<:blueheart:1476168699843973243>',
            9: '<:blueheart:1476168699843973243>',
            10: '<:whiteheart:1476168933382819930>',
            11: '<:whiteheart:1476168933382819930>',
            12: '<:redheart:1476168657687150642>',
            13: '<:redheart:1476168657687150642>',
            14: '<:blackheart:1476168743641157784>',
        };

        function getHeartEmoji(hearts) {
            if (hearts >= 14) return heartsemojis[14];
            if (hearts >= 12) return heartsemojis[12];
            if (hearts >= 10) return heartsemojis[10];
            if (hearts >= 8)  return heartsemojis[8];
            if (hearts >= 6)  return heartsemojis[6];
            if (hearts >= 4)  return heartsemojis[4];
            if (hearts >= 2)  return heartsemojis[2];
            return heartsemojis[0];
        }

        const heartEmoji = getHeartEmoji(Number(filtered[0]?.hearts || 0));
        const grayheart = '<:grayheart:1476168743641157784>';

        const embed = new EmbedBuilder()
            .setTitle(`Vos relations ${grayheart}`)
            .setColor(0x8b5cf6)
            .setThumbnail(discordUser.displayAvatarURL({ extension: 'png', size: 512 }))
            .setTimestamp();

        if (filtered.length === 0) {
            embed.setDescription('Vous n\'avez encore aucune relation.');
        } else {
            // Barre de progression helper (8 cases, remplissage partiel possible)
            function progressBar(current, max, size = 9) {
                if (!max || max <= 0) return '▱'.repeat(size);

                const ratio = Math.max(0, Math.min(1, current / max));
                const filled = Math.floor(ratio * size);

                return '▰'.repeat(filled) + '▱'.repeat(size - filled);
            }

            const xpCapPerRelation = 100; // ajustable selon ton échelle

            // Ajouter un champ pour chaque PNJ (affichage compact) avec barre XP (une seule ligne)
            filtered.forEach(r => {
                const emoji = r.icon && r.icon.length ? r.icon : '❓';
                const xp = Number(r.xp_hearts) || 0;
                const hearts = Number(r.hearts) || 0;
                const bar = progressBar(xp, xpCapPerRelation, 9);
                const heartEmoji = getHeartEmoji(hearts);
                const value = `${bar} ${xp}/${xpCapPerRelation} XP • ${hearts} ${heartEmoji}`;
                embed.addFields({ name: `${emoji} ${r.name}`, value, inline: true });
            });
        }

        // Simple bouton Retour avec l'ID de l'utilisateur cible
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`back_to_profile_${targetDiscordId}`)
                .setLabel('Retour')
                .setStyle(ButtonStyle.Secondary)
        );

        // Pour les boutons/composants, toujours utiliser update() pour editer le message original
        if (interaction.isMessageComponent()) {
            await interaction.update({ embeds: [embed], components: [row] });
        } else {
            // Pour les slash commands ou autres, utiliser reply()
            await interaction.reply({ embeds: [embed], components: [row] });
        }

    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            try { await interaction.followUp({ content: 'Une erreur est survenue lors de la récupération de vos relations.', ephemeral: true }); } catch(e){}
        } else {
            await interaction.reply({ content: 'Une erreur est survenue lors de la récupération de vos relations.', ephemeral: true });
        }
    }
};