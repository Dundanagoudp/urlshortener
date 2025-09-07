import { z } from "zod";
import { AuthServices } from "../services/auth.services.js";
import { AppError } from "../utils/AppError.js";
import {
  changePasswordSchema,
  editProfileSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sendVerificationLinkSchema,
  setPasswordSchema,
  verifyEmailSchema,
} from "../validators/auth.validator.js";
import { GITHUB_CLIENT_ID, GOOGLE_CLIENT_ID } from "../config/constants.js";

// GET /register
export const getRegisterPage = (req, res) => {
  const errors = req.flash("errors");
  const messages = req.flash("messages");

  return res.render("auth/register", {
    title: "Register",
    errors,
    messages,
  });
};

// POST /register
export const postRegister = async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const user = await AuthServices.findUserByEmail(email);

    if (user) {
      req.flash("errors", "User with this email already exists");
      return res.redirect("/register");
    }

    await AuthServices.createUser({ email, password, name });

    req.flash("messages", "User created successfully");

    return res.redirect("/login");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect("/register");
    }
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /login
export const getLoginPage = (req, res) => {
  const errors = req.flash("errors");
  const messages = req.flash("messages");

  return res.render("auth/login", {
    title: "Login",
    errors,
    messages,
  });
};

// POST /login
export const postLogin = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await AuthServices.findUserByEmail(email);

    if (!user) {
      req.flash("errors", "User with this email does not exist");
      return res.redirect("/login");
    }

    const isPasswordCorrect = await AuthServices.verifyPassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      req.flash("errors", "Incorrect password");
      return res.redirect("/login");
    }

    req.session.user = user;

    return res.redirect("/");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect("/login");
    }
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /me
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    return res.json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /edit-profile
export const getEditProfilePage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const errors = req.flash("errors");
    const messages = req.flash("messages");

    return res.render("auth/edit-profile", {
      title: "Edit Profile",
      user,
      errors,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// POST /edit-profile
export const postEditProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const { name } = editProfileSchema.parse(req.body);

    await AuthServices.updateUser(user.id, { name });

    req.flash("messages", "Profile updated successfully");

    return res.redirect("/profile");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect("/edit-profile");
    }
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /profile
export const getProfilePage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const errors = req.flash("errors");
    const messages = req.flash("messages");

    return res.render("auth/profile", {
      title: "Profile",
      user,
      errors,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /change-password
export const getChangePasswordPage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const errors = req.flash("errors");
    const messages = req.flash("messages");

    return res.render("auth/change-password", {
      title: "Change Password",
      user,
      errors,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// POST /change-password
export const postChangePassword = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const { oldPassword, newPassword } = changePasswordSchema.parse(req.body);

    const isPasswordCorrect = await AuthServices.verifyPassword(
      oldPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      req.flash("errors", "Incorrect password");
      return res.redirect("/change-password");
    }

    await AuthServices.updateUser(user.id, { password: newPassword });

    req.flash("messages", "Password changed successfully");

    return res.redirect("/profile");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect("/change-password");
    }
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /forgot-password
export const getForgotPasswordPage = (req, res) => {
  const errors = req.flash("errors");
  const messages = req.flash("messages");

  return res.render("auth/forgot-password", {
    title: "Forgot Password",
    errors,
    messages,
  });
};

// POST /forgot-password
export const postForgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await AuthServices.findUserByEmail(email);

    if (!user) {
      req.flash("errors", "User with this email does not exist");
      return res.redirect("/forgot-password");
    }

    await AuthServices.sendPasswordResetEmail(user.id, user.email);

    req.flash("messages", "Password reset link sent to your email");

    return res.redirect("/forgot-password");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect("/forgot-password");
    }

    if (error instanceof AppError) {
      req.flash("errors", error.message);
      return res.redirect("/forgot-password");
    }

    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /reset-password/:token
export const getResetPasswordTokenPage = async (req, res) => {
  try {
    const { token } = req.params;

    const isTokenValid = await AuthServices.verifyPasswordResetToken(token);

    if (!isTokenValid) {
      return res.render("auth/wrong-reset-password-token", {
        title: "Invalid Token",
      });
    }

    const errors = req.flash("errors");
    const messages = req.flash("messages");

    return res.render("auth/reset-password", {
      title: "Reset Password",
      token,
      errors,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// POST /reset-password/:token
export const postResetPasswordToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = resetPasswordSchema.parse(req.body);

    const isTokenValid = await AuthServices.verifyPasswordResetToken(token);

    if (!isTokenValid) {
      return res.render("auth/wrong-reset-password-token", {
        title: "Invalid Token",
      });
    }

    await AuthServices.resetPassword(token, password);

    req.flash("messages", "Password reset successfully");

    return res.redirect("/login");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect(`/reset-password/${req.params.token}`);
    }
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /set-password
export const getSetPasswordPage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const errors = req.flash("errors");
    const messages = req.flash("messages");

    return res.render("auth/set-password", {
      title: "Set Password",
      user,
      errors,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// POST /set-password
export const postSetPassword = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const { password } = setPasswordSchema.parse(req.body);

    await AuthServices.updateUser(user.id, { password });

    req.flash("messages", "Password set successfully");

    return res.redirect("/profile");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect("/set-password");
    }
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /verify-email
export const getVerifyEmailPage = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const errors = req.flash("errors");
    const messages = req.flash("messages");

    return res.render("auth/verify-email", {
      title: "Verify Email",
      user,
      errors,
      messages,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// POST /verify-email
export const resendVerificationLink = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    const { email } = sendVerificationLinkSchema.parse({ email: user.email });

    await AuthServices.sendVerificationEmail(user.id, email);

    req.flash("messages", "Verification link sent to your email");

    return res.redirect("/verify-email");
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.flash("errors", error.errors.map((err) => err.message));
      return res.redirect("/verify-email");
    }

    if (error instanceof AppError) {
      req.flash("errors", error.message);
      return res.redirect("/verify-email");
    }

    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /verify-email/:token
export const verifyEmailToken = async (req, res) => {
  try {
    const { token } = req.params;

    const isTokenValid = await AuthServices.verifyEmailToken(token);

    if (!isTokenValid) {
      return res.render("auth/wrong-reset-password-token", {
        title: "Invalid Token",
      });
    }

    req.flash("messages", "Email verified successfully");

    return res.redirect("/profile");
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /google-login
export const getGoogleLoginPage = (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:3000/google-login/callback&response_type=code&scope=openid%20email%20profile`;

  return res.redirect(url);
};

// GET /google-login/callback
export const getGoogleLoginCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const user = await AuthServices.verifyGoogleCode(code);

    req.session.user = user;

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};

// GET /github-login
export const getGithubLoginPage = (req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}`;

  return res.redirect(url);
};

// GET /github-login/callback
export const getGithubLoginCallback = async (req, res) => {
  try {
    const { code } = req.query;

    const user = await AuthServices.verifyGithubCode(code);

    req.session.user = user;

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.status(500).render("500");
  }
};