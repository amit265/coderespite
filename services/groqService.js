import * as SecureStore from "expo-secure-store";

// 5-tier model fallback chain — same as destya-fitness-app
// Tries each model in order; only fails after all 5 are exhausted.
const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "qwen/qwen3.8-27b",
  "qwen/qwen3.6-27b",
  "groq/compound",
];

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export const getUserGroqApiKey = async () => {
  return await SecureStore.getItemAsync("ds_groq_api_key");
};

export const getGroqApiKey = async () => {
  const userKey = await SecureStore.getItemAsync("ds_groq_api_key");
  if (userKey && userKey.trim() !== "") {
    return userKey.trim();
  }
  return process.env.EXPO_PUBLIC_GROQ_API_KEY || "";
};

export const saveGroqApiKey = async (key) => {
  if (key) {
    await SecureStore.setItemAsync("ds_groq_api_key", key.trim());
  } else {
    await SecureStore.deleteItemAsync("ds_groq_api_key");
  }
};

// Fallback Offline Quiz Templates
export const OFFLINE_FALLBACKS = {
  javascript: [
    {
      question: "Which of the following is NOT a JavaScript data type?",
      options: ["Undefined", "Boolean", "Float", "Symbol"],
      correctAnswer: "Float",
      explanation: "JavaScript has a 'Number' type that handles both integers and floats; there is no separate 'Float' type.",
    },
    {
      question: "What is the output of: console.log(typeof null)?",
      options: ["'null'", "'undefined'", "'object'", "'string'"],
      correctAnswer: "'object'",
      explanation: "This is a historical bug in JavaScript where null is treated as an object type.",
    },
    {
      question: "Which keyword is used to declare a block-scoped variable in JS?",
      options: ["var", "let", "global", "assign"],
      correctAnswer: "let",
      explanation: "Both 'let' and 'const' declare block-scoped variables, unlike 'var' which is function-scoped.",
    },
    {
      question: "What does the '===' operator do?",
      options: ["Compares values only", "Compares values and types", "Assigns a constant value", "Checks if undefined"],
      correctAnswer: "Compares values and types",
      explanation: "The strict equality operator '===' compares both the values and their types without type coercion.",
    },
    {
      question: "How do you write an arrow function that returns a value implicitly?",
      options: ["const f = () => { return x; }", "const f = () => x", "const f = => x", "const f = () -> x"],
      correctAnswer: "const f = () => x",
      explanation: "An arrow function with no braces implies a return of the expression following the arrow.",
    }
  ],
  html: [
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "Hyperlink Text Markdown Language", "Hyper Tool Multi Language", "Home Tool Markup Language"],
      correctAnswer: "Hyper Text Markup Language",
      explanation: "HTML is the standard markup language for creating web pages.",
    },
    {
      question: "Which HTML5 tag is used to specify a footer for a document or section?",
      options: ["<bottom>", "<footer>", "<section-footer>", "<foot>"],
      correctAnswer: "<footer>",
      explanation: "The <footer> tag defines a footer for a document, page, or section.",
    },
    {
      question: "What is the correct HTML element for inserting a line break?",
      options: ["<break>", "<lb>", "<br>", "<hr>"],
      correctAnswer: "<br>",
      explanation: "The <br> tag is an empty element used to produce a line break in text.",
    },
    {
      question: "Which attribute is used to provide a unique identifier for an HTML element?",
      options: ["class", "id", "name", "key"],
      correctAnswer: "id",
      explanation: "The 'id' attribute specifies a unique id for an HTML element across the document.",
    },
    {
      question: "Which tag is used to link an external CSS stylesheet?",
      options: ["<style>", "<link>", "<css>", "<script>"],
      correctAnswer: "<link>",
      explanation: "The <link> tag defines the relationship between the current document and an external resource.",
    }
  ],
  css: [
    {
      question: "What does CSS stand for?",
      options: ["Creative Style Sheets", "Computer Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
      correctAnswer: "Cascading Style Sheets",
      explanation: "CSS describes how HTML elements are to be displayed on screen, paper, or in other media.",
    },
    {
      question: "Which CSS property controls the text size?",
      options: ["font-style", "text-size", "font-size", "text-style"],
      correctAnswer: "font-size",
      explanation: "The 'font-size' property sets the size of the font.",
    },
    {
      question: "How do you select an element with id 'demo' in CSS?",
      options: [".demo", "#demo", "*demo", "demo"],
      correctAnswer: "#demo",
      explanation: "The '#' selector is used to select elements with a specific id.",
    },
    {
      question: "What is the default value of the position property in CSS?",
      options: ["absolute", "relative", "fixed", "static"],
      correctAnswer: "static",
      explanation: "HTML elements are positioned static by default, meaning they follow the normal page flow.",
    },
    {
      question: "Which property is used to change the background color?",
      options: ["color", "background-color", "bg-color", "fill"],
      correctAnswer: "background-color",
      explanation: "The 'background-color' property sets the background color of an element.",
    }
  ],
  react: [
    {
      question: "What hook is used to manage side effects in functional React components?",
      options: ["useState", "useContext", "useEffect", "useReducer"],
      correctAnswer: "useEffect",
      explanation: "useEffect lets you perform side effects (data fetching, subscriptions, DOM manipulation) in function components.",
    },
    {
      question: "What does the virtual DOM do in React?",
      options: ["Interacts directly with the hardware", "Syncs rendering changes efficiently via diffing", "Secures the state from exposure", "Runs components in a sandbox"],
      correctAnswer: "Syncs rendering changes efficiently via diffing",
      explanation: "The Virtual DOM allows React to calculate UI updates in memory before updating the real DOM, boosting performance.",
    },
    {
      question: "How do you pass data down to child components in React?",
      options: ["State", "Props", "Context only", "Hooks"],
      correctAnswer: "Props",
      explanation: "Props (short for properties) are read-only components arguments passed from parent to child components.",
    },
    {
      question: "Which hook returns a memoized value in React?",
      options: ["useCallback", "useMemo", "useRef", "useState"],
      correctAnswer: "useMemo",
      explanation: "useMemo caches the result of a calculation between re-renders, avoiding expensive recalculations.",
    },
    {
      question: "What is the purpose of keys in React lists?",
      options: ["To encrypt list items", "To identify which items have changed, been added, or removed", "To style list items uniquely", "To index list arrays"],
      correctAnswer: "To identify which items have changed, been added, or removed",
      explanation: "Keys help React identify which items in a list have changed, been added, or removed, optimizing list updates.",
    }
  ],
  git: [
    {
      question: "Which command initializes a new Git repository?",
      options: ["git start", "git init", "git new", "git create"],
      correctAnswer: "git init",
      explanation: "'git init' creates a new local Git repository in the current directory.",
    },
    {
      question: "How do you check the state of the working directory and staging area?",
      options: ["git log", "git status", "git diff", "git check"],
      correctAnswer: "git status",
      explanation: "'git status' displays the status of files in the repository (tracked, untracked, modified).",
    },
    {
      question: "Which command adds changes in the working directory to the staging area?",
      options: ["git commit", "git push", "git add", "git save"],
      correctAnswer: "git add",
      explanation: "'git add' stages changes, preparing them to be committed.",
    },
    {
      question: "What does 'git clone' do?",
      options: ["Deletes a repository", "Creates a copy of an existing remote repository locally", "Merges two branches", "Creates a branch clone"],
      correctAnswer: "Creates a copy of an existing remote repository locally",
      explanation: "'git clone' downloads an existing remote repository and creates a local copy of it.",
    },
    {
      question: "Which command records staged snapshots to history?",
      options: ["git save", "git upload", "git commit", "git record"],
      correctAnswer: "git commit",
      explanation: "'git commit' saves your staged changes as a new snapshot in the project history.",
    }
  ]
};

