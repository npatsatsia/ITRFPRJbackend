const { client } = require('../config/dbConnection')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const handleAuth = async (req, res) => {
    const {email, password} = req.body
    if(!email || !password) {
        return res.status(400).json({"message": "username and password are required"})
    }
        await client.connect();

        const db = client.db('ITransitionPRJ');
        const usersCollection = db.collection('usersData');

        const foundUser = await usersCollection.findOne({ email: email });
        if(!foundUser) {
            return res.status(401).json({'message': 'unauthorized'})
        }
        const match = await bcrypt.compare(password, foundUser.password)
        if (match) {
            const roles = Object.values(foundUser.roles).filter(Boolean);
            // create JWTs
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": foundUser.email,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30m' }
            );
            const refreshToken = jwt.sign(
                { "email": foundUser.email },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
            await usersCollection.updateOne(
                { email: email },
                { $set: { refreshToken: refreshToken } }
            );
    
            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', maxAge: 24 * 60 * 60 * 1000 }); // maybe we need this:  secure: true,
    
            res.json({ roles, accessToken });
    
        } else {
            res.sendStatus(401);
        }
}

module.exports = {handleAuth}