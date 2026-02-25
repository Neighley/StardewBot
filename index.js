const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
require("dotenv").config();

// Création du client Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Collection des commandes
client.commands = new Collection();

// Chargement des fichiers de commandes
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`⚠️ La commande ${file} est invalide (data ou execute manquant).`);
  }
}

// Quand le bot est prêt
client.once(Events.ClientReady, c => {
  console.log(`🌾 StardewBot connecté en tant que ${c.user.tag}`);
});

// Gestion des interactions (slash commands)
client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'relations' || interaction.customId.startsWith('relations_page_')) {
      return require('./interactions/relations')(interaction, client);
    }
    if (interaction.customId === 'back_to_profile') { 
      return require('./commands/profil').execute(interaction); }
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`❌ Commande ${interaction.commandName} introuvable.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ Une erreur est survenue lors de l'exécution de la commande.",
      ephemeral: true
    });
  }
});

// Connexion du bot
client.login(process.env.TOKEN);
