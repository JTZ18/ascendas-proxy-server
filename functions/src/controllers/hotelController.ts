import { Response } from 'express';
import { db } from '../config/firebase';
const asyncHandler = require('express-async-handler')
const bb = require('busboy');
const axios = require('axios');
const url = require("url");
import { logger } from 'firebase-functions';
import { createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { batchAddData } from '../services/batchAddData';
import { mergeData } from '../services/mergeData'


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

// @desc    get all hotel details for a destination
// @route   GET /hotels/:destinationID
// @access  Public
const getAllHotels = asyncHandler(async (req: Request, res: Response) => {
    const destinationID = req.params.destinationID
    const response = await axios.get(`https://hotelapi.loyalty.dev/api/hotels?destination_id=${destinationID}`)
    res.status(200).json(response.data)
})

// @desc    get all hotel generic prices for a destination
// @route   GET /hotels/prices
// @access  Public
const genericHotelPrices = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const destination_id = req.query.destination_id? req.query.destination_id : 'RsBU'

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    const date = yyyy + '-' + mm + '-' + dd;
    // @ts-ignore
    const checkin = req.query.checkin? req.query.checkin : date
    // @ts-ignore
    const checkout = req.query.checkout? req.query.checkout : date
    // @ts-ignore
    const lang = req.query.lang? req.query.lang : 'en_US'
    // @ts-ignore
    const currency = req.query.currency? req.query.currency : 'SGD'
    // @ts-ignore
    const country_code = req.query.country_code? req.query.country_code : 'SG'
    // @ts-ignore
    const guests = req.query.guests? req.query.guests : 2
    // @ts-ignore
    const partner_id = req.query.partner_id? req.query.partner_id : 1

    const queryParams = {
        destination_id,
        checkin,
        checkout,
        lang,
        currency,
        country_code,
        guests,
        partner_id
    };
    logger.log(queryParams)
    const params = new url.URLSearchParams(queryParams);
    const endpoint = `https://hotelapi.loyalty.dev/api/hotels/prices?${params}`
    logger.log(endpoint)
    let response = await axios.get(endpoint)
    logger.log(response.data)
    while (response.data.hotels.length === 0) {
        await new Promise(r => setTimeout(r, 500));
        response = await axios.get(endpoint)
        logger.log(response)
    }

    res.status(200).json(response.data)
})

// @desc    get specific hotel prices for a destination
// @route   GET /hotels/:hotelID/price
// @access  Public
const specificHotelPrice = asyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const hotelID = req.params.hotelID
    // @ts-ignore
    const destination_id = req.query.destination_id? req.query.destination_id : 'RsBU'

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    const date = yyyy + '-' + mm + '-' + dd;
    // @ts-ignore
    const checkin = req.query.checkin? req.query.checkin : date
    // @ts-ignore
    const checkout = req.query.checkout? req.query.checkout : date
    // @ts-ignore
    const lang = req.query.lang? req.query.lang : 'en_US'
    // @ts-ignore
    const currency = req.query.currency? req.query.currency : 'SGD'
    // @ts-ignore
    const country_code = req.query.country_code? req.query.country_code : 'SG'
    // @ts-ignore
    const guests = req.query.guests? req.query.guests : 2
    // @ts-ignore
    const partner_id = req.query.partner_id? req.query.partner_id : 1

    const queryParams = {
        destination_id,
        checkin,
        checkout,
        lang,
        currency,
        country_code,
        guests,
        partner_id
    };
    logger.log(queryParams)
    const params = new url.URLSearchParams(queryParams);
    const endpoint = `https://hotelapi.loyalty.dev/api/hotels/${hotelID}/price?${params}`
    logger.log(endpoint)
    let response = await axios.get(endpoint)
    logger.log(response.data)
    while (response.data.rooms.length === 0) {
        await new Promise(r => setTimeout(r, 500));
        response = await axios.get(endpoint)
        logger.log(response)
    }

    res.status(200).json(response.data)
})

