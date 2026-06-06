// ============================================================
//  FOOD RECOMMENDATION ENGINE
//  Algorithm: Hybrid approach combining three signals:
//
//  1. PERSONAL HISTORY SCORE  (what YOU ordered before)
//     → Items you ordered more often + recently score higher
//
//  2. COLLABORATIVE FILTERING SCORE  (what similar users ordered)
//     → Find users who share your order history, see what THEY
//       ordered that YOU haven't tried yet
//
//  3. CATEGORY AFFINITY SCORE  (your preferred food categories)
//     → If you often order Rolls & Pasta, new items in those
//       categories get a boost even if you haven't ordered them
//
//  Final score = weighted sum of all three signals
//  Results are deduplicated and capped at `limit` items
// ============================================================

import interactionModel from "../models/recommendationModel.js";
import foodModel from "../models/foodModel.js";

// ── CONSTANTS ──────────────────────────────────────────────
const WEIGHTS = {
  personalHistory: 0.5,     // 50% weight — strongest signal
  collaborative:   0.3,     // 30% weight — "users like you"
  categoryAffinity: 0.2,    // 20% weight — genre-level preference
};

const RECENCY_HALF_LIFE_DAYS = 30; // score decays by half every 30 days
const MAX_SIMILAR_USERS      = 10; // how many "similar" users to consider
const DEFAULT_LIMIT          = 8;  // default number of recommendations


// ── HELPER: RECENCY DECAY ──────────────────────────────────
// Returns a multiplier between 0 and 1.
// An item ordered today → 1.0
// An item ordered 30 days ago → ~0.5
// An item ordered 90 days ago → ~0.125
//
// Formula: decay = 0.5 ^ (daysSince / halfLife)
const recencyDecay = (lastOrderedAt) => {
  const now = Date.now();
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = (now - new Date(lastOrderedAt).getTime()) / msPerDay;
  return Math.pow(0.5, daysSince / RECENCY_HALF_LIFE_DAYS);
};


// ── SIGNAL 1: PERSONAL HISTORY SCORE ──────────────────────
// For each food item the user has ordered before:
//   rawScore = orderCount * totalQuantity * recencyDecay
// Scores are then normalised to the range [0, 1] so they are
// comparable to the other signals.
const getPersonalScores = async (userId) => {
  // Fetch all interaction records for this user
  const interactions = await interactionModel.find({ userId });

  if (!interactions.length) return {};

  // Calculate raw score for every item
  const rawScores = {};
  for (const interaction of interactions) {
    const decay = recencyDecay(interaction.lastOrderedAt);
    rawScores[interaction.foodId] =
      interaction.orderCount * interaction.totalQuantity * decay;
  }

  // Normalise: divide every score by the maximum score found
  const maxScore = Math.max(...Object.values(rawScores));
  const normalised = {};
  for (const [foodId, score] of Object.entries(rawScores)) {
    normalised[foodId] = maxScore > 0 ? score / maxScore : 0;
  }

  return normalised; // { foodId: 0..1 }
};


// ── SIGNAL 2: COLLABORATIVE FILTERING SCORE ───────────────
// Steps:
//   a) Get the set of food items the target user has ordered
//   b) Find OTHER users who have ordered at least ONE of those same items
//      → these are "similar users"
//   c) Rank similar users by how many items they share with the target
//   d) Take the top MAX_SIMILAR_USERS similar users
//   e) Collect ALL items those similar users ordered
//   f) Score each item by: sum of (sharedItems / totalItems) for each
//      similar user who ordered that item — effectively a weighted vote
//   g) Items the target user already ordered are excluded
const getCollaborativeScores = async (userId, personalFoodIds) => {
  const orderedSet = new Set(personalFoodIds);

  if (!orderedSet.size) return {};

  // Step b: find other users who share at least one item
  const similarUserDocs = await interactionModel.aggregate([
    {
      $match: {
        userId: { $ne: userId },          // exclude current user
        foodId: { $in: [...orderedSet] }, // must share at least one item
      },
    },
    {
      // Group by userId and count how many shared items each has
      $group: {
        _id: "$userId",
        sharedCount: { $sum: 1 },
      },
    },
    { $sort: { sharedCount: -1 } },       // most similar first
    { $limit: MAX_SIMILAR_USERS },
  ]);

  if (!similarUserDocs.length) return {};

  // Build a map of { userId → sharedCount } for score weighting
  const similarUsers = {};
  for (const doc of similarUserDocs) {
    similarUsers[doc._id] = doc.sharedCount;
  }

  const similarUserIds = Object.keys(similarUsers);

  // Step e: fetch everything those similar users have ordered
  const theirInteractions = await interactionModel.find({
    userId: { $in: similarUserIds },
    foodId: { $nin: [...orderedSet] }, // only items the target hasn't tried
  });

  // Step f: score each new item as a weighted vote
  const scores = {};
  const totalShared = Object.values(similarUsers).reduce((a, b) => a + b, 0);

  for (const interaction of theirInteractions) {
    const weight = similarUsers[interaction.userId] / totalShared;
    scores[interaction.foodId] =
      (scores[interaction.foodId] || 0) + weight * interaction.orderCount;
  }

  // Normalise to [0, 1]
  const maxScore = Math.max(...Object.values(scores), 1);
  const normalised = {};
  for (const [foodId, score] of Object.entries(scores)) {
    normalised[foodId] = score / maxScore;
  }

  return normalised;
};


