import {
  comparePassword,
  createUser,
  generateToken,
  getUserByEmail,
  hashPassword,
} from "../services/auth.services.js";

export const getRegisterPage = (req, res) => {
  if (req.user) return res.redirect("/");

  return res.render("../views/auth/register");
};

export const postRegister = async (req, res) => {
  if (req.user) return res.redirect("/");

  // console.log(req.body);
  const { name, email, password } = req.body;

  const userExists = await getUserByEmail(email);
  console.log("userExists ", userExists);

  if (userExists) return res.redirect("/register");

  const hashedPassword = await hashPassword(password);

  const [user] = await createUser({ name, email, password: hashedPassword });
  console.log(user);

  res.redirect("/login");
};

export const getLoginPage = (req, res) => {
  if (req.user) return res.redirect("/");

  return res.render("auth/login");
};

export const postLogin = async (req, res) => {
  if (req.user) return res.redirect("/");

  const { email, password } = req.body;

  const user = await getUserByEmail(email);
  console.log("user email", user);

  if (!user) return res.redirect("/login");
  //todo bcrypt.compare(plainTextPassword, hashedPassword);
  const isPasswordValid = await comparePassword(password, user.password);

  // if (user.password !== password) return res.redirect("/login");
  if (!isPasswordValid) return res.redirect("/login");

  // res.cookie("isLoggedIn", true);

  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  res.cookie("access_token", token);

  res.redirect("/");
};

// Do You Need to Set Path=/ Manually?
//    ✅ cookie-parser and Express automatically set the path to / by default.


// export const getRegisterPage = (req, res) => {
//   return res.render("../views/auth/register");
// };

// export const getLoginPage = (req, res) => {
//   return res.render("auth/login");
// };

// export const postLogin = async (req, res) => {
//   // res.setHeader("Set-Cookie", "isLoggedIn=true, Path=/");
//   res.cookie("isLoggedIn", true);
//   res.redirect("/");
// };