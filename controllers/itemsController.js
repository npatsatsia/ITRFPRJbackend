const { client } = require('../config/dbConnection')

const db = client.db('ITransitionPRJ');
const collectionsData = db.collection('collections');
const usersCollection = db.collection('usersData');
const itemsCollection = db.collection('items');

// ამ ლოგიკაში ადმინს აზრი ეკარგება
const getAllItems = async (req, res) => {
    try {
        await client.connect();
        
        const items = await itemsCollection.findOne({id: req.body.id}).find({}).toArray();
        res.json(items);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addItem = async (req, res) => {
    const {name, description, topic, image, fields, ownerId} = req.body
    try {
        await client.connect();

        const collections = await collectionsData.find({}).toArray()
        const duplicateCollection = collections.find(collection => collection.ownerId === ownerId && collection.name.toLowerCase() === name.toLowerCase())

        if(duplicateCollection){
            return res.status(403).json({"message": `You already own a collection by name ${name}`})
        }
        
        const result = await collectionsData.insertOne({
            ownerId,
            name,
            description,
            topic,
            image,
            "fields": {
              "fixed": ["id", "name", "tags"],
              "custom": [
                {"type": "integer", "name": "CustomInt1"},
                {"type": "integer", "name": "CustomInt2"}
              ]
            }
          })
        res.json(result);
    } catch (error) {
        console.error('Error Adding Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const editItem = async (req, res) => {
    try {
        await client.connect();

        const collection = await collectionsData.findOne({ id: req.body.id });
        const requestOwner = await usersCollection.findOne({ email: req.email }); // This may not be a good idea, but it is simple

        if(collection.ownerId !== requestOwner.userId ){
            return res.status(403).json({"message": `You can not delete a collection by id ${req.body.id}`})
        }
        
        const result = await collectionsData.updateOne({
            name,
            description,
            topic,
            image,
            "fields": {
              "fixed": ["id", "name", "tags"],
              "custom": [
                {"type": "integer", "name": "CustomInt1"},
                {"type": "integer", "name": "CustomInt2"}
              ]
            }
          })
        res.json(result);
    } catch (error) {
        console.error('Error While Editing Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteItem = async (req, res) => {
    try {
        await client.connect();
        
        const collection = await collectionsData.findOne({ id: req.body.id });
        const requestOwner = await usersCollection.findOne({ email: req.email }); // This may not be a good idea, but it is simple
        const userRole = requestOwner.role;

        if(collection && collection.ownerId !== requestOwner.userId && !userRole !== "5150"){
            return res.status(403).json({"message": `You can not delete a collection by id ${req.body.id}`})
        }

        if(!collection){
            return res.status(400).json({"message": `Collection ID ${req.body.id} not found`})
        }
        await collectionsData.deleteOne(collection)

        res.json("successfully Deleted");
    } catch (error) {
        console.error('Error Deleteing Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

  module.exports = {getAllItems, addItem, editItem, deleteItem}


  
  