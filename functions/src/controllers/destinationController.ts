import { Response } from 'express';
import { db } from '../config/firebase';
const asyncHandler = require('express-async-handler')
import { logger } from 'firebase-functions';
import { batchAddDestinations } from '../services/batchAddDestinations';

type EntryType = {
    file: any;
    data: any;
}

type Request = {
    headers: any;
    body: EntryType,
    params: {
        destinationID: string; 
        entryId: string 
}
}

const getDestinations = asyncHandler(async (req: Request, res: Response) => {
    try {
        const destinations: EntryType[] = []
        const querySnapshot = await db.collection('destinations').get()
        querySnapshot.forEach((doc: any) => {
            destinations.push(doc.data())
        })
        return res.status(200).json(destinations)
    } catch (error: any) {
        return res.status(500).json(error.message)
    }
})

const getDestination = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params
    try {
        const doc = await db.collection('destinations').doc(entryId).get()
        if (!doc.exists) {
            return res.status(404).json({ message: 'Destination not found' })
        }
        const data = await doc.data()
        return res.status(200).json(data)
    } catch (error: any) {
        return res.status(500).json(error.message)
    }
})

const updateDestinations = asyncHandler(async (req: Request, res: Response) => {
    
    try {
        const collectionName = req.params.entryId;
        console.log(collectionName)
        batchAddDestinations()
        //return res.status(200).json(data)
        logger.log('upload successful')
        return res.status(200).json({
            message: 'success'
        });
    } catch (error: any) {
        return res.status(500).json(error.message)        
    }
})

const updateDestination = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params
    logger.log(entryId)
    // @ts-ignore
    const data = req.body
    logger.log(data)
    try {
        logger.log(`Attempting to update ${entryId} with ${data}`)
        await db.collection('destinations').doc(entryId).set(data).then((docref) => {
            logger.log(`Document ${entryId} updated`);
        })
        .catch((error)=> {
            logger.error("error updating document: ", error);
        })

        return res.status(200).json({
            message: `successful update ${entryId}`
        });
    } catch (error: any) {
        return res.status(500).json(error.message)        
    }
})

const deleteAllDestinations = asyncHandler(async (req: Request, res: Response) => {
    try {
        const querySnapshot = await db.collection('destinations').get()
        querySnapshot.forEach(async(doc: any) => {
            await doc.delete()
        })

        return res.status(200).send({
            status: 'success',
            message: 'Deleted collection successfully',
        })
    } catch (error: any) {
        return res.status(500).json(error.message)        
    }
})

const deleteDestination = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params

    try {
        const entry = db.collection('destinations').doc(entryId)
        await entry.delete()

        return res.status(200).send({
            status: 'success',
            message: 'Deleted entry successfully',
            data: { 
                id: entryId,
                data: entry
            }
        })
    } catch (error: any) {
        return res.status(500).json(error.message)        
    }
})


export { getDestinations, getDestination, updateDestinations, updateDestination, deleteDestination, deleteAllDestinations }

