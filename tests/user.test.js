const request=require('supertest');
const mongoose=require('mongoose');
const {MongoMemoryServer}=require('mongodb-memory-server');

const {app,server}=require("../server");
const userModel=require("../Models/userModel");
const jwt = require("jsonwebtoken");

describe("User API",()=>{
    let mongoServer;
    let token;
    beforeAll(async()=>{
        // mongoServer= await MongoMemoryServer.create();
        // const uri=mongoServer.getUri();
        // await mongoose.connect(uri,{
        //     useNewUrlParser:true,
        //     useUnifiedTopology:true
        // })
        await mongoose.connect("mongodb://mongo-db:27017/dataSyncTask",{    
            serverSelectionTimeoutMS: 50000, // prevent early timeout
       });
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

    describe("USER APS",()=>{
        test("POST/editProfile -> should edit user profile successfully",async()=>{
            const res = await request(app)
                .post('/edituser')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    userName: "Updatedshivani",
                    phoneNumber: "9999999999"
                })
                expect(res.statusCode).toBe(200);
                expect(res.body.status).toBe(true);
                expect(res.body.data.userName).toBe("Updatedshivani");
                expect(res.body.data.phoneNumber).toBe("9999999999");
        })

        test("POST/addMinor -> should add minor user successfully",async()=>{
            const res = await request(app)
                .post('/addminor')
                .set('Authorization',`Bearer ${token}`)
                .send({
                    userName: "Abc",
                    role: "minor",
                    dob: "18-02-2018",
                    relation: "Son",
                    deviceId: "abcdef"
                })
                expect(res.statusCode).toBe(201);
                expect(res.body.status).toBe(true);
                expect(res.body.data.userName).toBe("Abc");
                expect(res.body.data.role).toBe("minor");
                expect(res.body.data.relation).toBe("Son");
                // expect(res.body.data.deviceId).toBe("abcdef");
                expect(res.body.message).toMatch("Member created successfully")
        })

        test("GET/minorMembersList -> should get minor members list successfully",async()=>{
            await request(app)
                .post('/addminor')
                .set('Authorization',`Bearer ${token}`)
                .send({
                    userName: "Abc",
                    role: "minor",
                    dob: "2018-02-17T18:30:00.000Z",
                    relation: "Son",
                    deviceId: "abcdef"
                })

             const res =await request(app)
            .get('/getminormembers')
            .set('Authorization',`Bearer ${token}`);
             let expectedData={
                    userName: "Abc",
                    role: "minor",
                    dob: "18-02-2018",
                    relation: "Son",
                    deviceId: "abcdef",
                    _id: "69144ba65e9ca5f88069b9f4"
            }
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.length).toBe(1);
            expect(res.body.data[0].userName).toBe("Abc");
            // expect(res.body.data[0].role).toBe("minor");
            expect(res.body.data[0].relation).toBe("Son");
            // expect(res.body.data[0].deviceId).toBe("abcdef");
            expect(res.body.message).toMatch("User List is here")
        })

        test("GET/minorMembersListFailCase -> should fail to get minor members (on role check condition)",async()=>{
            const minor= await userModel.create({
                email:"minor2@example.com",
                password:"password123",
                userName:"MinorUser2",
                role: "minor",
                isDeleted: false,
            });

            const minorToken = jwt.sign(  
                { UserId: minor._id, email: minor.email },
                "process.env.PRIVATE_KEY",
                { expiresIn: "10h" });
            const res = await request(app)
             .get('/getminormembers')
             .set('Authorization',`Bearer ${minorToken}`);

             expect(res.statusCode).toBe(403);
             expect(res.body.message).toMatch("Access denied")
        })

        test("DELETE/deleteUser -> should delete user successfully",async()=>{
            const res= await request(app)
            .put('/deleteuser')
            .set('Authorization',`Bearer ${token}`)
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.message).toMatch("User deleted successfully");
            expect(res.body.data.isDeleted).toBe(true)

        })
    })
})