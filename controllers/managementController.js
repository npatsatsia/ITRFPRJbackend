const { client } = require('../config/dbConnection')
const { ObjectId } = require('mongodb');




const db = client.db('ITransitionPRJ');
const usersCollection = db.collection('usersData');


const getAllUsers  = async (req, res) => {
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
        const userId = req.body.id;
        const user = await usersCollection.findOne({ id: userId });
        if(!user) {
            return res.status(400).json({"message": `user ID ${req.body.id} not found`})
        }
        if(user.active) {
            await usersCollection.updateOne(
                { id: userId },
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
        const userId = req.body.id;

        const user = await usersCollection.findOne({ id: userId });
        if(!user) {
            return res.status(400).json({"message": `user ID ${userId} not found`})
        }
        if(!user.active) {
            await usersCollection.updateOne(
                { id: userId },
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
        const userId = req.body.id;

        const user = await usersCollection.findOne({ id: userId });

        if (!user) {
            return res.status(400).json({ "message": `User ID ${id} not found` });
        }

        const role = user.role;
        const isAdmin = role === '5150';
        if (isAdmin) {
            return res.status(400).json({ "message": `${user.username} is already an admin` });
        }
        user.role = "5150";

        await usersCollection.updateOne({ id: userId }, { $set: { role: user.role } });

        res.json(`You have successfully added ${user.username} to the admin list`);
    } catch (error) {
        console.error('Error adding user to admins:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const removeFromAdmins = async (req, res) => {
    try {
        await client.connect();
        const userId = req.body.id;

        const user = await usersCollection.findOne({ id: userId });

        if (!user) {
            console.log("true")
            return res.status(400).json({ "message": `User ID ${id} not found` });
        }

        const role = user.role;
        const isNotAdmin = role === '2001';
        if (isNotAdmin) {
            return res.status(400).json({ "message": `${user.username} is already an admin` });
        }
        user.role = "2001"
        await usersCollection.updateOne({ id: userId }, { $set: { role: user.role } });

        res.json(`You have successfully removed ${user.username} from the admin list`);
    } catch (error) {
        console.error('Error removing user from admins:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const deleteUser = async (req, res) => {
    try {
        await client.connect();

        const userId = req.params.userId;
        const user = await usersCollection.findOne({ id: userId });

        if(!user) {
            return res.status(400).json({"message": `user ID ${userId} not found`})
        }
        const deletedUser = await usersCollection.findOneAndDelete({ id: userId });

        res.json(`You have successfully deleted user: ${user.username}`)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports = {getAllUsers, blockUser, unblockUser, addToAdmins, removeFromAdmins, deleteUser}