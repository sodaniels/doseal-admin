module.exports = (req, res, next) => {
  const admin = req.session.admin;

  if (!admin.permissions.includes("Dashboard")) {
    return res.redirect("/secure-admin");
  }

  next();
};
