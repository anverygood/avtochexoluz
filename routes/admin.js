const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const db = require("../lib/db");
const { requireLogin } = require("../middleware/auth");
const { makeUploader } = require("../lib/upload");

const uploadCar = makeUploader("cars");
const uploadBlog = makeUploader("blog");
const uploadStory = makeUploader("stories");
const uploadBA = makeUploader("beforeafter");
const uploadMedia = makeUploader("media", [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".webm", ".mov"]);
const uploadFabric = makeUploader("fabrics", [".jpg", ".jpeg", ".png", ".webp"]);

// Parolni bir marta bcrypt bilan xeshlab olamiz (server ishga tushganda)
let adminPasswordHash = null;
function getAdminPasswordHash() {
  if (!adminPasswordHash) {
    adminPasswordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10);
  }
  return adminPasswordHash;
}

// ---------- LOGIN / LOGOUT ----------
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  const validUser = username === (process.env.ADMIN_USER || "admin");
  const validPass = bcrypt.compareSync(password || "", getAdminPasswordHash());

  if (validUser && validPass) {
    req.session.loggedIn = true;
    return res.redirect("/admin");
  }
  res.render("admin/login", { error: "Login yoki parol noto'g'ri." });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

// Bundan pastdagi barcha marshrutlar himoyalangan
router.use(requireLogin);

// ---------- DASHBOARD ----------
router.get("/", (req, res) => {
  res.render("admin/dashboard", {
    tab: req.query.tab || "sozlamalar",
    saved: req.query.saved || null,
    settings: db.readSettings(),
    cars: db.readAll("cars"),
    reviews: db.readAll("reviews"),
    blog: db.readAll("blog"),
    stories: db.readAll("stories"),
    beforeafter: db.readAll("beforeafter"),
    media: db.readAll("media"),
  });
});






// ---------- MATOLAR (3D konfigurator uchun) ----------
router.post("/fabrics/add", uploadFabric.single("swatchImage"), (req, res) => {
  const { name, mainColor, accentColor } = req.body;
  if (name && name.trim()) {
    db.insert("fabrics", {
      name: name.trim(),
      mainColor: mainColor || "#333333",
      accentColor: accentColor || "#111111",
      swatchImage: req.file ? `/uploads/fabrics/${req.file.filename}` : "",
    });
  }
  res.redirect("/admin?tab=matolar&saved=1");
});

router.post("/fabrics/:id/update", uploadFabric.single("swatchImage"), (req, res) => {
  const { name, mainColor, accentColor } = req.body;
  const changes = { name, mainColor, accentColor };
  if (req.file) {
    changes.swatchImage = `/uploads/fabrics/${req.file.filename}`;
  }
  db.update("fabrics", req.params.id, changes);
  res.redirect("/admin?tab=matolar&saved=1");
});

router.post("/fabrics/:id/delete", (req, res) => {
  db.remove("fabrics", req.params.id);
  res.redirect("/admin?tab=matolar&saved=1");
});




// ---------- SOZLAMALAR (settings) ----------
router.post("/settings", (req, res) => {
  const current = db.readSettings();
  const updated = { ...current, ...req.body };
  db.writeSettings(updated);
  res.redirect("/admin?tab=sozlamalar&saved=1");
});

// ---------- AVTOMOBILLAR (cars — ro'yxat va qo'shish/o'chirish) ----------
router.post("/cars/add", uploadCar.single("image"), (req, res) => {
  const { name } = req.body;
  if (name && name.trim()) {
    const image = req.file
      ? `/uploads/cars/${req.file.filename}`
      : `https://placehold.co/900x420/1B2429/DE9F35?text=${encodeURIComponent(name.trim())}&font=oswald`;
    db.insert("cars", { name: name.trim(), image, services: [] });
  }
  res.redirect("/admin?tab=avtomobillar&saved=1");
});

router.post("/cars/:id/update", uploadCar.single("image"), (req, res) => {
  const changes = { name: req.body.name };
  if (req.file) {
    changes.image = `/uploads/cars/${req.file.filename}`;
  }
  db.update("cars", req.params.id, changes);
  res.redirect("/admin?tab=avtomobillar&saved=1");
});

router.post("/cars/:id/delete", (req, res) => {
  db.remove("cars", req.params.id);
  res.redirect("/admin?tab=avtomobillar&saved=1");
});

// ---------- BITTA AVTOMOBIL SAHIFASI (o'sha mashinaning narxlari) ----------
router.get("/cars/:id", (req, res) => {
  const car = db.getCar(req.params.id);
  if (!car) return res.redirect("/admin?tab=avtomobillar");
  res.render("admin/car-detail", { car, saved: req.query.saved || null });
});

router.post("/cars/:id/services/add", (req, res) => {
  const { name, desc, price } = req.body;
  if (name && name.trim()) {
    db.addCarService(req.params.id, {
      name: name.trim(),
      desc: (desc || "").trim(),
      price: Number(price) || 0,
    });
  }
  res.redirect(`/admin/cars/${req.params.id}?saved=1`);
});

