const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Extend Jest timeout for in-memory MongoDB download and startup on Windows
jest.setTimeout(60000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection) {
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 60000);
