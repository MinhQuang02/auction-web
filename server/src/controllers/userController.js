import userService from "../services/userService.js";

// GET user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await userService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { full_name, address, email, currentPassword, newPassword } = req.body;

    const updatedUser = await userService.updateUserProfile(userId, {
      full_name,
      address,
      email,
      currentPassword,
      newPassword
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Email already exists" });
    }
    if (error.message === "Invalid current password") {
      return res.status(400).json({ message: "Invalid current password" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getProfile,
  updateProfile,
};
