const { client } = require('../config/dbConnection')
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(401)
    const refreshToken = cookies.jwt

    await client.connect();

    const db = client.db('ITransitionPRJ');
    const usersCollection = db.collection('usersData');

    const foundUser = await usersCollection.findOne({ refreshToken });

    if(!foundUser) return res.sendStatus(403)
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
            if(err || foundUser.email !== decoded.email) return res.sendStatus(403); 
            const roles = Object.values(foundUser.roles)

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '30m'}
            );
            res.json({accessToken})
        }  
    )
}

module.exports = {handleRefreshToken}
