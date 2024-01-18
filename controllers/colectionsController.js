const { client } = require('../config/dbConnection')
const { v4: uuidv4 } = require('uuid');

const db = client.db('ITransitionPRJ');
const collectionsData = db.collection('collections');
const usersCollection = db.collection('usersData');

// ამ ლოგიკაში ადმინს აზრი ეკარგება
const getAllCollections = async (req, res) => {
    try {
        await client.connect();

        let collections = [];
        const requestedBy = await usersCollection.findOne({ email: req.email });


        if (requestedBy.role.includes("5150")) {
            collections = await collectionsData.find({}).toArray();
        } 

        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getPrivateCollections = async (req, res) => {
    try {
        await client.connect();

        let collections = [];
        const requestedBy = await usersCollection.findOne({ email: req.email });

        const requestedById = requestedBy.id


        if (requestedBy.role.includes("2001")) {
            const collectionsArr = await collectionsData.find({}).toArray();
            collections = collectionsArr.filter(collection => collection.ownerId == requestedById)
        }

        res.json(collections);
    } catch (error) {
        console.error('Error fetching collections:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const createCollection = async (req, res) => {
    const {name, description, categoryId, image, ownerId, customFields} = req.body

    try {
        await client.connect();

        const id = uuidv4();
        const collections = await collectionsData.find({}).toArray()
        const duplicateCollection = collections.find(collection => collection.ownerId === ownerId && collection.name.toLowerCase() === name.toLowerCase())

        const requestedBy = usersCollection.findOne({email: req.email})
        const requestedId = requestedBy.userId

        if(duplicateCollection){
            return res.status(403).json({"message": `You already own a collection by name ${name}`})
        }

        const result = await collectionsData.insertOne({
            ownerId: requestedId,
            id,
            name,
            description,
            categoryId,
            image,
            customFields
          })
        res.json(result);
    } catch (error) {
        console.error('Error Adding Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const editCollection = async (req, res) => {
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

const deleteCollection = async (req, res) => {
    try {
        await client.connect();

        const id = req.body.id;
        
        const collection = await collectionsData.findOne({ id });
        const requestOwner = await usersCollection.findOne({ email: req.email }); // This may not be a good idea, but it is simple
        const userRole = requestOwner.role;

        if(collection && collection.ownerId !== requestOwner.id && userRole !== '5150' ){
            return res.status(403).json({"message": `You can not delete a collection by id ${req.body.id}`})
        }

        if(!collection){
            return res.status(400).json({"message": `Collection ID is ${req.body.id}`})
        }
        await collectionsData.deleteOne(collection)

        res.json("successfully Deleted");
    } catch (error) {
        console.error('Error Deleteing Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

  module.exports = {getAllCollections, getPrivateCollections, createCollection, editCollection, deleteCollection}


  
  