export const generateQuizWithGroq = async (topic, apiKey) => {
  const cleanTopic = topic.trim().toLowerCase();
  
  // If api key is not set, or we match direct local fallbacks directly, return fallbacks
  if (!apiKey) {
    if (OFFLINE_FALLBACKS[cleanTopic]) {
      console.log(`[GroqService] No API key, using offline fallback for topic: ${cleanTopic}`);
      return OFFLINE_FALLBACKS[cleanTopic];
    }
    // Default to general JS fallback if key is missing and topic isn't found
    console.log("[GroqService] No API key, using default JS fallback quiz");
    return OFFLINE_FALLBACKS.javascript;
  }

  const systemPrompt = `You are a helpful AI coding assistant. Generate exactly 5 multiple choice questions for a quiz on the topic: "${topic}".
CRITICAL SAFETY & COMPLIANCE RULES:
1. If the requested topic "${topic}" is inappropriate, offensive, hateful, sexual, contains violence, or is completely unrelated to programming, coding, web development, databases, software engineering, or computer science, you MUST reject it.
2. To reject it, output a JSON array containing exactly one object with this format: [{"error": "Inappropriate or unrelated topic. Please request a programming-related topic."}].
3. For normal coding topics, output a valid JSON array of exactly 5 objects. Each object MUST have these exact keys:
- "question": string question text
- "options": array of exactly 4 string options
- "correctAnswer": the exact correct option string from the options array
- "explanation": string explanation of why that option is correct.

Ensure the json is properly structured and output ONLY the JSON code block, without markdown formatting like \`\`\`json or standard chat introduction/outroduction.`;

  console.log(`[GroqService] Calling Groq API for topic: ${topic}`);
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You output only valid raw JSON arrays." },
            { role: "user", content: systemPrompt }
          ],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const result = await response.json();
      let rawJson = result.choices[0]?.message?.content?.trim();

      // Remove markdown code block framing if the LLM adds it anyway
      if (rawJson.startsWith("```json")) {
        rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (rawJson.startsWith("```")) {
        rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      // Aggressively sanitize invalid escape sequences that break JSON.parse
      rawJson = rawJson.replace(/\\(?!["\\/bfnrt])/g, "");

      const quizData = JSON.parse(rawJson);
      if (Array.isArray(quizData) && quizData.length > 0) {
        if (quizData[0]?.error) {
          throw new Error(quizData[0].error);
        }
        return quizData;
      }
      throw new Error("Invalid response format received from Groq");
    } catch (error) {
      console.warn(`[GroqService] Quiz generation failed with model "${model}", trying next... Error:`, error.message || error);
      lastError = error;
    }
  }

  // All models exhausted
  console.warn("[GroqService] All models failed for quiz generation.");
  throw lastError;
};

export const getDetailedExplanationWithGroq = async (question, userAnswer, correctAnswer, apiKey) => {
  if (!apiKey) {
    return "Please enter a valid Groq API Key in AI Generator settings to fetch AI explanations.";
  }

  const prompt = `Question: ${question}
User's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

Please provide a detailed, educational explanation of why the correct answer is right and why the user's answer is incorrect (if the user's answer is different from the correct answer). Keep it engaging, and explain any underlying coding principles clearly. Explain in 2-3 clear paragraphs.`;

  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You are a helpful AI programming coach. Provide direct, informative, educational responses in clear markdown." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content?.trim();
      if (content) return content;
      throw new Error("Empty response from model: " + model);
    } catch (error) {
      console.warn(`[GroqService] Explanation failed with model "${model}", trying next... Error:`, error.message || error);
      lastError = error;
    }
  }

  console.error("[GroqService] All models failed for explanation.");
  return `Failed to fetch detailed explanation: ${lastError?.message}. Please verify your API key and connection.`;
};

