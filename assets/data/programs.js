export const PRACTICE_PROGRAMS = [
  {
    id: "two-sum",
    courseId: "dsa",
    moduleId: "mod02", // Arrays
    title: "Two Sum",
    difficulty: "Easy",
    category: "Data Structures",
    tags: ["Array", "Hash Table"],
    starterCode: `// Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
// You may assume that each input would have exactly one solution, and you may not use the same element twice.

function twoSum(nums, target) {
  // Write your code here
  
}

// Test Case
console.log(twoSum([2, 7, 11, 15], 9)); // Expected output: [0, 1]
`,
    solutionCode: `function twoSum(nums, target) {
  // Create a map to store the numbers we have seen so far and their indices
  const map = new Map();
  
  // Loop through the array exactly once (O(n) time complexity)
  for (let i = 0; i < nums.length; i++) {
    // Calculate the number we need to find to reach the target
    const complement = target - nums[i];
    
    // Check if we have already seen this required number
    if (map.has(complement)) {
      // If found, return the index of the complement and the current index
      return [map.get(complement), i];
    }
    
    // Otherwise, store the current number and its index in the map for future checks
    map.set(nums[i], i);
  }
  
  return []; // Return empty array if no solution is found
}

console.log(twoSum([2, 7, 11, 15], 9));`
  },
  {
    id: "palindrome-check",
    courseId: "javascript",
    moduleId: "mod02",
    title: "Palindrome Check",
    difficulty: "Easy",
    category: "JavaScript Basics",
    tags: ["String", "Two Pointers"],
    starterCode: `// Given a string s, return true if it is a palindrome, or false otherwise.
// A string is a palindrome when it reads the same backward as forward.

function isPalindrome(s) {
  // Write your code here
  
}

// Test Cases
console.log(isPalindrome("racecar")); // Expected: true
console.log(isPalindrome("hello")); // Expected: false
`,
    solutionCode: `function isPalindrome(s) {
  // We use the "Two Pointers" technique here for O(n) efficiency and O(1) space
  let left = 0; // Pointer starting at the beginning of the string
  let right = s.length - 1; // Pointer starting at the end of the string
  
  // Keep checking characters as long as the left pointer is before the right pointer
  while (left < right) {
    // If the characters don't match, it's not a palindrome!
    if (s[left] !== s[right]) return false;
    
    // Move pointers closer to the middle
    left++;
    right--;
  }
  
  // If we checked all pairs and they matched, it is a palindrome
  return true;
}

console.log(isPalindrome("racecar"));
console.log(isPalindrome("hello"));`
  },
  {
    id: "fizz-buzz",
    courseId: "javascript",
    moduleId: "mod03",
    title: "FizzBuzz",
    difficulty: "Easy",
    category: "JavaScript Basics",
    tags: ["Math", "Loop"],
    starterCode: `// Write a program that prints the numbers from 1 to n.
// For multiples of 3, print "Fizz" instead of the number.
// For multiples of 5, print "Buzz".
// For multiples of both 3 and 5, print "FizzBuzz".

function fizzBuzz(n) {
  // Write your code here
  
}

fizzBuzz(15);
`,
    solutionCode: `function fizzBuzz(n) {
  // Loop from 1 up to and including 'n'
  for (let i = 1; i <= n; i++) {
    // Condition 1: Check if 'i' is a multiple of BOTH 3 and 5
    // We check this first because it is the most specific condition
    if (i % 3 === 0 && i % 5 === 0) {
      console.log("FizzBuzz");
    } 
    // Condition 2: Check if 'i' is a multiple of 3 only
    else if (i % 3 === 0) {
      console.log("Fizz");
    } 
    // Condition 3: Check if 'i' is a multiple of 5 only
    else if (i % 5 === 0) {
      console.log("Buzz");
    } 
    // Default Condition: Print the number itself
    else {
      console.log(i);
    }
  }
}

fizzBuzz(15);`
  },
  {
    id: "reverse-linked-list",
    courseId: "dsa",
    moduleId: "mod03", // Linked List
    title: "Reverse Linked List",
    difficulty: "Medium",
    category: "Data Structures",
    tags: ["Linked List", "Recursion"],
    starterCode: `// Given the head of a singly linked list, reverse the list, and return the reversed list.

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  // Write your code here
  
}

// Helper to create and test
let head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
console.log(reverseList(head));
`,
    solutionCode: `class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  // 'prev' will keep track of the previously visited node (starts as null)
  let prev = null;
  // 'curr' will keep track of our current position in the list
  let curr = head;
  
  // Traverse the entire list until we hit the end
  while (curr !== null) {
    // Temporarily store the next node so we don't lose the rest of the list
    let nextTemp = curr.next;
    
    // Reverse the 'next' pointer to point backwards to 'prev'
    curr.next = prev;
    
    // Slide our pointers one step forward for the next iteration
    prev = curr;
    curr = nextTemp;
  }
  
  // At the end, 'curr' is null, and 'prev' is the new head of the reversed list
  return prev;
}

let head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
console.log(reverseList(head));`
  },
  {
    id: "valid-parentheses",
    courseId: "dsa",
    moduleId: "mod04", // Stacks
    title: "Valid Parentheses",
    difficulty: "Medium",
    category: "Data Structures",
    tags: ["Stack", "String"],
    starterCode: `// Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

function isValid(s) {
  // Write your code here
  
}

// Test Cases
console.log(isValid("()")); // Expected: true
console.log(isValid("()[]{}")); // Expected: true
console.log(isValid("(]")); // Expected: false
`,
    solutionCode: `function isValid(s) {
  // We use an array as a Stack (LIFO) to keep track of open brackets
  const stack = [];
  
  // A hash map to quickly check if a bracket is an opening bracket
  // and to know exactly what its matching closing bracket should be
  const map = {
    '(': ')',
    '[': ']',
    '{': '}'
  };
  
  // Loop through each character in the string
  for (let i = 0; i < s.length; i++) {
    // If it's an opening bracket (exists in our map keys)
    if (map[s[i]]) {
      // Push its expected CLOSING bracket onto the stack
      stack.push(map[s[i]]);
    } 
    // If it's a closing bracket
    else {
      // Pop the top expected bracket off the stack and compare it.
      // If it doesn't match the current character, the string is invalid!
      if (stack.pop() !== s[i]) return false;
    }
  }
  
  // If the stack is completely empty at the end, all brackets were validly closed!
  return stack.length === 0;
}

console.log(isValid("()"));
console.log(isValid("()[]{}"));
console.log(isValid("(]"));`
  },
  {
    id: "fibonacci",
    courseId: "dsa",
    moduleId: "mod11", // Dynamic Programming
    title: "Fibonacci Sequence",
    difficulty: "Medium",
    category: "Algorithms",
    tags: ["Math", "Dynamic Programming"],
    starterCode: `// The Fibonacci numbers, commonly denoted F(n) form a sequence, called the Fibonacci sequence, 
// such that each number is the sum of the two preceding ones, starting from 0 and 1.
// Given n, calculate F(n).

function fib(n) {
  // Write your code here
  
}

// Test Cases
console.log(fib(2)); // Expected: 1
console.log(fib(3)); // Expected: 2
console.log(fib(4)); // Expected: 3
`,
    solutionCode: `function fib(n) {
  // Base cases: F(0) = 0 and F(1) = 1
  if (n <= 1) return n;
  
  // Instead of an array, we only need to store the two most recent numbers to save space (O(1) space complexity)
  let a = 0; // Represents F(n-2)
  let b = 1; // Represents F(n-1)
  
  // Iterate starting from 2 up to 'n'
  for (let i = 2; i <= n; i++) {
    // Calculate the current Fibonacci number
    let temp = a + b;
    
    // Shift our variables up one step for the next iteration
    a = b;
    b = temp;
  }
  
  // Return the nth Fibonacci number
  return b;
}

console.log(fib(2));
console.log(fib(3));
console.log(fib(4));`
  }
];
