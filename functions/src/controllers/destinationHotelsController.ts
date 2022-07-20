import { Response } from 'express';
import { db } from '../config/firebase';
const asyncHandler = require('express-async-handler')
import { logger } from 'firebase-functions';

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

// Desc    function will return a list of hotels related to destinationID
const getDestinationHotels = asyncHandler(async (req: Request, res: Response) => {
    // entryId will be a destinationID
    const { entryId } = req.params
    try {
        const doc = await db.collection('destination-hotels').doc(entryId).get()
        if (!doc.exists) {
            return res.status(404).json({ message: 'Destination has no hotels' })
        }
        const data = await doc.data()
        return res.status(200).json(data)
    } catch (error: any) {
        return res.status(500).json(error.message)
    }
})


const updateDestinationHotels = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params
    // @ts-ignore
    const data = req.body
    try {
        logger.log(`Attempting to update ${entryId}`)
        await db.collection('destination-hotels').doc(entryId).set(data).then((docref) => {
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

const deleteAllDestinationsHotels = asyncHandler(async (req: Request, res: Response) => {
    try {
        const querySnapshot = await db.collection('destination-hotels').get()
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

const deleteDestinationHotels = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params

    try {
        const entry = db.collection('destination-hotels').doc(entryId)
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


export { getDestinationHotels, updateDestinationHotels, deleteDestinationHotels, deleteAllDestinationsHotels }

