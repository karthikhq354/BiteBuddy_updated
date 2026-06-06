import userModel from "../models/userModel.js";

const getAddresses = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("savedAddresses");
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, data: user.savedAddresses });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching addresses" });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { label, firstName, lastName, email, street, city, state, pincode, country, phone } = req.body;

    if (!firstName || !lastName || !street || !city || !state || !pincode || !country || !phone) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findById(userId).select("savedAddresses");
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.savedAddresses.length >= 5) {
      return res.json({ success: false, message: "Maximum 5 addresses allowed. Please delete one first." });
    }

    const addressData = { label, firstName, lastName, email, street, city, state, pincode, country, phone };

    if (user.savedAddresses.length === 0) addressData.isDefault = true;

    await userModel.findByIdAndUpdate(userId, {
      $push: { savedAddresses: addressData },
    });

    res.json({ success: true, message: "Address saved" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error saving address" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { addressId, userId } = req.body;
    const user = await userModel.findById(userId).select("savedAddresses");
    if (!user) return res.json({ success: false, message: "User not found" });

    const addressToDelete = user.savedAddresses.id(addressId);
    if (!addressToDelete) return res.json({ success: false, message: "Address not found" });

    const wasDefault = addressToDelete.isDefault;

    await userModel.findByIdAndUpdate(userId, {
      $pull: { savedAddresses: { _id: addressId } },
    });

    if (wasDefault) {
      const updatedUser = await userModel.findById(userId).select("savedAddresses");
      if (updatedUser.savedAddresses.length > 0) {
        updatedUser.savedAddresses[0].isDefault = true;
        await updatedUser.save();
      }
    }

    res.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting address" });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const { addressId, userId } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.json({ success: false, message: "User not found" });

    user.savedAddresses.forEach((addr) => (addr.isDefault = false));

    const target = user.savedAddresses.id(addressId);
    if (!target) return res.json({ success: false, message: "Address not found" });

    target.isDefault = true;
    await user.save();

    res.json({ success: true, message: "Default address updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error setting default address" });
  }
};

export { getAddresses, addAddress, deleteAddress, setDefaultAddress };