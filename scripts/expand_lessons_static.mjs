import fs from 'fs';
import path from 'path';

const bundlePath = path.join(process.cwd(), 'assets', 'data', 'all_courses_bundled.json');
let courses = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));

function createLessons(moduleId, moduleTitle, baseContent) {
  // Clean up any existing challenges from baseContent
  let cleanBase = baseContent.replace(/> 🐾 \*\*Challenge:\*\* Open the \*\*Code Playground\*\*.*/g, '').trim();

  return [
    {
      lessonId: `${moduleId}-lsn1`,
      title: `Introduction to ${moduleTitle}`,
      type: "theory",
      content: `${cleanBase}\n\nUnderstanding **${moduleTitle}** is absolutely essential for modern development.\n\n### Think About This\nWhy is this concept considered foundational by senior engineers?`
    },
    {
      lessonId: `${moduleId}-lsn2`,
      title: `Why Use ${moduleTitle}?`,
      type: "theory",
      content: `**${moduleTitle}** exists to solve major architectural and structural problems in your code. It prevents bugs, reduces redundancy, and makes your application far more maintainable.\n\nIn larger projects, attempting to build without this leads to disorganized "spaghetti" code.\n\nThink of it as the foundation of a house—you don't see it when the house is finished, but without it, the whole thing collapses.\n\n### Think About This\nHow would you solve the problem if this feature did not exist in the language?`
    },
    {
      lessonId: `${moduleId}-lsn3`,
      title: `Practical Syntax & Usage`,
      type: "code",
      content: `Let's look at how to implement ${moduleTitle} in practice. The syntax is designed to be declarative and intuitive.\n\n\`\`\`javascript\n// Real-world implementation example\nfunction initializeFeature() {\n  console.log("Setting up ${moduleTitle}...");\n  // Logic goes here\n  return true;\n}\n\`\`\`\n\nNotice how the structure keeps the implementation details isolated. This is a best practice.\n\n### Think About This\nWhat happens if you introduce a syntax error or typo in this block?`
    },
    {
      lessonId: `${moduleId}-lsn4`,
      title: `Common Pitfalls & Mistakes`,
      type: "theory",
      content: `A very common mistake junior developers make with ${moduleTitle} is misunderstanding its lifecycle, scope, or execution order.\n\nAlways ensure you are testing edge cases—what happens if the data is null? What happens if the network fails?\n\nDebugging issues here can take hours if you don't fully understand the underlying mechanics.\n\n### Think About This\nHave you ever spent hours tracking down a bug that turned out to be a simple misunderstanding of a core concept?`
    },
    {
      lessonId: `${moduleId}-lsn5`,
      title: `Mastering ${moduleTitle}`,
      type: "code",
      content: `In production-grade applications, ${moduleTitle} is used constantly by senior engineers to build highly scalable, crash-resistant features.\n\nMastering this concept is one of the fastest ways to move from a junior to a mid-level developer, because it proves you understand *how* the engine works, not just how to drive the car.\n\n### Think About This\nHow will you actively incorporate this into the next project you build?\n\n> 🐾 **Challenge:** Open the **Code Playground** (bottom left button) and try experimenting with this concept yourself!`
    }
  ];
}

let updated = 0;
courses.forEach(course => {
  if (course.id === 'typescript' || course.id === 'frontend_interview') {
    course.modules.forEach(mod => {
      if (mod.lessons.length === 1) {
        const baseContent = mod.lessons[0].content;
        mod.lessons = createLessons(mod.id, mod.title, baseContent);
        updated++;
      }
    });
  }
});

fs.writeFileSync(bundlePath, JSON.stringify(courses, null, 2));
console.log(`✅ Successfully expanded ${updated} modules using the static structural engine!`);
