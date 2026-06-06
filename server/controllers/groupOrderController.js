import groupOrderModel from "../models/groupOrderModel.js";

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const createGroupOrder = async (req, res) => {
  try {
    const { userId, userName } = req.body;
    const groupCode = generateCode();
    const group = await groupOrderModel.create({
      groupCode, hostUserId: userId,
      participants: [{ userId, name: userName || "Host", items: [], subtotal: 0 }],
    });
    res.json({ success: true, groupCode: group.groupCode, groupId: group._id });
  } catch (error) { res.json({ success: false, message: "Error creating group order" }); }
};

const joinGroupOrder = async (req, res) => {
  try {
    const { groupCode, userId, userName } = req.body;
    const group = await groupOrderModel.findOne({ groupCode, status: "open" });
    if (!group) return res.json({ success: false, message: "Group not found or already locked" });
    const alreadyIn = group.participants.find((p) => p.userId === userId);
    if (!alreadyIn) { group.participants.push({ userId, name: userName || "Member", items: [], subtotal: 0 }); await group.save(); }
    res.json({ success: true, group });
  } catch (error) { res.json({ success: false, message: "Error joining group" }); }
};

const addItemToGroup = async (req, res) => {
  try {
    const { groupCode, userId, item } = req.body;
    const group = await groupOrderModel.findOne({ groupCode, status: "open" });
    if (!group) return res.json({ success: false, message: "Group not found" });
    const participant = group.participants.find((p) => p.userId === userId);
    if (!participant) return res.json({ success: false, message: "You are not in this group" });
    const existing = participant.items.find((i) => i._id === item._id);
    if (existing) { existing.quantity += item.quantity || 1; }
    else { participant.items.push({ ...item, quantity: item.quantity || 1 }); }
    participant.subtotal = participant.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    group.totalAmount = group.participants.reduce((sum, p) => sum + p.subtotal, 0);
    await group.save();
    res.json({ success: true, group });
  } catch (error) { res.json({ success: false, message: "Error adding item" }); }
};

const calculateSplit = async (req, res) => {
  try {
    const { groupCode, deliveryFee = 0 } = req.body;
    const group = await groupOrderModel.findOne({ groupCode });
    if (!group) return res.json({ success: false, message: "Group not found" });
    const perPersonDelivery = deliveryFee / group.participants.length;
    const split = group.participants.map((p) => ({
      userId: p.userId, name: p.name,
      itemsSubtotal: p.subtotal,
      deliveryShare: parseFloat(perPersonDelivery.toFixed(2)),
      totalDue: parseFloat((p.subtotal + perPersonDelivery).toFixed(2)),
      items: p.items,
    }));
    res.json({ success: true, groupCode, totalAmount: group.totalAmount + deliveryFee, deliveryFee, split });
  } catch (error) { res.json({ success: false, message: "Error calculating split" }); }
};

const getGroupOrder = async (req, res) => {
  try {
    const group = await groupOrderModel.findOne({ groupCode: req.params.groupCode });
    if (!group) return res.json({ success: false, message: "Group not found" });
    res.json({ success: true, group });
  } catch (error) { res.json({ success: false, message: "Error" }); }
};

export { createGroupOrder, joinGroupOrder, addItemToGroup, calculateSplit, getGroupOrder };
