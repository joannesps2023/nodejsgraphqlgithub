// Import Apollo Azure integration library
const { ApolloServer, gql } = require('apollo-server-azure-functions');
const { CosmosClient } = require('@azure/cosmos');
const {
    ApolloServerPluginLandingPageLocalDefault
  } = require('apollo-server-core');
// Construct a schema, using GraphQL schema language

const connectionString = "AccountEndpoint=https://jotestcosmosdb.documents.azure.com:443/;AccountKey=cioKesaGJPZZGi2mjFOa4kl1YJmYai67uZGKCxTHL4s2si7ubGvtMn9avUXit4S5PdJqes3zIyeNACDb9BVJug==;";
const databaseName = "testDB";
const containerName = "testContainer";
const client = new CosmosClient(connectionString);

const typeDefs = gql`
  type Config
  {
    config_name : String,
    template_name : String
  }
type Query {
    config(id: [String]!): [Config],
    configs: [Config]
  }
`;


  getUser = async (_, { id }) => {
    let idString = "(";
    id.forEach(idelem=>
      {
        idString = idString + "'"+idelem + "',";
      })
      idString = idString.slice(0,-1);
      idString = idString + ")";

    let query = "SELECT * FROM c WHERE c.id in "+idString;
    let { resources: items } = await client.database(databaseName).container(containerName)
      .items.query({ query: query }).fetchAll();
    return items;
  };

  
  getAllUser = async () => {
    let { resources: items } = await client.database(databaseName).container(containerName)
      .items.query({ query: "SELECT * from c" }).fetchAll();
    return items;
  };


  const resolvers = {
    Query: {
      config:getUser,
      configs: getAllUser
    }
  };


const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  });
exports.graphqlHandler = server.createHandler();