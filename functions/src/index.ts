import * as functions from "firebase-functions";
import * as express from 'express';
import { addEntry, getAllEntries, updateEntry, deleteEntry } from './controllers/entryController';
import { getAllHotels, genericHotelPrices, specificHotelPrice } from './controllers/hotelController';
import { getDestinations, getDestination, updateDestinations, updateDestination, deleteDestination, deleteAllDestinations } from './controllers/destinationController';
import { getDestinationHotels, updateDestinationHotels, deleteDestinationHotels, deleteAllDestinationsHotels } from './controllers/destinationHotelsController';

const cors = require('cors');
const bodyParser = require('body-parser')


const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors({origin: true}))
// app.use(bodyParser.raw({inflate:true, limit: '100kb', type: 'application/json'}));
// app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
})

app.post('/entries', addEntry);
app.get('/entries', getAllEntries);
app.patch('/entries/:entryId', updateEntry);
app.delete('/entries/:entryId', deleteEntry);

//app.post('/hotels/:entryId', updateHotels); 
app.get('/hotels/:destinationID', getAllHotels);
app.get('/hotels-all/prices', genericHotelPrices);  
app.get('/hotels/:hotelID/price', specificHotelPrice);  
//app.delete('/hotels/:entryId', deleteHotel);
//app.get('/hotels/getAllHotelPrices/:destinationID', getHotelsPrices); // main function for server

app.post('/destinations/', updateDestinations);
app.post('/destinations/:entryId', updateDestination);
app.get('/destinations', getDestinations);
app.get('/destinations/:entryId', getDestination);
app.delete('/destinations/:entryId', deleteDestination);
app.delete('/destinations', deleteAllDestinations);

app.post('/destinations/:destinationID/hotels', updateDestinationHotels);
app.get('/destinations/:destinationID/hotels', getDestinationHotels);
app.delete('/destinations/:destinationID/hotels', deleteDestinationHotels);
app.delete('/destinations/hotels', deleteAllDestinationsHotels);

// app.use('/api/destinations', require('./routes/destinationRoutes'))


exports.app = functions.https.onRequest(app);


