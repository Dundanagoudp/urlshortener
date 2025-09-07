import { error } from "console";
import {
  createShortLink,
  deleteShortLink,
  getAllShortLinks,
  getShortLink,
  updateShortLink,
} from "../services/shortener.services.js";
import { shortenerSchema } from "../validators/shortener-validator.js";

export const getShortenerPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const links = await getAllShortLinks(req.user.id);
    const error = req.flash("error"); // Use `error` instead of `errors`

    return res.render("index", {
      links,
      host: req.headers.host, // Use `req.headers.host` instead of `req.host`
      error, // Pass `error` to the template
      user: req.user, // Pass the user object to the template
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const postURLShortener = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { long_url, short_code } = shortenerSchema.parse(req.body);

    if (short_code) {
      const link = await getShortLink(short_code);

      if (link) {
        req.flash("error", "Short code already exists");
        return res.redirect("/");
      }
    }

    await createShortLink(long_url, short_code, req.user.id);

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const redirectToShortLink = async (req, res) => {
  try {
    const { short_code } = req.params;

    const link = await getShortLink(short_code);

    if (!link) {
      return res.status(404).send("Not found");
    }

    return res.redirect(link.long_url);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const getShortenerEditPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { short_code } = req.params;

    const link = await getShortLink(short_code);

    if (!link) {
      return res.status(404).send("Not found");
    }

    const error = req.flash("error");

    return res.render("edit-shortlink", {
      link,
      error,
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const postshortenerEditPage = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { short_code } = req.params;

    const { long_url, short_code: new_short_code } = shortenerSchema.parse(
      req.body
    );

    if (short_code !== new_short_code) {
      const link = await getShortLink(new_short_code);

      if (link) {
        req.flash("error", "Short code already exists");
        return res.redirect(`/edit/${short_code}`);
      }
    }

    await updateShortLink(short_code, {
      long_url,
      short_code: new_short_code,
    });

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};

export const deleteShortCode = async (req, res) => {
  try {
    if (!req.user) return res.redirect("/login");

    const { short_code } = req.params;

    await deleteShortLink(short_code);

    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal server error");
  }
};
