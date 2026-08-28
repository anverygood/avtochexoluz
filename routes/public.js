const express = require("express");
const router = express.Router();
const db = require("../lib/db");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Oddiy matnni ("bo'sh qator = yangi paragraf") HTML paragraflarga aylantiradi
function renderArticleContent(content) {
  if (!content) return "";
  return content
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

router.get("/", (req, res) => {
  const settings = db.readSettings();
  const cars = db.readAll("cars");
  const reviews = db.readAll("reviews");
  const blog = db.readAll("blog");
  const stories = db.readAll("stories");
  const beforeafter = db.readAll("beforeafter");
  const media = db.readAll("media");

  res.render("index", {
    settings,
    cars,
    reviews,
    blog,
    stories,
    beforeafter,
    media,
    siteDataJson: JSON.stringify({ settings, cars, reviews, blog, stories, beforeafter, media }),
  });
});

// ---------- BITTA MAQOLA SAHIFASI ----------
router.get("/blog/:id", (req, res) => {
  const settings = db.readSettings();
  const blog = db.readAll("blog");
  const post = blog.find((p) => p.id === Number(req.params.id));

  if (!post) {
    return res.redirect("/#blog");
  }

  // O'xshash maqolalar — bir xil kategoriyadagi, o'zidan boshqa 3 tasi
  const related = blog.filter((p) => p.id !== post.id && p.cat === post.cat).slice(0, 3);
  const others = related.length
    ? related
    : blog.filter((p) => p.id !== post.id).slice(0, 3);

  res.render("article", {
    settings,
    post,
    contentHtml: renderArticleContent(post.content),
    related: others,
  });
});

module.exports = router;