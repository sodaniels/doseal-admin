module.exports = (req, res, next) => {
  const admin = req.session.admin;

  if (!admin.permissions.includes("Help Desk")) {
    return res.redirect("/secure-admin");
  }

  next();
};
