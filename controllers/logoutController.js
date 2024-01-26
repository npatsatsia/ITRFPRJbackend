const { client } = require('../config/dbConnection')

const handleLogout = async (req, res) => {
    // const cookies = req.cookies
    const cookies = localStorage.getItem('jwt')

    if(!cookies) return res.sendStatus(204)

    const refreshToken = cookies

    await client.connect();

    const db = client.db('ITransitionPRJ');
    const usersCollection = db.collection('usersData');

    const foundUser = await usersCollection.findOne({ refreshToken });
    if(!foundUser) {
        res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
        localStorage.removeItem('jwt')
        return res.sendStatus(204)
    }
    const result = await usersCollection.updateOne(
        { refreshToken: refreshToken },
        { $set: { refreshToken: '' } }
    );

    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true});
    res.clearCookie('connect.sid');
    localStorage.removeItem('jwt')

    req.session.destroy()

    res.sendStatus(204)
}

module.exports = {handleLogout}