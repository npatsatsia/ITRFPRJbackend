const io = require('../server')

const { client } = require('../config/dbConnection')

const db = client.db('ITransitionPRJ');
const commentsCollection = db.collection('comments');
const ItemsCollection = db.collection('items');

const handleGetComments = async (req, res) => {
    try {
        await client.connect();
        
        const itemComments  = await commentsCollection.findOne({ itemId: req.params.itemId})
        if(!itemComments) {
             return res.status(404).json({ error: 'No Comments On This Item' });
        }

        res.json(itemComments.commentsData);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const handlePutComment = async (req, res) => {
    try {
        await client.connect();

        const itemHasComments = await commentsCollection.findOne({itemId: req.params.itemId})

        if(itemHasComments) {
            await commentsCollection.updateOne(
                { itemId: req.params.itemId },
                { $set: { commentsData: [...itemHasComments.commentsData, {author: req.email, comment: req.body.commentText}] } }
            )
        }else {
            const commentsData = { author: req.email, comment: req.body.commentText };
            await commentsCollection.insertOne({itemId: req.params.itemId, commentsData: [commentsData]});
        }

        io.emit('comment', {comment: req.body.commentText, author: req.email}); // Emit the comment to all connected clients

        res.json({ author: req.email, comment: req.body.commentText, itemId: req.params.itemId });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const handleDeleteComment = async (req, res) => {
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

module.exports = {handleGetComments, handlePutComment, handleDeleteComment}