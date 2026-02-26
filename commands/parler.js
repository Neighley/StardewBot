const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const pool = require('../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parler')
        .setDescription('Parler à un personnage')
        .addStringOption(option =>
            option.setName('pnj')
                .setDescription('Le nom du personnage à qui parler')
                .setRequired(true)
        ),

    async execute(interaction) {
        const pnjName = interaction.options.getString('pnj').toLowerCase();

        const pnj = await pool.query('SELECT * FROM pnj WHERE LOWER(name) = $1', [pnjName]);

        if (pnj.rows.length === 0) {
            return interaction.reply({ content: `❌ Personnage "${pnjName}" introuvable.`, ephemeral: true });
        }

        const { id: pnjId, name } = pnj.rows[0];
        const dialogue = await pool.query(`
            SELECT * FROM Dialogue
            WHERE pnj_id = $1 OR pnj_id IS NULL
            ORDER BY RANDOM()
            LIMIT 1
        `, [pnjId]);

        const imagePnj = await pool.query(`
            SELECT url FROM image
            WHERE ref_id = $1 AND type = 'pnj'
            LIMIT 1
        `, [pnjId]);
        
        const d = dialogue.rows[0];
        const image_url = imagePnj.rows[0]?.url;

        const embed = new EmbedBuilder()
            .setTitle(`${name}`)
            .setAuthor({ name: `Discussion` })
            .setDescription(d.text)
            .setColor(0xfbbf24)
            .setThumbnail(image_url || 'https://cdn.discordapp.com/attachments/1476168356444414215/1476168360422038096/default_pnj.png')
            .setTimestamp();

        if(d.type === 'monologue') {
            return interaction.reply({ embeds: [embed] });
        }

        if(d.type === 'question') {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`dialogue_positive`)
                        .setLabel('Oui')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`dialogue_negative`)
                        .setLabel('Non')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`dialogue_neutral`)
                        .setLabel('Je ne sais pas')
                        .setStyle(ButtonStyle.Secondary)
                );
            return interaction.reply({ embeds: [embed], components: [row] });
        }

        return interaction.reply("Ce texte n'est pas généré pour le moment.");
    }
};