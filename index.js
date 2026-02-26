const fs = require("fs");
const path = require("path");
const { Client, Collection, GatewayIntentBits, Events } = require("discord.js");
const pool = require('./db');
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

const weathers = ["sunny", "rainy", "windy", "stormy", "snowy"];
const seasons = ["spring", "summer", "fall", "winter"];

// Changer la météo tous les jours à 6h du matin
function schedulDailyWeatherUpdate() {
  const now = new Date();
  const next = new Date();
  next.setHours(6, 0, 0, 0);
  if (now >= next) {
    next.setDate(next.getDate() + 1);
  }

  const delay = next - now;

  setTimeout(() => {
    updateWeather();
    setInterval(updateWeather, 24 * 60 * 60 * 1000); // Tous les 24h
  }, delay);
}

async function updateWeather() {
  // Récupérer la saison actuelle
  const result = await pool.query(`SELECT season FROM world_state WHERE id = 1`);
  const season = result.rows[0].season;

  // Probabilités météo selon la saison
  const weatherChances = {
    spring: [
      { type: "sunny", weight: 50 },
      { type: "rainy", weight: 40 },
      { type: "stormy", weight: 10 },
      { type: "windy", weight: 20 }
    ],
    summer: [
      { type: "sunny", weight: 80 },
      { type: "rainy", weight: 10 },
      { type: "stormy", weight: 5 },
      { type: "windy", weight: 20 }
    ],
    fall: [
      { type: "sunny", weight: 30 },
      { type: "rainy", weight: 50 },
      { type: "stormy", weight: 20 },
      { type: "windy", weight: 40 }
    ],
    winter: [
      { type: "sunny", weight: 10 },
      { type: "snowy", weight: 75 },
      { type: "rainy", weight: 60 },
      { type: "stormy", weight: 10 },
      { type: "windy", weight: 25 }
    ]
  };

  const poolSeason = weatherChances[season];
  const totalWeight = poolSeason.reduce((sum, w) => sum + w.weight, 0);
  let random = Math.random() * totalWeight;

  let chosenWeather = poolSeason[0].type;
  for (const w of poolSeason) {
    if (random < w.weight) {
      chosenWeather = w.type;
      break;
    }
    random -= w.weight;
  }

  await pool.query(`
    UPDATE world_state
    SET weather = $1, last_weather_update = NOW()
    WHERE id = 1
  `, [chosenWeather]);

  console.log(`🌤️ Météo mise à jour : ${chosenWeather}`);
}

schedulDailyWeatherUpdate();

// Changer la saison le 1er de chaque mois à 6h du matin
function scheduleMonthlySeasonUpdate() {
  const now = new Date();
  const next = new Date();
  next.setMonth(now.getMonth() +1);
  next.setDate(1);
  next.setHours(6, 0, 0, 0);

  const delay = next - now;

  setTimeout(() => {
    updateSeason();
    setInterval(updateSeason, 30 * 24 * 60 * 60 * 1000); // Tous les 30 jours
  }, delay);
}

async function updateSeason() {
   const result = await pool.query('SELECT season FROM world_state WHERE id = 1');
   const current = result.rows[0].season;
   const next = seasons[(seasons.indexOf(current) + 1) % seasons.length];
   await pool.query(`
     UPDATE world_state SET season = $1, last_season_update = NOW()
     WHERE id = 1
   `, [next]);
   console.log(`🍂 Saison mise à jour : ${next}`);
}

scheduleMonthlySeasonUpdate();

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
