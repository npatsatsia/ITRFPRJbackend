const { client } = require('../config/dbConnection')
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    // const cookies = await req.cookies
    const cookies = localStorage.getItem('jwt')

    if(!cookies) return res.sendStatus(401)
    // const refreshToken = cookies.jwt
    const refreshToken = cookies

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
            const role = foundUser.role
            
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "role": role
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '15m'}
            );
            res.json({role, accessToken, username: foundUser.username})
        }  
    )
}

module.exports = {handleRefreshToken}
