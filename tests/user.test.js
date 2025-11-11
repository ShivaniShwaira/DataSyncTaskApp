const request=require('supertest');
const mongoose=require('mongoose');
const {MongoMemoryServer}=require('mongodb-memory-server');

const app=require("../server");
const userModel=require("../Models/userModel");

describe("User API",()=>{
    let mongoServer;
    beforeAll(async()=>{
        mongoServer= await MongoMemoryServer.create();
        const uri=mongoServer.getUri();
        await mongoose.connect(uri,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
    },20000);

    afterAll(async()=>{
        await mongoose.disconnect();
        await mongoServer.stop();
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
})