// ── SIGNAL 3: CATEGORY AFFINITY SCORE ─────────────────────
// Build a profile of the user's favourite categories by
// counting how many times they ordered from each category.
// Then for every food item not yet ordered, look up its
// category and assign a score proportional to how much the
// user likes that category.
const getCategoryAffinityScores = async (userId, personalFoodIds) => {
  const orderedSet = new Set(personalFoodIds);

  // Sum orderCount per category across all the user's interactions
  const interactions = await interactionModel.find({ userId });
  const categoryCount = {};
  for (const interaction of interactions) {
    categoryCount[interaction.category] =
      (categoryCount[interaction.category] || 0) + interaction.orderCount;
  }

  if (!Object.keys(categoryCount).length) return {};

  const totalOrders = Object.values(categoryCount).reduce((a, b) => a + b, 0);

  // Fetch all food items the user has NOT yet ordered
  const allFoods = await foodModel.find({
    _id: { $nin: [...orderedSet] },
  });

  // Score each un-ordered item by the user's affinity for its category
  const scores = {};
  for (const food of allFoods) {
    const affinity = (categoryCount[food.category] || 0) / totalOrders;
    scores[food._id.toString()] = affinity; // already in [0, 1]
  }

  return scores;
};


// ── MAIN EXPORT: getRecommendations ───────────────────────
// Orchestrates all three signals and returns a ranked list of
// food items as full MongoDB documents.
//
// @param userId  {string}  — the logged-in user's ID
// @param limit   {number}  — max items to return (default 8)
// @returns       {Array}   — array of foodModel documents, best first
export const getRecommendations = async (userId, limit = DEFAULT_LIMIT) => {

  // ── Step 1: Get the user's personal interaction records ──
  const personalInteractions = await interactionModel.find({ userId });
  const personalFoodIds = personalInteractions.map((i) => i.foodId);

  // ── Step 2: Compute all three signals in parallel ────────
  const [personalScores, collaborativeScores, categoryScores] =
    await Promise.all([
      getPersonalScores(userId),
      getCollaborativeScores(userId, personalFoodIds),
      getCategoryAffinityScores(userId, personalFoodIds),
    ]);

  // ── Step 3: Collect all candidate food IDs ───────────────
  // Union of all three score maps
  const allCandidateIds = new Set([
    ...Object.keys(personalScores),
    ...Object.keys(collaborativeScores),
    ...Object.keys(categoryScores),
  ]);

  // ── Step 4: Compute final weighted score per candidate ───
  const finalScores = {};
  for (const foodId of allCandidateIds) {
    const p = personalScores[foodId]      || 0;
    const c = collaborativeScores[foodId] || 0;
    const a = categoryScores[foodId]      || 0;

    finalScores[foodId] =
      WEIGHTS.personalHistory * p +
      WEIGHTS.collaborative   * c +
      WEIGHTS.categoryAffinity * a;
  }

  // ── Step 5: Sort by score descending, take top `limit` ───
  const topFoodIds = Object.entries(finalScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, limit)
    .map(([foodId]) => foodId);

  if (!topFoodIds.length) {
    // Cold start: user has no history → return top-selling items overall
    return getColdStartRecommendations(limit);
  }

  // ── Step 6: Fetch full food documents from DB ────────────
  const recommendedFoods = await foodModel.find({
    _id: { $in: topFoodIds },
  });

  // Re-sort documents to match the score-ranked order
  const foodMap = {};
  for (const food of recommendedFoods) {
    foodMap[food._id.toString()] = food;
  }

  return topFoodIds
    .map((id) => foodMap[id])
    .filter(Boolean); // remove any missing references
};


// ── COLD START FALLBACK ───────────────────────────────────
// When a new user has no order history, recommend the most
// popular items globally (highest total order counts across
// all users).
const getColdStartRecommendations = async (limit) => {
  // Aggregate total order counts per food item across all users
  const popular = await interactionModel.aggregate([
    {
      $group: {
        _id: "$foodId",
        totalOrders: { $sum: "$orderCount" },
      },
    },
    { $sort: { totalOrders: -1 } },
    { $limit: limit },
  ]);

  if (!popular.length) {
    // Absolute cold start: no interactions at all → return any foods
    return foodModel.find({}).limit(limit);
  }

  const popularIds = popular.map((p) => p._id);
  const foods = await foodModel.find({ _id: { $in: popularIds } });

  // Sort to match popularity ranking
  const countMap = {};
  for (const p of popular) countMap[p._id] = p.totalOrders;

  return foods.sort(
    (a, b) => (countMap[b._id.toString()] || 0) - (countMap[a._id.toString()] || 0)
  );
};


// ── INTERACTION TRACKER ────────────────────────────────────
// Called from orderController.placeOrder every time an order
// is placed. Updates (or creates) one interaction record per
// food item in the order.
//
// @param userId  {string}
// @param items   {Array}  — order items: [{ _id, name, category, quantity }]
export const trackOrderInteractions = async (userId, items) => {
  const updates = items.map((item) =>
    interactionModel.findOneAndUpdate(
      { userId, foodId: item._id.toString() },   // find existing record
      {
        $inc: {
          orderCount:    1,                       // increment order count
          totalQuantity: item.quantity,           // add quantity ordered
        },
        $set: {
          foodName:      item.name,
          category:      item.category,
          lastOrderedAt: new Date(),              // update recency timestamp
        },
      },
      { upsert: true, new: true }                // create if doesn't exist
    )
  );

  await Promise.all(updates); // run all updates in parallel
};