router.post("/cars/:id/services/:serviceId/update", (req, res) => {
  const { name, desc, price } = req.body;
  db.updateCarService(req.params.id, req.params.serviceId, {
    name,
    desc,
    price: Number(price) || 0,
  });
  res.redirect(`/admin/cars/${req.params.id}?saved=1`);
});

router.post("/cars/:id/services/:serviceId/delete", (req, res) => {
  db.removeCarService(req.params.id, req.params.serviceId);
  res.redirect(`/admin/cars/${req.params.id}?saved=1`);
});

// ---------- KUNLIK ISHLAR (IG-story uslubidagi tasmasi) ----------
router.post("/stories/add", uploadStory.single("image"), (req, res) => {
  const { label } = req.body;
  if (req.file && label && label.trim()) {
    db.insert("stories", {
      label: label.trim(),
      date: new Date().toISOString().slice(0, 10),
      image: `/uploads/stories/${req.file.filename}`,
    });
  }
  res.redirect("/admin?tab=kunlik&saved=1");
});

router.post("/stories/:id/delete", (req, res) => {
  db.remove("stories", req.params.id);
  res.redirect("/admin?tab=kunlik&saved=1");
});

// ---------- OLDIN / KEYIN ----------
router.post(
  "/beforeafter/add",
  uploadBA.fields([{ name: "beforeImage", maxCount: 1 }, { name: "afterImage", maxCount: 1 }]),
  (req, res) => {
    const { label } = req.body;
    const beforeFile = req.files && req.files.beforeImage ? req.files.beforeImage[0] : null;
    const afterFile = req.files && req.files.afterImage ? req.files.afterImage[0] : null;
    if (label && label.trim() && beforeFile && afterFile) {
      db.insert("beforeafter", {
        label: label.trim(),
        beforeImage: `/uploads/beforeafter/${beforeFile.filename}`,
        afterImage: `/uploads/beforeafter/${afterFile.filename}`,
      });
    }
    res.redirect("/admin?tab=oldinkeyin&saved=1");
  }
);

router.post("/beforeafter/:id/delete", (req, res) => {
  db.remove("beforeafter", req.params.id);
  res.redirect("/admin?tab=oldinkeyin&saved=1");
});

// ---------- MEDIA (video / rasm galereyasi) ----------
router.post("/media/add", uploadMedia.single("file"), (req, res) => {
  const { type, caption, externalUrl } = req.body;
  let src = null;
  if (req.file) {
    src = `/uploads/media/${req.file.filename}`;
  } else if (externalUrl && externalUrl.trim()) {
    src = externalUrl.trim();
  }
  if (src) {
    db.insert("media", {
      type: type === "video" ? "video" : "photo",
      src,
      caption: (caption || "").trim(),
    });
  }
  res.redirect("/admin?tab=media&saved=1");
});

router.post("/media/:id/delete", (req, res) => {
  db.remove("media", req.params.id);
  res.redirect("/admin?tab=media&saved=1");
});

// ---------- IZOHLAR (reviews) ----------
router.post("/reviews/add", (req, res) => {
  const { name, tag, stars, text } = req.body;
  if (name && name.trim()) {
    db.insert("reviews", {
      name: name.trim(),
      tag: (tag || "").trim(),
      stars: Number(stars) || 5,
      text: (text || "").trim(),
    });
  }
  res.redirect("/admin?tab=izohlar&saved=1");
});

router.post("/reviews/:id/delete", (req, res) => {
  db.remove("reviews", req.params.id);
  res.redirect("/admin?tab=izohlar&saved=1");
});



// ---------- BLOG ----------
router.post("/blog/add", uploadBlog.single("image"), (req, res) => {
  const { cat, title, excerpt, content } = req.body;
  if (title && title.trim()) {
    db.insert("blog", {
      cat: (cat || "").trim(),
      title: title.trim(),
      excerpt: (excerpt || "").trim(),
      content: (content || "").trim(),
      image: req.file ? `/uploads/blog/${req.file.filename}` : "",
    });
  }
  res.redirect("/admin?tab=blog&saved=1");
});

router.get("/blog/:id", (req, res) => {
  const blog = db.readAll("blog");
  const post = blog.find((p) => p.id === Number(req.params.id));
  if (!post) return res.redirect("/admin?tab=blog");
  res.render("admin/blog-edit", { post, saved: req.query.saved || null });
});

router.post("/blog/:id/update", uploadBlog.single("image"), (req, res) => {
  const { cat, title, excerpt, content } = req.body;
  const changes = {
    cat: (cat || "").trim(),
    title: (title || "").trim(),
    excerpt: (excerpt || "").trim(),
    content: (content || "").trim(),
  };
  if (req.file) {
    changes.image = `/uploads/blog/${req.file.filename}`;
  }
  db.update("blog", req.params.id, changes);
  res.redirect(`/admin/blog/${req.params.id}?saved=1`);
});

router.post("/blog/:id/delete", (req, res) => {
  db.remove("blog", req.params.id);
  res.redirect("/admin?tab=blog&saved=1");
});

module.exports = router;
