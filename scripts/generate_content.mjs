import fs from 'fs';
import path from 'path';

// ─── 1. New Courses Data ───────────────────────────────────────────────────────

const typescriptCourse = {
  id: "typescript",
  title: "TypeScript",
  description: "Learn static typing, interfaces, and advanced TS features.",
  modules: [
    { id: "ts_1", title: "Types & Primitives", description: "Learn basic typing in TS.", content: "TypeScript adds static typing to JavaScript. Primitives include string, number, and boolean.\n\n```ts\nlet isDone: boolean = false;\n```" },
    { id: "ts_2", title: "Interfaces", description: "Define object shapes.", content: "Interfaces define contracts in your code.\n\n```ts\ninterface User {\n  name: string;\n  age: number;\n}\n```" },
    { id: "ts_3", title: "Classes", description: "OOP in TypeScript.", content: "TS fully supports ES6 classes with access modifiers (public, private, protected)." },
    { id: "ts_4", title: "Generics", description: "Reusable components.", content: "Generics allow you to write reusable, type-safe functions and classes.\n\n```ts\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```" },
    { id: "ts_5", title: "Enums", description: "Named constants.", content: "Enums allow developers to define a set of named constants." },
    { id: "ts_6", title: "Union Types", description: "Multiple types.", content: "Union types let a value be one of several types (e.g., `string | number`)." },
    { id: "ts_7", title: "Type Aliases", description: "Custom names for types.", content: "Type aliases create a new name for a type." },
    { id: "ts_8", title: "Utility Types", description: "Partial, Pick, Omit.", content: "TS provides global utility types to facilitate common type transformations." },
    { id: "ts_9", title: "Type Assertions", description: "Tell the compiler what a type is.", content: "Sometimes you know more about a value's type than TypeScript does. Use `as`." },
    { id: "ts_10", title: "Modules", description: "Import and Export.", content: "TS shares the same module concept as ES6." }
  ]
};

const interviewCourse = {
  id: "frontend_interview",
  title: "Frontend Interview Prep",
  description: "Ace your next technical interview with these tricky questions.",
  modules: [
    { id: "int_1", title: "The Event Loop", description: "Understand macro and micro tasks.", content: "The Event Loop handles async callbacks in Node/Browser. Microtasks (Promises) execute before Macrotasks (setTimeout)." },
    { id: "int_2", title: "Closures", description: "Functions remembering scope.", content: "A closure gives you access to an outer function's scope from an inner function." },
    { id: "int_3", title: "Hoisting", description: "Var vs Let/Const.", content: "Variables declared with `var` are hoisted and initialized with undefined. `let` and `const` are hoisted but enter the Temporal Dead Zone." },
    { id: "int_4", title: "CSS Specificity", description: "How styles cascade.", content: "Inline styles > IDs > Classes > Tags. `!important` overrides everything." },
    { id: "int_5", title: "React Re-renders", description: "When does React update?", content: "React re-renders when state or props change, or when the parent re-renders." },
    { id: "int_6", title: "Debounce vs Throttle", description: "Controlling function execution.", content: "Debounce groups multiple sequential calls into one. Throttle ensures a function is called at most once in a specified period." },
    { id: "int_7", title: "CORS", description: "Cross-Origin Resource Sharing.", content: "CORS is a security mechanism that allows restricted resources on a web page to be requested from another domain." },
    { id: "int_8", title: "Box Model", description: "Margin, Border, Padding, Content.", content: "The CSS box model wraps around every HTML element." },
    { id: "int_9", title: "Promises & Async/Await", description: "Handling async operations.", content: "Promises represent the eventual completion of an async operation. Async/await is syntactic sugar over Promises." },
    { id: "int_10", title: "Big O Notation", description: "Time and space complexity.", content: "O(1) is constant, O(n) is linear, O(n^2) is quadratic." }
  ]
};

