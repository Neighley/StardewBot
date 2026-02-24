-- BDD SQL pour le bot Stardew Valley
-- Ce script crée les tables nécessaires pour gérer les utilisateurs, les PNJ, les objets, les relations, les événements d'exploration, les quêtes et les boutiques.
-- Date : 24/02/2026 13h52

-- ============================
--  TABLE : User
-- ============================
CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    discordId TEXT UNIQUE NOT NULL,
    money INT DEFAULT 0,
    lastDaily DATE,
    createdAt TIMESTAMP DEFAULT NOW()
);

-- ============================
--  TABLE : Pnj
-- ============================
CREATE TABLE Pnj (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    favColor TEXT,
    birthday TEXT, -- format "Spring 14" par ex.
    xpGiftLoved INT DEFAULT 80,
    xpGiftLiked INT DEFAULT 45,
    xpGiftHated INT DEFAULT -10,
    xpGiftNeutral INT DEFAULT 20,
    role TEXT -- ex: 'SeedsSeller', 'FishSeller', 'RareSeller'
);

-- ============================
--  TABLE : Item
-- ============================
CREATE TYPE itemType AS ENUM ('fish', 'plant', 'mineral', 'seed', 'animal_product', 'rare');
CREATE TYPE seasonType AS ENUM ('spring', 'summer', 'fall', 'winter');

CREATE TABLE Item (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type itemType NOT NULL,
    season seasonType, -- nullable
    rarity INT DEFAULT 1,
	zone TEXT
);

-- ============================
--  TABLE : Inventory
-- ============================
CREATE TABLE Inventory (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "User"(id) ON DELETE CASCADE,
    item_id INT REFERENCES Item(id),
    quantity INT DEFAULT 1
);

-- ============================
--  TABLE : Relationship
-- ============================
CREATE TABLE Relationship (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "User"(id) ON DELETE CASCADE,
    pnj_id INT REFERENCES Pnj(id) ON DELETE CASCADE,
    hearts INT DEFAULT 0,
    xp_hearts INT DEFAULT 0,
    lastSpeak DATE,
    lastGift DATE
);

-- ============================
--  TABLE : PnjGiftLikes
-- ============================
CREATE TYPE preferenceType AS ENUM ('loved', 'liked', 'neutral', 'hated');

CREATE TABLE PnjGiftLikes (
    id SERIAL PRIMARY KEY,
    pnj_id INT REFERENCES Pnj(id) ON DELETE CASCADE,
    item_id INT REFERENCES Item(id),
    preferenceType preferenceType NOT NULL
);

-- ============================
--  TABLE : ExploreEvent
-- ============================
CREATE TABLE ExploreEvent (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type TEXT,
    textEvent TEXT NOT NULL,
    rarity INT DEFAULT 1,
    season seasonType,
    zone TEXT
);

-- ============================
--  TABLE : EventReward
-- ============================
CREATE TABLE EventReward (
    id SERIAL PRIMARY KEY,
    exploreEvent_id INT REFERENCES ExploreEvent(id) ON DELETE CASCADE,
    item_id INT REFERENCES Item(id),
    quantity INT DEFAULT 1,
    probability FLOAT DEFAULT 1.0,
    moneyAmount INT DEFAULT 0
);

-- ============================
--  TABLE : Quest
-- ============================
CREATE TABLE Quest (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    pnj_id INT REFERENCES Pnj(id)
);

-- ============================
--  TABLE : QuestRequirement
-- ============================
CREATE TABLE QuestRequirement (
    id SERIAL PRIMARY KEY,
    quest_id INT REFERENCES Quest(id) ON DELETE CASCADE,
    item_id INT REFERENCES Item(id),
    quantity INT DEFAULT 1
);

-- ============================
--  TABLE : QuestReward
-- ============================
CREATE TABLE QuestReward (
    id SERIAL PRIMARY KEY,
    quest_id INT REFERENCES Quest(id) ON DELETE CASCADE,
    item_id INT REFERENCES Item(id),
    quantity INT DEFAULT 1,
    xpAmount INT DEFAULT 0,
    moneyAmount INT DEFAULT 0
);

-- ============================
--  TABLE : UserQuest
-- ============================
CREATE TABLE UserQuest (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES "User"(id) ON DELETE CASCADE,
    quest_id INT REFERENCES Quest(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'in_progress',
    startedAt TIMESTAMP DEFAULT NOW(),
    completedAt TIMESTAMP
);

-- ============================
--  TABLE : ShopItem (catalogue permanent)
-- ============================
CREATE TABLE ShopItem (
    id SERIAL PRIMARY KEY,
    pnj_id INT REFERENCES Pnj(id) ON DELETE CASCADE,
    item_id INT REFERENCES Item(id),
    price INT NOT NULL,
    season seasonType, -- nullable
    stock INT -- nullable
);

-- ============================
--  TABLE : ShopDaily (shop du jour)
-- ============================
CREATE TABLE ShopDaily (
    id SERIAL PRIMARY KEY,
    pnj_id INT REFERENCES Pnj(id) ON DELETE CASCADE,
    item_id INT REFERENCES Item(id),
    price INT NOT NULL,
    date DATE NOT NULL
);

-- Date : 24/02/2026 14h05

CREATE TABLE Image (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    alt TEXT,
    type TEXT NOT NULL, -- 'item', 'pnj', 'zone'
    ref_id INT NOT NULL -- id de l'item/pnj/zone
);