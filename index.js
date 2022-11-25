const axios = require('axios');
require('dotenv').config();
const {MongoClient} = require('mongodb');

const uri = process.env.MONGO_URI
const client = new MongoClient(uri);
const database = client.db('starwars');

const apiUri = 'https://swapi.dev/api/'

const getData = async (url) => {
    try {
        return await axios.get(url)
    } catch (error) {
        console.error(error)
    }
}

const extractAllEndpoints = async () =>{
    const rootEndpoint = await getData(apiUri);
    return rootEndpoint.data;
}

const insertEachEndpoint = async (endpoints) => {
    for await (const endpoint of endpoints) {
        const collection = endpoint[0]
        const endpointUri = endpoint[1]
        await getAllData(collection, endpointUri);
    }
}

const getAllData = async (collection, endpoint) => {
    response = await getData(endpoint)
   
    await insertData(collection, response.data.results)
    
    if(response.data.next !== null){
        getAllData(collection, response.data.next)
    }  
}

const insertData  = async (collection, documents) => {
    try {
        // console.log(documents.length)
        const starwars = database.collection(collection);
        await starwars.insertMany(documents)
    } catch (error) {
        console.error('roulou merda com o ', error)
    }
}

const main = async () => {
    const endpoints = await extractAllEndpoints();
    await insertEachEndpoint(Object.entries(endpoints))
}

main();