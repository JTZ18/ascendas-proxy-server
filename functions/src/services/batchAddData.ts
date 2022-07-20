//import { admin, db } from '../config/firebase'
import { unlinkSync } from 'fs';
import { logger } from 'firebase-functions';
import { db } from '../config/firebase';
const fs = require('fs');

// Desc    takes in collectionName target collection to add data to, filepath to which the temp file was saved to and
//         adds contents of tmp file to firebase
const batchAddData = async (
    collectionName: string,
    filePath: string,
) => {
  //const addresses = [] as string[];
    // @ts-ignore
    fs.readFile(filePath, 'utf8', async (error, data) => {
        if(error){
            logger.log(error);
            return;
        }
        const resultsArray = JSON.parse(data);
        resultsArray.forEach(async function(obj: any) {
            const doc = await db.collection(collectionName).doc(obj.id).get();
            if (!doc.exists) {
                logger.log(`Writing ${obj.id}`)
                db.collection(collectionName)
                .doc(obj.id)
                .set(obj)
                .then(function(docref) {
                    logger.log(`Document written ${obj.id}`);
                })
                .catch (function(error) {
                    logger.error("error adding document: ", error);
                })
            }
            else {
                logger.log(`Document ${obj.id} already exists`);
            }
        })
        // db.collection(collectionName).get().then(function(querySnapshot) {
        //     querySnapshot.forEach(function(doc) {
        //         doc.ref.update({
        //             capital: true
        //         });
        //     });
        // });

    })
//   createReadStream(filePath)
//       .pipe(json({ headers: true }))
//       .on('error', (error) => logger.error(error))
//       .on('data', (row) => {
//         Object.keys(row).forEach((qty) => {
//           if (row[qty] > 1) {
//             addresses.push(row[qty]);
//           }
//         });
//       })
//       .on('end', (rowCount: number) => logger.log(`Parsed ${rowCount} rows`));
  logger.log(`Adding to collection ${collectionName}`);
  //const doc = await db.collection(collectionName)
  //const doc = await db.doc(`/${collectionName}/`).get();
//   if (doc.exists) {
//     await db.doc(`/${collectionName}/`).update({
//       addresses: admin.firestore.FieldValue.arrayUnion(...addresses),
//     });
//   } else {
//     await db.doc(`/${collectionName}/`).set({
//       addresses,
//     });
//   }
  unlinkSync(filePath);
};

export { batchAddData };