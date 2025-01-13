module.exports = (req, res, next) => {
  const admin = req.session.admin;

  if (!admin.permissions.includes("Notifications")) {
    return res.redirect("/secure-admin");
  }

  next();
};
