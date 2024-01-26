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

        const requestedById = requestedBy.userId


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


const allowedToManage = async (req, res) => {
    try {
        await client.connect();
        let allowed = false

        const requestedBy = await usersCollection.findOne({ email: req.email });
        const collectionOwner = collectionsData.findOne({id: req.body.id})

        if(collectionOwner || requestedBy.role.includes("5150")) {
            allowed = true
        }

        res.json(allowed);
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const createCollection = async (req, res) => {
    const {name, ownerId} = req.body

    try {
        await client.connect();

        const id = uuidv4();
        const collections = await collectionsData.find({}).toArray()
        const duplicateCollection = collections.find(collection => collection.ownerId === ownerId && collection.name.toLowerCase() === name.toLowerCase())

        const requestedBy = await usersCollection.findOne({email: req.email})
        const requestedId = requestedBy.userId

        if(duplicateCollection){
            return res.status(403).json({"message": `You already own a collection by name ${name}`})
        }

        const result = await collectionsData.insertOne({...req.body, id, ownerId: requestedId})
        res.json({...result, id, ownerId: requestedId});
    } catch (error) {
        console.error('Error Adding Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const editCollectionn = async (req, res) => {
    try {
        await client.connect();

        const collection = await collectionsData.findOne({ id: req.body.id });
        const requestOwner = await usersCollection.findOne({ email: req.email }); // This may not be a good idea, but it is simple

        if(collection.ownerId !== requestOwner.userId || !requestOwner.role.includes("5150")){
            return res.status(403).json({"message": `You can not delete a collection by id ${req.body.id}`})
        }
        
        const result = await collectionsData.updateOne(

        );
        res.json(result);
    } catch (error) {
        console.error('Error While Editing Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
const editCollection = async (req, res) => {
    try {
        await client.connect();

        const existingCollection = await collectionsData.findOne({ id: req.body.id });
        if (!existingCollection) {
            return res.status(404).json({ "message": `Collection with id ${req.body.id} not found` });
        }

        const requestOwner = await usersCollection.findOne({ email: req.email });

        if (existingCollection.ownerId !== requestOwner.userId || !requestOwner.role.includes("5150")) {
            return res.status(403).json({ "message": `You can not edit a collection with id ${req.body.id}` });
        }

        // Create a modified document with the desired updates (excluding _id and ownerId)
        const modifiedDocument = {
            ...existingCollection,  
            ...req.body,
            _id: existingCollection._id,
            ownerId: existingCollection.ownerId
        };

        // Perform the update using the modified document
        const result = await collectionsData.replaceOne(
            { id: req.body.id },
            modifiedDocument
        );

        res.json(result);
    } catch (error) {
        console.error('Error While Editing Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const deleteCollection = async (req, res) => {
    try {
        await client.connect();

        const id = req.params.id;
        
        const collection = await collectionsData.findOne({ id });
        const requestOwner = await usersCollection.findOne({ email: req.email }); // This may not be a good idea, but it is simple
        const userRole = requestOwner.role;

        console.log(userRole, requestOwner.userId, collection)

        if(collection && collection.ownerId !== requestOwner.userId && userRole.includes("5150") ){
            return res.status(403).json({"message": `You can not delete a collection by id ${req.params.id}`})
        }

        if(!collection){
            return res.status(400).json({"message": `Collection ID is ${req.params.id}`})
        }
        await collectionsData.deleteOne(collection)

        res.json("successfully Deleted");
    } catch (error) {
        console.error('Error Deleteing Collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

  module.exports = {getAllCollections, getPrivateCollections, allowedToManage, createCollection, editCollection, deleteCollection}


  
  