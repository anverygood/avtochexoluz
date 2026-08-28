// Admin panelning himoyalangan sahifalarini tekshiradigan middleware.
// Foydalanuvchi tizimga kirmagan bo'lsa, /admin/login sahifasiga yo'naltiradi.

function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  return res.redirect("/admin/login");
}

module.exports = { requireLogin };
