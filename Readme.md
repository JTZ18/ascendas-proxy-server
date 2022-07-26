# Ascendas Hotels Proxy server
NodeJs Server using Express framework deployed on firebase CloudFunctions <br/>
The purpose of this proxy server is to mimic the behavior of the official ascendas api endpoint: https://hotelapi.loyalty.dev/api/ <br/>
Since the endpoint cannot be called directly on the frontend due to CORS error, we have made our own proxy server to call the official api endpoint and poll if necessary to wait for search results, before returning request results back to the front end. This service serves as a middle man between react app and official ascendas api endpoint

## Setup
- `cd` into functions folder before running the following commands. All commands should be run in functions folder <br/>
- Ensure you have firebase tools installed <br/>
`npm install -g firebase-tools`<br/>
- Install all dependencies using<br/>
`npm i`
- To test locally you need to install firebase emulators for cloudfunctions and firestore. Run the following command to install the emulators <br/>
`firebase init emulators`

## Scripts
- Run `npm run dev` which automatically builds the typescript project and launches the necessary firebase emulators to test locally
- Run `npm run deploy` which automatically builds the typescript project and runs `firebase deploy` automatically for you to deploy to firebase for you


## Endpoints
- Official ascendas endpoint https://hotelapi.loyalty.dev/api/ <br/>
- Our Proxy server endpoint https://us-central1-t5-esc-ascendas-hotels.cloudfunctions.net/app/

| REQ | Proxy                                                                                                                                           | Ascendas                                                                                                                                        | Returns                                                                                                                                            |
|-----|-------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| GET | /hotels/:destinationID                                                                                                                          | /hotels/:destinationID                                                                                                                          | "gets all hotel details given a destination id                                                                                                     |
| GET | /hotels-all/prices?destination_id=vJQX&checkin=2022-08-18&checkout=2022-08-19&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1     | /hotels/prices?destination_id=vJQX&checkin=2022-08-18&checkout=2022-08-19&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=2         | gets all hotels generic prices, u can put the search params query as shown                                                                         |
| GET | /hotels/:hotelID/price?destination_id=WD0M&checkin=2022-08-18&checkout=2022-08-19&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=1 | /hotels/:hotelID/price?destination_id=WD0M&checkin=2022-08-18&checkout=2022-08-19&lang=en_US&currency=SGD&country_code=SG&guests=2&partner_id=2 | gets specific hotel price, given a specific :hotelID.Search query works the same way as their endpoint too example: replace :hotelID with diH7 |

