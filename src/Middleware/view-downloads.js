module.exports = (req, res, next) => {
  const admin = req.session.admin;

  if (!admin.permissions.includes("Downloads") && !admin.permissions.includes("Devices")) {
    return res.redirect("/secure-admin");
  }

  next();
};
