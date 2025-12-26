import authService from "../services/authService.js";

const register = async (req, res) => {
  try {
    const { email, password, full_name, address, dob } = req.body;

    if (!email || !password || !full_name) {
      return res
        .status(400)
        .json({ message: "email, password, and full_name are required" });
    }

    const user = await authService.register({
      email,
      password,
      full_name,
      address,
      dob,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const { token, user } = await authService.login({ email, password });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { register, login };
