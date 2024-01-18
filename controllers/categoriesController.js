const { client } = require('../config/dbConnection')

const db = client.db('ITransitionPRJ');
const categoriesData = db.collection('categories');

const getCategories = async (req, res) => {
    try {
        await client.connect();

        const categories = collections = await categoriesData.find({}).toArray();

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {getCategories}