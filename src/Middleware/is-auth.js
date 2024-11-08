module.exports = (req, res, next) => {
    if(!req.session.isLoggedIn){
        return res.redirect('/auth/login?redirectUrl=https://doseal.org/login/redirect')
    }
    next();
}