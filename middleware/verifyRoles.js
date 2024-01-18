const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req?.role) return res.sendStatus(401);
        const rolesArray = [...allowedRoles];
        const result = req.role.find(role => rolesArray.includes(role))
        // ak shevamocmot kdiev es logika
        if(!result) return res.sendStatus(401);
        next()
    }
}

module.exports = verifyRoles