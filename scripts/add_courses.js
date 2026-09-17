/* eslint-env node */
const fs = require('fs');
const path = require('path');

const bundlePath = path.join(__dirname, '../assets/data/all_courses_bundled.json');
let courses = [];
if (fs.existsSync(bundlePath)) {
  courses = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
}

const pythonCourse = {
  id: "python",
  title: "Python",
  description: "Learn Python, the most popular programming language.",
  icon: "language-python",
  color: "#306998",
  modules: [
    {
      id: "py_m1",
      title: "Introduction",
      order: 1,
      content: "Python is a high-level, interpreted programming language with elegant syntax that makes it easier to read and write. It is widely used in Data Science, AI, and Backend Web Development."
    },
    {
      id: "py_m2",
      title: "Variables & Types",
      order: 2,
      content: "Python has several built-in types such as integers, floats, strings, and booleans. You can assign values to variables without declaring their type: x = 10."
    }
  ],
  flashcards: [
    { id: "py_f1", question: "What is Python?", answer: "A high-level interpreted programming language." },
    { id: "py_f2", question: "How do you define a function in Python?", answer: "Using the 'def' keyword." }
  ],
  quizzes: [
    {
      id: "py_q1",
      question: "Which of the following is not a core data type in Python?",
      options: ["List", "Dictionary", "Class", "Tuple"],
      correctAnswerIndex: 2
    }
  ]
};

const dsaCourse = {
  id: "dsa",
  title: "DSA",
  description: "Master Data Structures & Algorithms for interviews.",
  icon: "graph",
  color: "#FF5722",
  modules: [
    {
      id: "dsa_m1",
      title: "Big O Notation",
      order: 1,
      content: "Big O notation is used to describe the performance or complexity of an algorithm. O(1) means constant time, O(n) means linear time."
    },
    {
      id: "dsa_m2",
      title: "Arrays",
      order: 2,
      content: "An array is a collection of items stored at contiguous memory locations. Accessing an element by index takes O(1) time."
    }
  ],
  flashcards: [
    { id: "dsa_f1", question: "What is Big O notation?", answer: "A mathematical notation that describes the limiting behavior of a function when the argument tends towards a particular value or infinity." },
    { id: "dsa_f2", question: "What is the time complexity of binary search?", answer: "O(log n)" }
  ],
  quizzes: [
    {
      id: "dsa_q1",
      question: "Which data structure operates on a LIFO (Last In, First Out) principle?",
      options: ["Queue", "Stack", "Tree", "Graph"],
      correctAnswerIndex: 1
    }
  ]
};

const tsCourse = {
  id: "typescript",
  title: "TypeScript",
  description: "JavaScript with syntax for types.",
  icon: "language-typescript",
  color: "#3178C6",
  modules: [
    {
      id: "ts_m1",
      title: "Why TypeScript?",
      order: 1,
      content: "TypeScript adds static typing to JavaScript to catch errors early in the editor. It is a superset of JS."
    },
    {
      id: "ts_m2",
      title: "Basic Types",
      order: 2,
      content: "TS has types like boolean, number, string, array, tuple, and enum."
    }
  ],
  flashcards: [
    { id: "ts_f1", question: "What is TypeScript?", answer: "A strongly typed programming language that builds on JavaScript." },
    { id: "ts_f2", question: "How do you define a type for an object?", answer: "Using an interface or a type alias." }
  ],
  quizzes: [
    {
      id: "ts_q1",
      question: "Which keyword is used to declare an interface in TypeScript?",
      options: ["type", "interface", "class", "struct"],
      correctAnswerIndex: 1
    }
  ]
};

// Remove old if exist
courses = courses.filter(c => !["python", "dsa", "typescript"].includes(c.id));
courses.push(pythonCourse, dsaCourse, tsCourse);

fs.writeFileSync(bundlePath, JSON.stringify(courses, null, 2));
console.log("Successfully added Python, DSA, and TypeScript courses to bundle.");
