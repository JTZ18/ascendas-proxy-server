import { db } from '../config/firebase'
import { logger } from 'firebase-functions';

// Desc    takes in collectionName target collection to add data to
//         and a json array of data to add to the collection
//         merges current firebase data with data input
const mergeData = async (
    collectionName: string,
    data: Array<JSON>
) => {
    const resultsArray = data;
    resultsArray.map(async function(obj: any) {
        const doc = await db.collection(collectionName).doc(obj.id).get();
        if (doc.exists) {
            logger.log(`Writing ${obj.id}`)
            db.collection(collectionName)
            .doc(obj.id)
            .update(obj)
            .then(function(docref) {
                logger.log(`Document written ${obj.id}`);
            })
            .catch (function(error) {
                logger.error("error updating document: ", error);
            })
        }
        else {
            logger.log(`no match found for obj id: ${obj.id}`);
        }
    })
}

export { mergeData };