export const generateRoadmapWithGroq = async (goal, apiKey) => {
  if (!apiKey) {
    throw new Error("No API Key configured. Please verify your settings.");
  }

  const timestamp = Date.now();
  const systemPrompt = `You are a professional curriculum builder. Build a custom programming study guide for this exact goal: "${goal}".
The output MUST be a valid JSON object matching the exact structure below. Generate a comprehensive single-page syllabus in markdown format, and exactly 10 flashcards for the entire course. Do NOT generate modules or quizzes.

JSON Structure:
{
  "id": "AI_ROADMAP_${timestamp}",
  "title": "Bespoke course title, e.g. SQL Basics (AI)",
  "icon": "javascript",
  "roadmapText": "# Course Syllabus\\n\\nDetailed markdown content here...",
  "flashcards": [
    {
      "question": "Question string",
      "answer": "Answer string"
    }
  ]
}

Ensure standard safety rules: If the requested goal is inappropriate, offensive, hateful, sexual, contains violence, or is completely unrelated to programming, coding, web development, databases, software engineering, or computer science, you MUST reject it. To reject it, output: {"error": "Inappropriate topic."}.
Icon must be one of: "javascript", "react_native", "html", "css", "git", or "default".
Ensure the output is 100% valid JSON. Do NOT escape markdown characters (like \\* or \\_). Only use standard JSON escapes.
CRITICAL: Do NOT output raw/literal newlines inside JSON string values! All newlines inside your markdown text MUST be explicitly escaped as \\n.`;

  console.log(`[GroqService] Generating AI Roadmap for goal: ${goal}`);
  let lastError = null;

  for (const model of GROQ_MODELS) {
    try {
      const response = await fetch(GROQ_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "You output only valid raw JSON objects." },
            { role: "user", content: systemPrompt }
          ],
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API returned error status: ${response.status}`);
      }

      const result = await response.json();
      let text = result.choices[0]?.message?.content?.trim() || "";

      if (text.startsWith("```json")) {
        text = text.replace("```json", "").replace("```", "").trim();
      } else if (text.startsWith("```")) {
        text = text.replace("```", "").replace("```", "").trim();
      }

      // Aggressively sanitize invalid escape sequences that break JSON.parse
      text = text.replace(/\\(?!["\\/bfnrt])/g, "");

      const roadmapData = JSON.parse(text);
      if (roadmapData.error) {
        throw new Error(roadmapData.error);
      }

      // Force the ID to ensure it always matches our UI routing and separation logic
      // LLMs often hallucinate or change IDs despite strict prompt instructions.
      roadmapData.id = `AI_ROADMAP_${timestamp}`;

      return roadmapData;
    } catch (error) {
      console.warn(`[GroqService] Roadmap generation failed with model "${model}", trying next... Error:`, error.message || error);
      lastError = error;
    }
  }

  console.error("[GroqService] All models failed for roadmap generation.");
  throw lastError;
};
