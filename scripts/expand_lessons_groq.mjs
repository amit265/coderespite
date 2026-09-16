import fs from 'fs';
import path from 'path';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("No Groq API key found in environment variables.");
  process.exit(1);
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateLessonsWithGroq(moduleTitle, moduleDescription, retries = 2) {
  const prompt = `You are an expert coding instructor. I need you to write 5 micro-lessons for a module titled "${moduleTitle}" (${moduleDescription}).
Return ONLY a valid JSON array of objects. Do not include any conversational text, just the raw JSON array.
Each object must have exactly these keys:
- title: (string) short title of the lesson
- type: (string) either "theory" or "code"
- content: (string) Markdown content of the lesson explaining the topic. Include analogies, simple code snippets, and end with a "### Think About This" question.

Keep the content concise but highly informative, like a mobile app swipeable card.

Example output:
[
  {
    "title": "What is it?",
    "type": "theory",
    "content": "Explanation here...\\n\\n### Think About This\\nQuestion here?"
  }
]`;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      
      // Strip markdown code block wrappers if any
      if (content.startsWith("```json")) {
        content = content.substring(7);
      } else if (content.startsWith("```")) {
        content = content.substring(3);
      }
      if (content.endsWith("```")) {
        content = content.slice(0, -3);
      }

      return JSON.parse(content.trim());
    } catch (err) {
      console.warn(`    Parsing failed (Attempt ${i+1}): ${err.message}`);
      if (i === retries - 1) throw err;
      await sleep(2000);
    }
  }
}

async function processCourses() {
  const bundlePath = path.join(process.cwd(), 'assets', 'data', 'all_courses_bundled.json');
  let courses = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));
  let updatedCount = 0;

  for (let course of courses) {
    if (course.id === 'typescript' || course.id === 'frontend_interview') {
      console.log(`Processing course: ${course.title}`);
      
      for (let i = 0; i < course.modules.length; i++) {
        let mod = course.modules[i];
        
        // Skip if already expanded
        if (mod.lessons && mod.lessons.length > 2) {
          console.log(`  Skipping ${mod.title} (already expanded)`);
          continue;
        }

        console.log(`  Generating lessons for module: ${mod.title}`);
        try {
          const generatedLessons = await generateLessonsWithGroq(mod.title, mod.description || "In-depth overview");
          
          if (!Array.isArray(generatedLessons)) {
            throw new Error("API did not return a JSON array");
          }

          mod.lessons = generatedLessons.map((l, idx) => ({
             lessonId: `mod${i+1}-lsn${idx+1}`,
             title: l.title || "Lesson",
             content: l.content || "",
             type: l.type === "code" ? "code" : "theory"
          }));

          // Add try it challenge to the last lesson
          if (mod.lessons.length > 0) {
             const lastLesson = mod.lessons[mod.lessons.length - 1];
             if (!lastLesson.content.includes("Code Playground")) {
                 lastLesson.content += "\n\n> 🐾 **Challenge:** Open the **Code Playground** (bottom left button) and try experimenting with this concept yourself!";
             }
          }

          console.log(`    Success! Added ${mod.lessons.length} lessons.`);
          updatedCount++;
        } catch (err) {
          console.error(`    Error generating for ${mod.title}:`, err.message);
        }

        // Wait 3.5 seconds to avoid Groq rate limits (30 RPM free tier)
        await sleep(3500);
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(bundlePath, JSON.stringify(courses, null, 2));
    console.log(`✅ Done! Successfully updated ${updatedCount} modules in the JSON bundle.`);
  } else {
    console.log("No modules were updated. Either an error occurred or everything was already expanded.");
  }
}

processCourses().catch(console.error);
