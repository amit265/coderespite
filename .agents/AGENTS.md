# Practice Programs Generation Rule

When the user asks to "generate a practice program", "add a challenge", or "create a new DSA problem", you MUST follow the exact JSON object structure required by the CodeRespite practice programs database (`assets/data/programs.js`).

## Data Structure Schema
Each program object must contain the following keys exactly:

```javascript
{
  id: "kebab-case-identifier",           // String: Unique identifier (e.g., "valid-parentheses")
  courseId: "course-key",                // String: Must match a valid course ID from all_courses_bundled.json (e.g., "javascript", "dsa", "reactjs")
  moduleId: "modXX",                     // String: Must match a valid module ID for that course (e.g., "mod01", "mod04")
  title: "Title Case String",            // String: Display name of the program
  difficulty: "Easy" | "Medium" | "Hard",// String: Must be exactly one of these three
  category: "Category Name",             // String: Human-readable category (e.g., "Data Structures", "React Basics")
  tags: ["Tag1", "Tag2"],                // Array of Strings: 1-3 relevant concept tags
  starterCode: \`// Boilerplate code string\`, // String (Template Literal): Instructions, empty function, and a console.log test case.
  solutionCode: \`// Solution string\`         // String (Template Literal): Full working solution WITH highly detailed, line-by-line explanatory comments.
}
```

## Guidelines for Code Generation
1. **starterCode:** 
   - Must include a multi-line comment at the top explaining the problem clearly.
   - Must include an empty function definition for the user to fill out.
   - Must include at least 1-3 `console.log()` statements with the expected output commented next to them so the user can test their code.
2. **solutionCode:**
   - Must provide an optimal, working solution.
   - Must contain highly detailed, rich comments inside the function explaining the algorithm, time complexity, and *why* it works step-by-step.
   - Must include the exact same `console.log()` test cases at the bottom.

## How to execute
When requested to generate a program, append the generated object to the `PRACTICE_PROGRAMS` array inside `assets/data/programs.js`. Ensure you always use the correct `courseId` and `moduleId` by referencing the existing courses.
