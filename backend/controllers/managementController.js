const { client } = require('../config/dbConnection')

const db = client.db('ITransitionPRJ');
const usersCollection = db.collection('usersData');


const getAllUsers = async (req, res) => {
    try {
        await client.connect();
        
        const users = await usersCollection.find({}).toArray();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const blockUser = async (req, res) => {
    try {
        await client.connect();
        const user = await usersCollection.findOne({ userId: req.body.userId });
        if(!user) {
            return res.status(400).json({"message": `user ID ${req.body.userId} not found`})
        }
        if(user.active) {
            await usersCollection.updateOne(
                { userId: req.body.userId },
                { $set: { active: false } }
            );
        }
        res.json('successfully blocked')
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const unblockUser = async (req, res) => {
    try {
        await client.connect();
        const user = await usersCollection.findOne({ userId: req.body.userId });
        if(!user) {
            return res.status(400).json({"message": `user ID ${req.body.userId} not found`})
        }
        if(!user.active) {
            await usersCollection.updateOne(
                { userId: req.body.userId },
                { $set: { active: true } }
            );
        }
        res.json('successfully unblocked')
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


const addToAdmins = async (req, res) => {
    try {
        await client.connect();

        const user = await usersCollection.findOne({ userId: req.body.userId });

        if (!user) {
            return res.status(400).json({ "message": `User ID ${req.body.userId} not found` });
        }

        const roles = Object.values(user.roles);
        const isAdmin = roles.includes("ADMIN");
        if (isAdmin) {
            return res.status(400).json({ "message": `${user.username} is already an admin` });
        }
        user.roles.ADMIN = "5150";

        await usersCollection.updateOne({ userId: req.body.userId }, { $set: { roles: user.roles } });

        res.json(`You have successfully added ${user.username} to the admin list`);
    } catch (error) {
        console.error('Error adding user to admins:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const removeFromAdmins = async (req, res) => {
    try {
        await client.connect();

        const user = await usersCollection.findOne({ userId: req.body.userId });

        if (!user) {
            return res.status(400).json({ "message": `User ID ${req.body.userId} not found` });
        }

        const roles = Object.values(user.roles);
        const isAdmin = roles.includes("ADMIN");
        if (isAdmin) {
            return res.status(400).json({ "message": `${user.username} is already an admin` });
        }
        user.roles = {"USER": "2001"} 
        await usersCollection.updateOne({ userId: req.body.userId }, { $set: { roles: user.roles } });

        res.json(`You have successfully removed ${user.username} from the admin list`);
    } catch (error) {
        console.error('Error removing user from admins:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteUser = async (req, res) => {
    try {
        await client.connect();
        const user = await usersCollection.findOne({ userId: req.body.userId });
        if(!user) {
            return res.status(400).json({"message": `user ID ${req.body.userId} not found`})
        }
        await usersCollection.deleteOne(user)
        res.json(`You have successfully deleted user: ${user.username}`)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = {getAllUsers, blockUser, unblockUser, addToAdmins, removeFromAdmins, deleteUser}