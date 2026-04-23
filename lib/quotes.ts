const QUOTES = [
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "Experience is the name everyone gives to their mistakes.", author: "Oscar Wilde" },
  { text: "In order to be irreplaceable, one must always be different.", author: "Coco Chanel" },
  { text: "Java is to JavaScript what car is to carpet.", author: "Chris Heilmann" },
  { text: "Knowledge is power.", author: "Francis Bacon" },
  { text: "Sometimes it pays to stay in bed on Monday rather than spending the rest of the week debugging.", author: "Dan Salomon" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
  { text: "It's not a bug; it's an undocumented feature.", author: "Anonymous" },
  { text: "Fix the cause, not the symptom.", author: "Steve Maguire" },
  { text: "Optimism is an occupational hazard of programming; feedback is the treatment.", author: "Kent Beck" },
  { text: "When to use iterative development? You should use iterative development only on projects that you want to succeed.", author: "Martin Fowler" },
  { text: "The most disastrous thing that you can ever learn is your first programming language.", author: "Alan Kay" },
  { text: "The function of good software is to make the complex appear to be simple.", author: "Grady Booch" },
  { text: "There are two ways to write error-free programs; only the third one works.", author: "Alan J. Perlis" },
];

export function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return QUOTES[dayOfYear % QUOTES.length];
}
