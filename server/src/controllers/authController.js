import authService from "../services/authService.js";
import verifyRecaptcha from "../utils/recaptcha.js";

class AuthController {
  async register(req, res) {
    try {
      const { email, password, full_name, address, dob, captchaToken } =
        req.body;

      if (!email || !password || !full_name) {
        return res
          .status(400)
          .json({ message: "email, password, and full_name are required" });
      }

      const captchaValid = await verifyRecaptcha(captchaToken);
      if (!captchaValid) {
        return res.status(400).json({
          message: "Captcha verification failed",
        });
      }

      const user = await authService.register({
        email,
        password,
        full_name,
        address,
        dob,
      });

      return res.status(201).json({
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
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "email and password are required" });
      }

      const { token, user } = await authService.login({ email, password });

      return res.status(200).json({
        message: "Login successful",
        token,
        user,
      });
    } catch (error) {
      if (error.message === "Invalid credentials") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async me(req, res) {
    try {
      // Not logged in -> guest response
      if (!req.auth?.authenticated) {
        return res.status(200).json({
          authenticated: false,
          role: "guest",
          user: null,
        });
      }

      const user = await authService.getCurrentUser(req.auth.userId);

      // Token valid but user deleted -> treat as guest
      if (!user) {
        return res.status(200).json({
          authenticated: false,
          role: "guest",
          user: null,
        });
      }

      return res.status(200).json({
        authenticated: true,
        role: user.role,
        user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

const authController = new AuthController();
export default authController;
