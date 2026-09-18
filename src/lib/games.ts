export type Package = {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
};

export type Game = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  badge?: "HOT" | "NEW" | "TOP";
  category: "moba" | "battle-royale" | "fps" | "sports" | "sandbox" | "strategy" | "gift";
  orderTime?: string;
  packages: Package[];
  needs: { label: string; placeholder: string; key: string }[];
  description: string;
};

const fields = {
  userId: { label: "Player ID", placeholder: "Enter your Player ID", key: "userId" },
  serverId: { label: "Server ID", placeholder: "Enter Server ID", key: "serverId" },
  email: { label: "Email Address", placeholder: "your@email.com", key: "email" },
};

export const games: Game[] = [
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    tagline: "UC Top-Up",
    image: "https://res.cloudinary.com/dyrebxrj9/image/upload/v1760182557/game/pubg_1_ac7745edfd.jpg",
    badge: "TOP",
    category: "battle-royale",
    packages: [
      { id: "60uc", name: "60 UC", price: 95 },
      { id: "325uc", name: "325 UC", price: 470, popular: true },
      { id: "660uc", name: "660 UC", price: 925 },
      { id: "1800uc", name: "1800 UC", price: 2350 },
      { id: "3850uc", name: "3850 UC", price: 4650 },
      { id: "8100uc", name: "8100 UC", price: 9300 },
    ],
    needs: [fields.userId],
    description: "Official PUBG Mobile UC top-up. Delivered to your account in 5–10 minutes.",
  },
  {
    slug: "free-fire-bd",
    name: "Free Fire BD",
    tagline: "Diamond Top-Up",
    image: "https://res.cloudinary.com/dyrebxrj9/image/upload/v1760274395/game/garena_free_fire_s470_9d34c4e377.jpg",
    badge: "HOT",
    category: "battle-royale",
    orderTime: "Order time 11 AM to 12 AM",
    packages: [
      { id: "25d", name: "25 Diamond", price: 25 },
      { id: "50d", name: "50 Diamond", price: 40 },
      { id: "115d", name: "115 Diamond", price: 80 },
      { id: "240d", name: "240 Diamond", price: 160 },
      { id: "610d", name: "610 Diamond", price: 405, popular: true },
      { id: "1240d", name: "1240 Diamond", price: 810 },
      { id: "2530d", name: "2530 Diamond", price: 1620 },
      { id: "weekly", name: "Weekly", price: 160 },
      { id: "monthly", name: "Monthly", price: 795 },
    ],
    needs: [fields.userId],
    description: "BD server only. All top-ups are fully authorized and delivered within 5–10 minutes.",
  },
  {
    slug: "e-football",
    name: "eFootball",
    tagline: "Coin Top-Up",
    image: "https://res.cloudinary.com/dyrebxrj9/image/upload/v1760182578/game/1_Efootball_Coin_7af67ca7fd.webp",
    category: "sports",
    packages: [
      { id: "100", name: "100 Coins", price: 110 },
      { id: "300", name: "300 Coins", price: 320 },
      { id: "1000", name: "1000 Coins", price: 1050, popular: true },
      { id: "3000", name: "3000 Coins", price: 3100 },
    ],
    needs: [fields.userId],
    description: "eFootball coin top-up for mobile & console.",
  },
  {
    slug: "valorant",
    name: "Valorant",
    tagline: "VP Points",
    image: "https://res.cloudinary.com/dyrebxrj9/image/upload/v1760274436/game/images_32bcb5fda0.png",
    category: "fps",
    packages: [
      { id: "475", name: "475 VP", price: 450 },
      { id: "1000", name: "1000 VP", price: 920 },
      { id: "2050", name: "2050 VP", price: 1850, popular: true },
      { id: "3650", name: "3650 VP", price: 3300 },
      { id: "5350", name: "5350 VP", price: 4750 },
    ],
    needs: [{ label: "Riot ID", placeholder: "Name#TAG", key: "userId" }, fields.email],
    description: "Valorant Points delivered straight to your Riot account.",
  },
  {
    slug: "roblox",
    name: "Roblox",
    tagline: "Robux",
    image: "https://res.cloudinary.com/nooboss/image/upload/v1760794983/gamerz-prime/29af2c01fca6450f30b16dc9a139589d_258a0c350b.jpg",
    category: "sandbox",
    packages: [
      { id: "80", name: "80 Robux", price: 130 },
      { id: "400", name: "400 Robux", price: 580 },
      { id: "800", name: "800 Robux", price: 1100, popular: true },
      { id: "1700", name: "1700 Robux", price: 2300 },
    ],
    needs: [{ label: "Roblox Username", placeholder: "Your username", key: "userId" }],
    description: "Official Robux top-up via gift code.",
  },
  {
    slug: "mobile-legends",
    name: "Mobile Legends",
    tagline: "Diamonds",
    image: "https://res.cloudinary.com/dyrebxrj9/image/upload/v1760282770/game/da8ee735a4e1a99c906cec8063ef81f7_349919f182.jpg",
    badge: "HOT",
    category: "moba",
    packages: [
      { id: "11", name: "11 Diamonds", price: 25 },
      { id: "22", name: "22 Diamonds", price: 50 },
      { id: "56", name: "56 Diamonds", price: 110 },
      { id: "112", name: "112 Diamonds", price: 220, popular: true },
      { id: "223", name: "223 Diamonds", price: 440 },
      { id: "568", name: "568 Diamonds", price: 1100 },
      { id: "1163", name: "1163 Diamonds", price: 2200 },
    ],
    needs: [fields.userId, fields.serverId],
    description: "MLBB diamonds — delivered instantly with User ID + Server ID.",
  },
  {
    slug: "pubg-g-coin",
    name: "PUBG G-Coin",
    tagline: "Global Coins",
    image: "https://res.cloudinary.com/nooboss/image/upload/v1760421569/gamerz-prime/Untitled_design_fe059b280d.png",
    badge: "NEW",
    category: "battle-royale",
    packages: [
      { id: "300", name: "300 G-Coin", price: 320 },
      { id: "1500", name: "1500 G-Coin", price: 1500, popular: true },
      { id: "3000", name: "3000 G-Coin", price: 2950 },
    ],
    needs: [fields.userId],
    description: "PUBG PC G-Coin top-up for global region.",
  },
  {
    slug: "call-of-duty-mobile",
    name: "Call of Duty Mobile",
    tagline: "CP Points",
    image: "https://res.cloudinary.com/nooboss/image/upload/v1760798795/gamerz-prime/unnamed_ff44344354.jpg",
    badge: "NEW",
    category: "fps",
    packages: [
      { id: "80", name: "80 CP", price: 110 },
      { id: "400", name: "400 CP", price: 540, popular: true },
      { id: "800", name: "800 CP", price: 1050 },
      { id: "2000", name: "2000 CP", price: 2600 },
    ],
    needs: [fields.userId],
    description: "COD Mobile CP delivered to your account by player ID.",
  },
  {
    slug: "delta-force",
    name: "Delta Force",
    tagline: "Delta Coins",
    image: "https://res.cloudinary.com/nooboss/image/upload/v1760798918/gamerz-prime/unnamed_b8f62d30b2.png",
    badge: "NEW",
    category: "fps",
    packages: [
      { id: "500", name: "500 Coins", price: 520 },
      { id: "1500", name: "1500 Coins", price: 1450, popular: true },
      { id: "5000", name: "5000 Coins", price: 4700 },
    ],
    needs: [fields.userId],
    description: "Delta Force in-game currency top-up.",
  },
  {
    slug: "blood-strike",
    name: "Blood Strike",
    tagline: "Gold Bars",
    image: "https://res.cloudinary.com/nooboss/image/upload/v1760799047/gamerz-prime/blood_strike_8364304b2a.jpg",
    badge: "NEW",
    category: "fps",
    packages: [
      { id: "100", name: "100 Gold", price: 120 },
      { id: "500", name: "500 Gold", price: 580, popular: true },
      { id: "1200", name: "1200 Gold", price: 1380 },
    ],
    needs: [fields.userId],
    description: "Blood Strike gold top-up.",
  },
  {
    slug: "clash-of-clans",
    name: "Clash of Clans",
    tagline: "Gems",
    image: "https://res.cloudinary.com/nooboss/image/upload/v1760802676/gamerz-prime/86534c26009d0f7f8fd25fa195baa00c_b2f00243b6.jpg",
    badge: "HOT",
    category: "strategy",
    packages: [
      { id: "80", name: "80 Gems", price: 110 },
      { id: "500", name: "500 Gems", price: 620, popular: true },
      { id: "1200", name: "1200 Gems", price: 1450 },
      { id: "2500", name: "2500 Gems", price: 2900 },
    ],
    needs: [{ label: "Player Tag", placeholder: "#XXXXXXX", key: "userId" }],
    description: "Supercell ID gem top-up for Clash of Clans.",
  },
  {
    slug: "gift-card",
    name: "Gift Card",
    tagline: "Steam / Google Play",
    image: "https://res.cloudinary.com/dyrebxrj9/image/upload/v1760274704/game/265991075_101832935694248_2819249717733782971_n_beae894398.jpg",
    category: "gift",
    packages: [
      { id: "5", name: "$5 Card", price: 650 },
      { id: "10", name: "$10 Card", price: 1280, popular: true },
      { id: "25", name: "$25 Card", price: 3150 },
      { id: "50", name: "$50 Card", price: 6250 },
      { id: "100", name: "$100 Card", price: 12400 },
    ],
    needs: [fields.email],
    description: "Digital gift card codes delivered to your email.",
  },
];

export const getGame = (slug: string) => games.find((g) => g.slug === slug);
