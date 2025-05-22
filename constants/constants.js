export const courseIcons = {
  html: require("../assets/images/courses/html.png"),
  css: require("../assets/images/courses/css.png"),
  js: require("../assets/images/courses/js.png"),
  react: require("../assets/images/courses/react.png"),
  py: require("../assets/images/courses/py.png"),

  // Add other mappings
};

export const flashcardIcons = {
  html: require("../assets/images/flashcards/html.png"),
  css: require("../assets/images/flashcards/css.png"),
  js: require("../assets/images/flashcards/js.png"),
  react: require("../assets/images/flashcards/react.png"),
  py: require("../assets/images/flashcards/py.png"),

  // Add other mappings
};

export const user = {
  id: "user",
  firstTime: true,
  profile: {
    name: "User",
    avatar: "avatar3.png",
    createdAt: "2025-05-13",
    lastAccessed: "2025-05-13",
  },
  progress: {
    mod01: 75,
    mod02: 100,
  },
  bookmarkedFlashcards: ["fc101", "fc105"],
  quizHistory: [
    {
      quizId: "qz201",
      score: 80,
      date: "2025-05-13",
    },
  ],
  streak: 3,
  settings: {
    darkMode: true,
    notifications: false,
  },
};

export const availableImages = [
  {
    name: "avatar1.png",
    source: require("../assets/images/avatar/avatar1.png"),
  },
  {
    name: "avatar2.png",
    source: require("../assets/images/avatar/avatar2.png"),
  },
  {
    name: "avatar3.png",
    source: require("../assets/images/avatar/avatar3.png"),
  },
  {
    name: "avatar4.png",
    source: require("../assets/images/avatar/avatar4.png"),
  },
  {
    name: "avatar5.png",
    source: require("../assets/images/avatar/avatar5.png"),
  },
  {
    name: "avatar6.png",
    source: require("../assets/images/avatar/avatar6.png"),
  },
  {
    name: "avatar7.png",
    source: require("../assets/images/avatar/avatar7.png"),
  },
  {
    name: "avatar8.png",
    source: require("../assets/images/avatar/avatar8.png"),
  },
  {
    name: "avatar9.png",
    source: require("../assets/images/avatar/avatar9.png"),
  },
  {
    name: "avatar10.png",
    source: require("../assets/images/avatar/avatar10.png"),
  },
  {
    name: "avatar11.png",
    source: require("../assets/images/avatar/avatar11.png"),
  },
  {
    name: "avatar12.png",
    source: require("../assets/images/avatar/avatar12.png"),
  },
 
  // add more as needed
];

export const getAvatarImage = (name) => {
  switch (name) {
    case "avatar1.png":
      return require("../assets/images/avatar/avatar1.png");
    case "avatar2.png":
      return require("../assets/images/avatar/avatar2.png");
    case "avatar3.png":
      return require("../assets/images/avatar/avatar3.png");
    case "avatar4.png":
      return require("../assets/images/avatar/avatar4.png");
    case "avatar5.png":
      return require("../assets/images/avatar/avatar5.png");
    case "avatar6.png":
      return require("../assets/images/avatar/avatar6.png");
    case "avatar7.png":
      return require("../assets/images/avatar/avatar7.png");
    case "avatar8.png":
      return require("../assets/images/avatar/avatar8.png");
    case "avatar9.png":
      return require("../assets/images/avatar/avatar9.png");
    case "avatar10.png":
      return require("../assets/images/avatar/avatar10.png");
    case "avatar11.png":
      return require("../assets/images/avatar/avatar11.png");
    case "avatar12.png":
      return require("../assets/images/avatar/avatar12.png");
    default:
      return require("../assets/images/avatar/avatar1.png"); // fallback image
  }
};

export const levels = [
  {
    id: 1,
    title: "Level 1 — Curious Kitten",
    description: "You’ve taken your first pawstep into the code world. The yarn ball of knowledge awaits!",
  },
  {
    id: 2,
    title: "Level 2 — Loop Kitten",
    description: "You're starting to chase those loops like a pro. Just don’t get tangled!",
  },
  {
    id: 3,
    title: "Level 3 — Callback Cat",
    description: "You're getting snappy with functions and callbacks. Fast paws, smart claws!",
  },
  {
    id: 4,
    title: "Level 4 — Async Aficionado",
    description: "You wait like a champ 🕒 but your code doesn’t have to. Mastering async like a sleek cat in the shadows.",
  },
  {
    id: 5,
    title: "Level 5 — Function Feline",
    description: "Functions? Declawed. Recursion? Batted like a toy mouse.",
  },
  {
    id: 6,
    title: "Level 6 — Object-Oriented Ocelot",
    description: "You’re organizing your code and stalking bugs like a jungle cat.",
  },
  {
    id: 7,
    title: "Level 7 — DOM Panther",
    description: "You roam the document jungle with precision. Everything’s under control... almost.",
  },
  {
    id: 8,
    title: "Level 8 — Purrformance Prowler",
    description: "You’ve optimized your naps and your code. Now that’s efficiency!",
  },
  {
    id: 9,
    title: "Level 9 — Bug-Hunting Bobcat",
    description: "Not all heroes wear capes. Some just pounce on bugs.",
  },
  {
    id: 10,
    title: "Level 10 — Supreme Meowster",
    description: "Legend says your whiskers vibrate with pure JavaScript energy. You are the Code Respite Meowster.",
  },
];

