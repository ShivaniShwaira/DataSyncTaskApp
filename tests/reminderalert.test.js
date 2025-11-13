const request=require('supertest');
const mongoose=require('mongoose');
const {MongoMemoryServer}=require('mongodb-memory-server');

const {app,server}=require("../server");
const reminderAlertModel=require("../Models/reminderAlertModel");
const jwt = require("jsonwebtoken");

describe("USER API",()=>{
    let mongoServer;
    let token;
    beforeAll(async()=>{
        mongoServer= await MongoMemoryServer.create();
        const uri=mongoServer.getUri();
        await mongoose.connect(uri,{
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
    //     await mongoose.connect("mongodb://mongo-db:27017/dataSyncTask",{    
    //         serverSelectionTimeoutMS: 50000, // prevent early timeout
    //    });
//      if (!process.env.TEST_TOKEN) {
//     const loginRes = await request(app).post("/login").send({
//       email:"test@exa.com",
//       password:"password123",
//       deviceId:"device123",
//       deviceType:"mobile"
//     });
//     console.log("LoginRes Token",loginRes.body)
//     process.env.TEST_TOKEN = loginRes.body.data.token;
//   }
 await request(app)
      .post("/registration")
      .send({
        email: "test@exa.com",
        password: "password123",
        deviceId: "device123",
        deviceType: "mobile",
        userName: "Shiv101",
        phoneNumber: "0290902891",
        role: "primary",
      });

    // 🧩 Now log in and save token
    const loginRes = await request(app)
      .post("/login")
      .send({
        email: "test@exa.com",
        password: "password123",
        deviceId: "device123",
        deviceType: "mobile",
      });

    expect(loginRes.statusCode).toBe(200);
    token = loginRes.body.data.token;
    expect(token).toBeDefined();
    },60000);

    afterAll(async()=>{
        await mongoose.disconnect();
if (server) {
    server.close();  // <-- only close if server exists
  }        
        // await mongoServer.stop();
    })

    // afterEach(async()=>{
    //     await userModel.deleteMany({});
    // })

    // test("POST /registration-> should register a new user successfully",async()=>{
    //     const res= await request(app)
    //     .post("/registration")
    //     .send({
    //         email:"test@exa.com",
    //         password:"password123",
    //         deviceId:"device123",
    //         deviceType:"mobile",
    //         userName:"Shiv101",
    //         phoneNumber:"0290902891",
    //         role:"primary",
    //     })
    //     expect(res.statusCode).toBe(201);
    //     expect(res.body.status).toBe(true);
    //     expect(res.body.data.email).toBe("test@exa.com");
    //     expect(res.body.message).toMatch("User created successfully");
    // })

    //  test("POST /login-> should user login successfully",async()=>{
    //      await request(app)
    // .post("/registration")
    // .send({
    //         email:"test@exa.com",
    //         password:"password123",
    //         deviceId:"device123",
    //         deviceType:"mobile",
    //         userName:"Shiv101",
    //         phoneNumber:"0290902891",
    //         role:"primary",
    // });
    //     const res= await request(app)
    //     .post("/login")
    //     .send({
    //         email:"test@exa.com",
    //         password:"password123",
    //         deviceId:"device123",
    //         deviceType:"mobile"
    //     })
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.status).toBe(true);
    //     // expect(res.body.data.email).toBe("test@exa.com");
    //     expect(res.body.data.token).toBeDefined();
    //     expect(res.body.message).toMatch("User logged in successfully");
    // })

    describe("REPORT APIS",()=>{
        test("POST/addReminderAlert -> should edit user profile successfully",async()=>{
            const res = await request(app)
                .post('/addalerts')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: "Medicine-101",
                    type: "medicine",
                    medicine: "Paracetomol",
                    quantity: "1",
                    doctorName: "Ap",
                    time: "05:44 pm",
                    date: "07-11-2025",
                    version: "1",
                    deviceId: "abcdef"
                })
                expect(res.statusCode).toBe(201);
                expect(res.body.status).toBe(true);
                expect(res.body.data.name).toBe("Medicine-101");
                expect(res.body.data.type).toBe("medicine");
                expect(res.body.data.medicine).toBe("Paracetomol");
                expect(res.body.data.quantity).toBe(1);
                expect(res.body.data.doctorName).toBe("Ap");
                expect(res.body.data.time).toBe("05:44 pm");
                expect(res.body.data.deviceId).toBe("abcdef");
                expect(res.body.message).toMatch("Alert created successfully")
        })

        test("POST/editalert -> should add minor user successfully",async()=>{
            let reminderAlert = await reminderAlertModel.create({
                name: "Medicine-101",
                type: "medicine",
                medicine: "Paracetomol",
                quantity: "1",
                doctorName: "Ap",
                time: "05:44 pm",
                date: "07-11-2025",
                version: "1",
                deviceId: "abcdef"
            });
            const res = await request(app)
                .put('/editalert')
                .set('Authorization',`Bearer ${token}`)
                .send({
                    alertid:reminderAlert._id.toString(),
                    name: "Medicine-101",
                    type: "medicine",
                    medicine: "Paracetomol",
                    quantity: "1",
                    doctorName: "Ap",
                    time: "05:44 pm",
                    date: "07-11-2025",
                    version: "1",
                    deviceId: "abcdef"
                })
                expect(res.statusCode).toBe(200);
                expect(res.body.status).toBe(true);
                expect(res.body.data.name).toBe("Medicine-101");
                expect(res.body.data.type).toBe("medicine");
                expect(res.body.data.medicine).toBe("Paracetomol");
                expect(res.body.data.quantity).toBe(1);
                expect(res.body.data.doctorName).toBe("Ap");
                expect(res.body.data.time).toBe("05:44 pm");
                expect(res.body.data.deviceId).toBe("abcdef");
                expect(res.body.message).toMatch("Data updated succefully")
        })

        test("GET/reminderAlertList -> should get reminder alert list successfully",async()=>{
           let reminderAlert = await reminderAlertModel.create({
                name: "Medicine-101",
                type: "medicine",
                medicine: "Paracetomol",
                quantity: "1",
                doctorName: "Ap",
                time: "05:44 pm",
                date: "07-11-2025",
                version: "1",
                deviceId: "device123"
            });
             const res =await request(app)
            .get('/getalerts')
            .set('Authorization',`Bearer ${token}`)
            .query({ lastSync:"2025-10-23T10:50:11.359Z",deviceId:"device123" });  
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.length).toBe(2);
            expect(res.body.data[0].name).toBe("Medicine-101");
            expect(res.body.data[0].type).toBe("medicine");
            expect(res.body.data[0].medicine).toBe("Paracetomol");
            expect(res.body.data[0].quantity).toBe(1);
            expect(res.body.data[0].doctorName).toBe("Ap");
            expect(res.body.data[0].time).toBe("05:44 pm");
            expect(res.body.data[0].deviceId).toBe("abcdef");
            expect(res.body.message).toMatch("Alert List is here")
        })

        test("GET/reminderAlertListLastSync -> should fail to get reminder alert list",async()=>{
             const res =await request(app)
            .get('/getalerts')
            .set('Authorization',`Bearer ${token}`)
            .query({ lastSync:"2025-12-23T10:50:11.359Z",deviceId:"device123" });  
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
        })

        test("DELETE/deleteAlert -> should delete alert successfully",async()=>{
             let reminderAlert = await reminderAlertModel.create({
                name: "Medicine-101",
                type: "medicine",
                medicine: "Paracetomol",
                quantity: "1",
                doctorName: "Ap",
                time: "05:44 pm",
                date: "07-11-2025",
                version: "1",
                deviceId: "abcdef"
            });
            const res= await request(app)
            .put('/deletealert')
            .set('Authorization',`Bearer ${token}`)
            .send({id:reminderAlert._id.toString()});

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.message).toMatch("Alert deleted successfully");
            expect(res.body.data.isDeleted).toBe(true);
            expect(res.body.data.version).toBe(2);

        })
    })
})