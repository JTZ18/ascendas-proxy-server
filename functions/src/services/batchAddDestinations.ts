import { logger } from 'firebase-functions';
import { db } from '../config/firebase';
import { destinations_array } from '../data/destinations';

// Desc    takes in collectionName target collection to add data to, filepath to which the temp file was saved to and
//         adds contents of tmp file to firebase
const batchAddDestinations = async (
) => {
    const collectionName = 'destinations';
    // @ts-ignore
    const resultsArray = destinations_array
    resultsArray.forEach(async function(obj: any) {
        const doc = await db.collection(collectionName).doc(obj.uid).get();
        if (!doc.exists) {
            logger.log(`Writing ${obj.uid}`)
            await db.collection(collectionName)
            .doc(obj.uid)
            .set(obj)
            .then(function(docref) {
                logger.log(`Document written ${obj.uid}`);
            })
            .catch (function(error) {
                logger.error("error adding document: ", error);
            })
        }
        else {
            logger.log(`Document ${obj.uid} already exists`);
        }

    })
  logger.log(`Adding to collection ${collectionName}`);

};

export { batchAddDestinations };