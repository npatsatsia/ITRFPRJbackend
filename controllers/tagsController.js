const { client } = require('../config/dbConnection')

const db = client.db('ITransitionPRJ');
const tagsCollection = db.collection('tags');

const handleSearchTag = async (req, res) => {
    try {
        await client.connect();
        
        const tags = await tagsCollection.find({ tag: { $regex: new RegExp(req.params.name, 'i') } }).toArray();

        res.json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const handleAddTag = async (req, res) => {
    try {
        await client.connect();
        let tag = ''

        const tagExists = await tagsCollection.findOne({tag: req.body.tag})

        if(!tagExists) {
            tag = await tagsCollection.insertOne({ tag: req.body.tag, _id: req.body.tag + 23542112 })
        }
        
        res.json(tag);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {handleSearchTag, handleAddTag}