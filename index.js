const axios = require("axios");
const { MongoClient } = require("mongodb");

require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "pokedex",
});

const apiBaseUrl = "https://pokeapi.co/api/v2";
const collections = [
  { name: "berries", endpoint: `${apiBaseUrl}/berry` },
  { name: "berry-firmness", endpoint: `${apiBaseUrl}/berry-firmness` },
  { name: "berry-flavors", endpoint: `${apiBaseUrl}/berry-flavor` },
  { name: "contest-types", endpoint: `${apiBaseUrl}/contest-type` },
  { name: "contest-effects", endpoint: `${apiBaseUrl}/contest-effect` },
  { name: "super-contest-effects", endpoint: `${apiBaseUrl}/super-contest-effect` },
  { name: "encounter-methods", endpoint: `${apiBaseUrl}/encounter-method` },
  { name: "encounter-conditions", endpoint: `${apiBaseUrl}/encounter-condition` },
  { name: "encounter-condition-values", endpoint: `${apiBaseUrl}/encounter-condition-value` },
  { name: "evolution-chains", endpoint: `${apiBaseUrl}/evolution-chain` },
  { name: "evolution-triggers", endpoint: `${apiBaseUrl}/evolution-trigger` },
  { name: "generations", endpoint: `${apiBaseUrl}/generation` },
  { name: "pokedexes", endpoint: `${apiBaseUrl}/pokedex` },
  { name: "versions", endpoint: `${apiBaseUrl}/version` },
  { name: "version-groups", endpoint: `${apiBaseUrl}/version-group` },
  { name: "items", endpoint: `${apiBaseUrl}/item` },
  { name: "item-attributes", endpoint: `${apiBaseUrl}/item-attribute` },
  { name: "item-categories", endpoint: `${apiBaseUrl}/item-category` },
  { name: "item-fling-effects", endpoint: `${apiBaseUrl}/item-fling-effect` },
  { name: "item-pockets", endpoint: `${apiBaseUrl}/item-pocket` },
  { name: "locations", endpoint: `${apiBaseUrl}/location` },
  { name: "location-areas", endpoint: `${apiBaseUrl}/location-area` },
  { name: "pal-park-areas", endpoint: `${apiBaseUrl}/pal-park-area` },
  { name: "regions", endpoint: `${apiBaseUrl}/region` },
  { name: "machines", endpoint: `${apiBaseUrl}/machine` },
  { name: "moves", endpoint: `${apiBaseUrl}/move` },
  { name: "move-ailments", endpoint: `${apiBaseUrl}/move-ailment` },
  { name: "move-battle-styles", endpoint: `${apiBaseUrl}/move-battle-style` },
  { name: "move-categories", endpoint: `${apiBaseUrl}/move-category` },
  { name: "move-damage-classes", endpoint: `${apiBaseUrl}/move-damage-class` },
  { name: "move-learn-methods", endpoint: `${apiBaseUrl}/move-learn-method` },
  { name: "move-targets", endpoint: `${apiBaseUrl}/move-target` },
  { name: "abilities", endpoint: `${apiBaseUrl}/ability` },
  { name: "characteristics", endpoint: `${apiBaseUrl}/characteristic` },
  { name: "egg-groups", endpoint: `${apiBaseUrl}/egg-group` },
  { name: "genders", endpoint: `${apiBaseUrl}/gender` },
  { name: "growth-rates", endpoint: `${apiBaseUrl}/growth-rate` },
  { name: "natures", endpoint: `${apiBaseUrl}/nature` },
  { name: "pokeathlon-stats", endpoint: `${apiBaseUrl}/pokeathlon-stat` },
  { name: "pokemons", endpoint: `${apiBaseUrl}/pokemon` },
  { name: "pokemon-colors", endpoint: `${apiBaseUrl}/pokemon-color` },
  { name: "pokemon-forms", endpoint: `${apiBaseUrl}/pokemon-form` },
  { name: "pokemon-habitats", endpoint: `${apiBaseUrl}/pokemon-habitat` },
  { name: "pokemon-shapes", endpoint: `${apiBaseUrl}/pokemon-shape` },
  { name: "pokemon-species", endpoint: `${apiBaseUrl}/pokemon-species` },
  { name: "stats", endpoint: `${apiBaseUrl}/stat` },
  { name: "types", endpoint: `${apiBaseUrl}/type` },
];

const insertData = async (collectionName, data) => {
  try {
    const collection = client.db().collection(collectionName);
    await collection.insertMany(data);

    console.log(
      `Inserted ${data.length} documents into ${collectionName} collection`
    );
  } catch (error) {
    console.error(
      `Error inserting data into ${collectionName} collection:`,
      error
    );
  }
};

const fetchData = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: { Accept: "application/json", "Accept-Encoding": "identity" },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
  }
};

const fetchAllData = async (collectionName, url) => {
  let data = [];
  let response = await fetchData(url);
  data = data.concat(response.results);
  while (response.next) {
    response = await fetchData(response.next);
    data = data.concat(response.results);
  }

  await insertData(collectionName, data);
};

const main = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB database");

    for (const collection of collections) {
      const collectionName = collection.name;
      await fetchAllData(collectionName, collection.endpoint);
    }

    console.log("All data fetched and inserted successfully");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB database");
  }
};
main();