const updateHotels = asyncHandler(async (req: Request, res: Response) => {
    //const { body: { data }, params: { entryId }} = req
    //const file = data.json()
    //console.log(entryId)

    try {
        const collectionName = req.params.entryId;
        console.log(collectionName)
        const busboy = bb({ headers: req.headers });
        const filepath = tmpdir() +`/${collectionName}.json`;
    
        const fileWrites = [] as Promise<unknown>[];
        
        // @ts-ignore
        busboy.on('file', (fieldname, file) => {
          const writeStream = createWriteStream(filepath);
          file.pipe(writeStream);
          const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
              writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
          });
          fileWrites.push(promise);
        });
        busboy.on('finish', async () => {
          await Promise.all(fileWrites);
          batchAddData(collectionName, filepath)
          console.log(filepath);
        });
        // @ts-ignore
        busboy.end(req.rawBody);
        res.send();
        //return res.status(200).json(data)
        return res.status(200)
    } catch (error: any) {
        return res.status(500).json(error.message)        
    }
})

const deleteHotel = asyncHandler(async (req: Request, res: Response) => {
    const { entryId } = req.params

    try {
        const entry = db.collection('entries').doc(entryId)
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


const getHotelsPrices = asyncHandler(async (req: Request, res: Response) => {
    try {
        // query main ascendas api for list of hotels by destinationID input
        // iterate through list of hotels returned and add them to firebase collection hotels
        // simultaneously for each hotel id, send out a query to main ascendas pricing api then add the returned price to hotels collection doc id
        console.time('main')
        //const resData = new Map();
        const destinationID = req.params.destinationID;
        logger.log('hi')
        const mainRes = await axios.get(`https://ascendahotels.mocklab.io/api/destinations/${destinationID}/prices`)
        const hotelList = mainRes.data.hotels
        logger.log(typeof(hotelList))
        await hotelList.forEach(async (obj:any) => {
            await db.collection('hotels').doc(obj.id).set(obj).then(() => {
                logger.log(`Document written hotel ID: ${obj.id}`);
            })
        })
        logger.log('====================START SECOND STEP====================')
        // const endpoints = [
        //     `https://ascendahotels.mocklab.io/api/hotels/${destinationID}/prices/wgl`,
        //     `https://ascendahotels.mocklab.io/api/hotels/${destinationID}/prices/bedscom`,
        //     `https://ascendahotels.mocklab.io/api/hotels/${destinationID}/prices/ean`,
        //   ];
        // console.time('Processing async')
        // await axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then((allResponses: any) => {
        //     allResponses.forEach((response: any) => {
        //     //logger.log(response.data);
        //     logger.log('test')
        //     resData.set(response.config.url, response.data);
        //     console.log(resData)
        //     logger.log('test')
            
        // });
        // });
        // console.timeEnd('Processing async')
        console.time('main_pricing')
        await axios.get(`https://hotelapi.loyalty.dev/api/hotels?destination_id=${destinationID}`)
        .then(asyncHandler(async function (response: any) {
            //console.log(response);
            // call merge data
            await mergeData('hotels', response.data)
            logger.log('merge completed')

            console.timeEnd('main_pricing')
        }));


        //return json array of hotels
        const allHotels: EntryType[] = []
        const querySnapshot = await db.collection('hotels').get()
        querySnapshot.forEach((doc: any) => {
            allHotels.push(doc.data())
            logger.log(`push ${doc.data().id} to allHotels`)
        })
        console.timeEnd('main')
        return res.status(200).json({
            hotels: allHotels
        })

        
        
        // console.time('wgl')
        // axios.get(`https://ascendahotels.mocklab.io/api/hotels/${destinationID}/prices/wgl`)
        // .then(function (response: any) {
        //     //console.log(response);
        //     console.timeEnd('wgl')
        // });

        // console.time('bedscom')
        // axios.get(`https://ascendahotels.mocklab.io/api/hotels/${destinationID}/prices/bedscom`)
        // .then(function (response: any) {
        //     //console.log(response);
        //     console.timeEnd('bedscom')
        // });

        // console.time('ean')
        // axios.get(`https://ascendahotels.mocklab.io/api/hotels/${destinationID}/prices/ean`)
        // .then(function (response: any) {
        //     //console.log(response);
        //     console.timeEnd('ean')
        // });

        //res.status(200).json(resData)
    } catch (error: any) {
        return res.status(500).json(error.message)
    }
})

export { getAllHotels, updateHotels, deleteHotel, getHotelsPrices, genericHotelPrices, specificHotelPrice }

