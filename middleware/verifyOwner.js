// const { client } = require('../config/dbConnection')

// const db = client.db('ITransitionPRJ');
// const usersCollection = db.collection('usersData');



// const verifyRoles = (...allowedRoles) => {
//     return async (req, res, next) => {
//         const allowedUser = await usersCollection.findOne({ email: req.body.email });

//         if(!req?.roles) return res.sendStatus(401);
//         const rolesArray = [...allowedRoles];
//         const result = req.roles.map(role => rolesArray.includes(role)).find(val => val === true)
//         if(!result) return res.sendStatus(401);
//         next()
//     }
// }

// module.exports = verifyRoles