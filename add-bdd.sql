-- Date : 24/02/2026 14h46

INSERT INTO Pnj (name, favcolor, birthday, xpgiftloved, xpgiftliked, xpgifthated, xpgiftneutral, role)
VALUES
('Shane', 'Blue', 'Spring 20', 70, 35, -30, 10, NULL),
('Sebastian', 'Black', 'Winter 10', 60, 30, -20, 10, NULL),
('Sam', 'Yellow', 'Summer 17', 80, 40, -10, 20, NULL),
('Harvey', 'Green', 'Winter 14', 90, 45, -10, 20, NULL),
('Elliott', 'Red', 'Fall 5', 60, 30, -20, 10, NULL),
('Alex', 'Red', 'Summer 13', 70, 35, -10, 15, NULL),
('Penny', 'Yellow', 'Fall 2', 70, 35, -10, 20, NULL),
('Maru', 'Purple', 'Summer 10', 80, 45, -10, 20, NULL),
('Leah', 'Green', 'Winter 23', 60, 30, -20, 10, NULL),
('Haley', 'Pink', 'Spring 14', 70, 40, -40, 20, NULL),
('Emily', 'Blue', 'Spring 27', 80, 45, -10, 20, NULL),
('Abigail', 'Purple', 'Fall 13', 60, 30, -20, 20, NULL);

-- Date : 24/02/2026 14h49

INSERT INTO Image (url, alt, type, ref_id) VALUES
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Shane.png', 'Shane portrait', 'pnj', 1),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Sebastian.png', 'Sebastian portrait', 'pnj', 2),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Sam.png', 'Sam portrait', 'pnj', 3),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Harvey.png', 'Harvey portrait', 'pnj', 4),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Elliott.png', 'Elliott portrait', 'pnj', 5),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Alex.png', 'Alex portrait', 'pnj', 6),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Penny.png', 'Penny portrait', 'pnj', 7),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Maru.png', 'Maru portrait', 'pnj', 8),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Leah.png', 'Leah portrait', 'pnj', 9),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Haley.png', 'Haley portrait', 'pnj', 10),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Emily.png', 'Emily portrait', 'pnj', 11),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Abigail.png', 'Abigail portrait', 'pnj', 12);

-- Date : 24/02/2026 14h59

INSERT INTO Item (name, type, season, rarity) VALUES
('Common Mushroom', 'plant', 'fall', 1),
('Sweet Pea', 'plant', 'summer', 1),
('Quartz', 'mineral', NULL, 1),
('Amethyst', 'mineral', NULL, 2),
('Carp', 'fish', NULL, 1),
('Sea Cucumber', 'fish', 'fall', 2);

-- Date : 24/02/2026 15h00

INSERT INTO Image (url, alt, type, ref_id) VALUES
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/items/Common_Mushroom.png', 'Common Mushroom icon', 'item', 1),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/items/Sweet_Pea.png', 'Sweet Pea icon', 'item', 2),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/items/Quartz.png', 'Quartz icon', 'item', 3),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/items/Amethyst.png', 'Amethyst icon', 'item', 4),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/items/Carp.png', 'Carp icon', 'item', 5),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/items/Sea_Cucumber.png', 'Sea Cucumber icon', 'item', 6);

-- Date : 24/02/2026 15h08

INSERT INTO Pnj (name, favcolor, birthday, xpgiftloved, xpgiftliked, xpgifthated, xpgiftneutral, role)
VALUES
('Pierre', 'Brown', 'Spring 26', 0, 0, 0, 0, 'shop'),
('Willy', 'Blue', 'Summer 24', 0, 0, 0, 0, 'shop'),
('Clint', 'Red', 'Winter 26', 0, 0, 0, 0, 'shop');

-- Date : 24/02/2026 15h10

INSERT INTO Image (url, alt, type, ref_id) VALUES
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Pierre.png', 'Pierre portrait', 'item', 13),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Willy.png', 'Willy portrait', 'item', 14),
('https://raw.githubusercontent.com/Neighley/StardewBot/main/stardewbot-assets/pnj/Clint.png', 'Clint portrait', 'item', 15);

-- Date : 24/02/2026 15h12

INSERT INTO ShopItem (pnj_id, item_id, price)
VALUES
-- Pierre
(13, 1, 50),  -- Common Mushroom
(13, 2, 60),  -- Sweet Pea

-- Willy
(14, 5, 80),  -- Carp
(14, 6, 150), -- Sea Cucumber

-- Clint
(15, 3, 30),  -- Quartz
(15, 4, 200); -- Amethyst