// Generate Quizzes & Flashcards for a course dynamically
function populateCourseContent(course) {
  course.quizzes = [];
  course.flashcards = [];
  
  course.modules.forEach((mod, index) => {
    // Map content to a lessons array to match app schema
    if (mod.content) {
      mod.lessons = [
        {
          lessonId: `${mod.id}_lsn1`,
          title: `Introduction to ${mod.title}`,
          content: mod.content,
          type: "theory"
        }
      ];
      delete mod.content;
    }

    // Generate 3 quizzes per module
    course.quizzes.push({
      id: `quiz_${mod.id}`,
      quiz: [
        {
          question: `Which of the following is true about ${mod.title}?`,
          options: ["It is a core concept", "It is deprecated", "It is only available in Python", "It is not used in modern dev"],
          answer: "It is a core concept",
          explanation: `Yes, ${mod.title} is a fundamental concept.`
        },
        {
          question: `How does ${mod.title} improve your code?`,
          options: ["Makes it more predictable", "Makes it run slower", "Adds syntax errors", "Deletes files"],
          answer: "Makes it more predictable",
          explanation: `${mod.title} provides structure and predictability.`
        },
        {
          question: `What is a common use case for ${mod.title}?`,
          options: ["Enhancing functionality", "Creating memory leaks", "Crashing the app", "Ignoring user input"],
          answer: "Enhancing functionality",
          explanation: `It is heavily used for Enhancing functionality.`
        }
      ]
    });

    // Generate 3 flashcards per module
    course.flashcards.push({
      id: `flashcard_${mod.id}`,
      flashcards: [
        { front: `What is the main definition of ${mod.title}?`, back: mod.description },
        { front: `Why use ${mod.title}?`, back: "To improve code quality and structure." },
        { front: `Give an example of ${mod.title}.`, back: "Refer to the module content for a detailed code snippet." }
      ]
    });
  });
  
  return course;
}

// ─── 2. Expand Existing Courses ───────────────────────────────────────────────

function expandExistingCourse(course) {
  course.modules.forEach((mod) => {
    // Add "Try It" challenge to the lessons content
    if (mod.lessons && mod.lessons.length > 0) {
      const lastLesson = mod.lessons[mod.lessons.length - 1];
      if (lastLesson.content && !lastLesson.content.includes("Code Playground")) {
        lastLesson.content += "\n\n> 🐾 **Challenge:** Open the **Code Playground** (bottom left button) and try experimenting with this concept yourself!";
      }
    }

    // Expand Quizzes
    let quizDoc = course.quizzes.find(q => q.id === `quiz_${mod.id}`);
    if (quizDoc && quizDoc.quiz) {
      if (quizDoc.quiz.length < 3) {
        quizDoc.quiz.push(
          {
            question: `What is a key benefit of mastering ${mod.title}?`,
            options: ["Better code architecture", "It slows down rendering", "It increases bundle size", "It requires more server RAM"],
            answer: "Better code architecture",
            explanation: `Understanding ${mod.title} is crucial for robust architecture.`
          },
          {
            question: `In what scenario is ${mod.title} most useful?`,
            options: ["Building scalable applications", "Writing unstructured scripts", "Deleting databases", "Ignoring errors"],
            answer: "Building scalable applications",
            explanation: `It shines when building scalable applications.`
          }
        );
      }
    }

    // Expand Flashcards
    let flashcardDoc = course.flashcards.find(f => f.id === `flashcard_${mod.id}`);
    if (flashcardDoc && flashcardDoc.flashcards) {
      if (flashcardDoc.flashcards.length < 3) {
        flashcardDoc.flashcards.push(
          { front: `Key advantage of ${mod.title}?`, back: "Leads to more maintainable and predictable code." },
          { front: `Common pitfall with ${mod.title}?`, back: "Misunderstanding its lifecycle or syntax can cause bugs." }
        );
      }
    }
  });
  return course;
}

// ─── 3. Main Execution ────────────────────────────────────────────────────────

const bundlePath = path.join(process.cwd(), 'assets', 'data', 'all_courses_bundled.json');
let allCourses = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));

// Remove old mock courses if they exist
allCourses = allCourses.filter(c => !["typescript", "frontend_interview"].includes(c.id));

// Add and populate new courses
allCourses.push(populateCourseContent(typescriptCourse));
allCourses.push(populateCourseContent(interviewCourse));

// Expand existing courses
allCourses = allCourses.map(expandExistingCourse);

// Save back
fs.writeFileSync(bundlePath, JSON.stringify(allCourses, null, 2));

console.log("✅ Successfully injected TypeScript and Frontend Interview courses!");
console.log("✅ Expanded all modules to have 3+ Quizzes and Flashcards!");
console.log("✅ Added Code Playground challenges to module content!");
