import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getMoodRecommendation }                              from "../controllers/moodController.js";
import { getFoodCombo }                                       from "../controllers/comboController.js";
import { createGroupOrder, joinGroupOrder, addItemToGroup,
         calculateSplit, getGroupOrder }                      from "../controllers/groupOrderController.js";
import { getClosingDiscountFoods }                            from "../controllers/closingDealController.js";
import { getNutritionRecommendation, saveNutritionPreferences } from "../controllers/nutritionController.js";
import { searchFood, getSurpriseFood, getDailyCuisine }       from "../controllers/discoveryController.js";
import { checkDeliveryDelay, generateCoupon }                 from "../controllers/deliveryChallengeController.js";

const router = express.Router();

router.get("/mood/:mood",                         getMoodRecommendation);
router.get("/food-combo/:foodId",                 getFoodCombo);
router.post("/group/create",   authMiddleware,    createGroupOrder);
router.post("/group/join",     authMiddleware,    joinGroupOrder);
router.post("/group/add-item", authMiddleware,    addItemToGroup);
router.post("/group/split",                       calculateSplit);
router.get("/group/:groupCode",                   getGroupOrder);
router.get("/closing-discount-foods",             getClosingDiscountFoods);
router.get("/nutrition-recommendation/:userId",   authMiddleware, getNutritionRecommendation);
router.post("/nutrition-preferences",             authMiddleware, saveNutritionPreferences);
router.get("/search-food",                        searchFood);
router.get("/surprise-food",                      getSurpriseFood);
router.get("/daily-cuisine",                      getDailyCuisine);
router.post("/check-delivery-delay",              checkDeliveryDelay);
router.post("/generate-coupon",                   generateCoupon);

export default router;
