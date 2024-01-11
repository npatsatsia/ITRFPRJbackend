const { client } = require('../config/dbConnection')

const handleLogout = async (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204)

    const refreshToken = cookies.jwt

    await client.connect();

    const db = client.db('ITransitionPRJ');
    const usersCollection = db.collection('usersData');

    const foundUser = await usersCollection.findOne({ refreshToken });
    if(!foundUser) {
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
        return res.sendStatus(204)
    }
    const result = await usersCollection.updateOne(
        { refreshToken: refreshToken },
        { $set: { refreshToken: '' } }
    );

    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true}); 
    res.sendStatus(204)
}

module.exports = {handleLogout}