const { client } = require('../config/dbConnection')

const db = client.db('ITransitionPRJ');
const collectionsData = db.collection('collections');

function groupByType(object, type) {
    const result = {};
  
    for (const key in object) {
      const [propertyType, propertyNumber, propertyAttribute] = key.split('_');
      if ((propertyType + "_" + propertyNumber).includes(type)) {
        if (!result[propertyNumber]) {
          result[propertyNumber] = {};
        }
        const newKey = key; // Use the original key as the new key
        result[propertyNumber][newKey] = object[key];
      }
    }
  
    return result;
}

const getCollectionPage = async (req, res) => {
    try {
        await client.connect();

        let collection = {};
        let sortedCustomFields = {}

        if (req.params) {
            collection = await collectionsData.findOne({id: req.params.id})
            const checkboxArray = Object.values(groupByType(collection?.customFields, "custom_checkbox"));
            const dateArray = Object.values(groupByType(collection?.customFields, "custom_date"));
            const integerArray = Object.values(groupByType(collection?.customFields, "custom_integer"));
            const stringArray = Object.values(groupByType(collection?.customFields, "custom_string"));
          
            sortedCustomFields = { checkboxArray, dateArray, integerArray, stringArray }
        }else {
            res.status(404).json({ error: `Collection ID: ${req.params} Not Found` });
        }

        res.json({collection, sortedCustomFields});
    } catch (error) {
        console.error('Error fetching collection:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports= {getCollectionPage}