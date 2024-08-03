module.exports = (req, res, next) => {
    if(req.session.user.role !== 'Super Admin'){
        return res.redirect('/login')
    }
    next();
}