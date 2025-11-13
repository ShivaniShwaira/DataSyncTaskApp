const request=require('supertest');
const mongoose=require('mongoose');
const {MongoMemoryServer}=require('mongodb-memory-server');

const {app,server}=require("../server");
const userModel=require("../Models/userModel");

describe("User API",()=>{
    let mongoServer;
    beforeAll(async()=>{
        // mongoServer= await MongoMemoryServer.create();
        // const uri=mongoServer.getUri();
        // await mongoose.connect(uri,{
        //     useNewUrlParser:true,
        //     useUnifiedTopology:true
        // })
        await mongoose.connect("mongodb://mongo-db:27017/dataSyncTask",{    
            serverSelectionTimeoutMS: 50000, // prevent early timeout
       })
    },60000);

    afterAll(async()=>{
        await mongoose.disconnect();
if (server) {
    server.close();  // <-- only close if server exists
  }        
        // await mongoServer.stop();
    })

    afterEach(async()=>{
        await userModel.deleteMany({});
    })

    test("POST /registration-> should register a new user successfully",async()=>{
        const res= await request(app)
        .post("/registration")
        .send({
            email:"test@exa.com",
            password:"password123",
            deviceId:"device123",
            deviceType:"mobile",
            userName:"Shiv101",
            phoneNumber:"0290902891",
            role:"primary",
        })
        expect(res.statusCode).toBe(201);
        expect(res.body.status).toBe(true);
        expect(res.body.data.email).toBe("test@exa.com");
        expect(res.body.message).toMatch("User created successfully");
    })

     test("POST /login-> should user login successfully",async()=>{
         await request(app)
    .post("/registration")
    .send({
            email:"test@exa.com",
            password:"password123",
            deviceId:"device123",
            deviceType:"mobile",
            userName:"Shiv101",
            phoneNumber:"0290902891",
            role:"primary",
    });
        const res= await request(app)
        .post("/login")
        .send({
            email:"test@exa.com",
            password:"password123",
            deviceId:"device123",
            deviceType:"mobile"
        })
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe(true);
        // expect(res.body.data.email).toBe("test@exa.com");
        expect(res.body.data.token).toBeDefined();
        expect(res.body.message).toMatch("User logged in successfully");
        process.env.TEST_TOKEN=res.body.data.token;
    })
})