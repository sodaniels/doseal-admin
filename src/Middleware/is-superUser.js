module.exports = (req, res, next) => {
    if(req.session.user.role !== 'Super-Admin'){
        return res.redirect('/auth/login?redirectUrl=https://doseal.org/login/redirect')
    }
    next();
}