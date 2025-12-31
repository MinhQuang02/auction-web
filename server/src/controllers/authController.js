import authService from "../services/authService.js";
import verifyRecaptcha from "../utils/recaptcha.js";

class AuthController {
  async register(req, res) {
    try {
      const { email, password, full_name, address, dob, captchaToken } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Uncomment this when you are ready to enable Captcha
      // const captchaValid = await verifyRecaptcha(captchaToken);
      // if (!captchaValid) {
      //   return res.status(400).json({ message: "Captcha failed" });
      // }

      await authService.registerAndSendOtp({
        email,
        password,
        full_name,
        address,
        dob,
      });

      return res.status(201).json({
        message: "Registration successful. Please verify your email.",
      });
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
      }
      console.error("Register Error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async verifyEmail(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: "Missing email or OTP" });
      }

      await authService.verifyEmail({ email, otp });

      return res.json({ message: "Email verified successfully" });
    } catch (err) {
      if (
        err.message === "Invalid request" ||
        err.message === "Invalid OTP" ||
        err.message === "OTP expired"
      ) {
        return res.status(400).json({ message: err.message });
      }
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "email and password are required" });
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
      if (error.message === "Email not verified") {
        return res.status(403).json({ message: "Email not verified" });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async google(req, res) {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Token is required" });

      const { user, token: jwtToken } = await authService.googleSignIn({
        token,
      });

      return res.json({ user, token: jwtToken });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Google sign-in failed" });
    }
  }

  // --- THIS IS THE FIXED FUNCTION WITH DEBUG LOGS ---
  async me(req, res) {
    try {
      if (!req.auth || !req.auth.userId) {
        return res.status(200).json({
          authenticated: false,
          role: "guest",
          user: null,
        });
      }

      const user = await authService.getCurrentUser(req.auth.userId);

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
      return res.status(500).json({ message: "Internal server error" });
    }
  }
  // -----------------------------------------------

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await authService.requestPasswordReset(email);

      return res.json({
        message: "If the email exists, a reset link has been sent.",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ message: "Missing token or password" });
      }

      await authService.resetPassword({ token, password });

      return res.json({ message: "Password reset successful" });
    } catch (err) {
      if (err.message === "Invalid or expired token") {
        return res.status(400).json({ message: err.message });
      }
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}

const authController = new AuthController();
export default authController;