import type { DailyChallenge } from "@/types";

const CHALLENGES: DailyChallenge[] = [
  { id: 1, title: "Two Sum", difficulty: "Easy", slug: "two-sum", tags: ["Array", "Hash Table"] },
  { id: 2, title: "Valid Parentheses", difficulty: "Easy", slug: "valid-parentheses", tags: ["Stack", "String"] },
  { id: 3, title: "Merge Two Sorted Lists", difficulty: "Easy", slug: "merge-two-sorted-lists", tags: ["Linked List"] },
  { id: 4, title: "Best Time to Buy and Sell Stock", difficulty: "Easy", slug: "best-time-to-buy-and-sell-stock", tags: ["Array", "DP"] },
  { id: 5, title: "Longest Substring Without Repeating", difficulty: "Medium", slug: "longest-substring-without-repeating-characters", tags: ["Sliding Window"] },
  { id: 6, title: "Add Two Numbers", difficulty: "Medium", slug: "add-two-numbers", tags: ["Linked List", "Math"] },
  { id: 7, title: "3Sum", difficulty: "Medium", slug: "3sum", tags: ["Array", "Two Pointers"] },
  { id: 8, title: "Binary Tree Level Order Traversal", difficulty: "Medium", slug: "binary-tree-level-order-traversal", tags: ["BFS", "Tree"] },
  { id: 9, title: "Coin Change", difficulty: "Medium", slug: "coin-change", tags: ["DP", "BFS"] },
  { id: 10, title: "Median of Two Sorted Arrays", difficulty: "Hard", slug: "median-of-two-sorted-arrays", tags: ["Binary Search", "Array"] },
  { id: 11, title: "Trapping Rain Water", difficulty: "Hard", slug: "trapping-rain-water", tags: ["Stack", "Two Pointers"] },
  { id: 12, title: "Word Ladder", difficulty: "Hard", slug: "word-ladder", tags: ["BFS", "Hash Table"] },
  { id: 13, title: "Climbing Stairs", difficulty: "Easy", slug: "climbing-stairs", tags: ["DP", "Math"] },
  { id: 14, title: "House Robber", difficulty: "Medium", slug: "house-robber", tags: ["DP", "Array"] },
  { id: 15, title: "Number of Islands", difficulty: "Medium", slug: "number-of-islands", tags: ["BFS", "DFS", "Grid"] },
];

export function getDailyChallenge(): DailyChallenge {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return CHALLENGES[dayOfYear % CHALLENGES.length];
}
