const request=require('supertest');
const mongoose=require('mongoose');
const {MongoMemoryServer}=require('mongodb-memory-server');

const {app,server}=require("../server");
const userModel=require("../Models/reportModel");
const jwt = require("jsonwebtoken");
const path = require("path");

describe("USER API",()=>{
    let mongoServer;
    let token;
    let uploadedDoc;
    beforeAll(async()=>{
        // mongoServer= await MongoMemoryServer.create();
        // const uri=mongoServer.getUri();
        // await mongoose.connect(uri,{
        //     useNewUrlParser:true,
        //     useUnifiedTopology:true
        // })

    //     await mongoose.connect("mongodb://mongo-db:27017/dataSyncTask",{    
    //         serverSelectionTimeoutMS: 50000, // prevent early timeout
    //    });

       try {
    // Try starting in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to in-memory MongoDB for testing");
  } catch (err) {
    console.warn("⚠️ MongoMemoryServer failed, falling back to local MongoDB:", err.message);
    // Fallback to local or Atlas or docker container connection
    const fallbackUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/testdb";
    await mongoose.connect(fallbackUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to fallback local MongoDB instance");
  }
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
    
    //we can keep this block instead of creating document in each test case
    // const sampleFilePath = path.join(__dirname, "sample.pdf");

    // uploadedDoc = await Document.create({
    //   name: "Test Report",
    //   fileName: "sample.pdf",
    //   filePath: sampleFilePath,
    //   fileType: "application/pdf",
    //   size: fs.statSync(sampleFilePath).size,
    //   uploadedBy: "someUserId",
    //   relatedTo: "test",
    //   version: 1,
    //   isDeleted: false,
    //   deviceId: "device123",
    // });
    },60000);

    afterAll(async()=>{
        await mongoose.disconnect();
if (server) {
    server.close();  // <-- only close if server exists
  }        
        // await mongoServer.stop();
  if (mongoServer) {
    await mongoServer.stop();
  }
    })

    describe("REPORT APIS",()=>{
        test("POST/uploadreport -> should add report successfully",async()=>{
            const filePath = path.join(__dirname, "sample.pdf"); // place a sample file in your tests folder
            const res = await request(app)
                .post("/uploadreport")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "Health Report")
                .field("relatedTo", "general")
                .field("deviceId", "device123")
                .attach("file", filePath); // 'file' must match upload.single('file')
            console.log(res.body.data,"resbody--->>")
            expect(res.statusCode).toBe(201);
            expect(res.body.status).toBe(true);
            expect(res.body.message).toBe("Document uploaded successfully");
            expect(res.body.data).toHaveProperty("fileName");
            expect(res.body.data).toHaveProperty("uploadedBy");
        })

        test("POST/editReportDocument -> should edit report successfully",async()=>{
            const filePath = path.join(__dirname,"sample3.pdf");
             const resAdd = await request(app)
                .post("/uploadreport")
                .set("Authorization", `Bearer ${token}`)
                .field("name", "Health Report2")
                .field("relatedTo", "general")
                .field("deviceId", "device123")
                .attach("file", filePath); 
                // console.log(resAdd,"resadd--->>>")
            const filePath2 = path.join(__dirname,"sample2.pdf");
            const res = await request(app)
                .put('/editreport')
                .set('Authorization',`Bearer ${token}`)
                .field("reportId",resAdd.body.data._id.toString())
                .field("deviceId","device123")
                .field("name","Health Report Updated")
                .field("relatedTo","general")
                .field("version","1")
                .attach("file",filePath2);
             console.log(res,"res dta here--->>>>")
                expect(res.statusCode).toBe(200);
                 expect(res.body.status).toBe(true);
                 expect(res.body.message).toBe("Data updated succefully");
                 expect(res.body.data).toHaveProperty("fileName");
                 expect(res.body.data).toHaveProperty("uploadedBy");
                 expect(res.body.data.deviceId).toBe("device123");
        })

        test("GET/getreports -> should get report list successfully",async()=>{
            const filePath = path.join(__dirname,"sample3.pdf");
            await request(app)
                .post('/uploadreport')
                .set('Authorization',`Bearer ${token}`)
                .field("name", "Health Report2")
                .field("relatedTo", "general")
                .field("deviceId", "device123")
                .attach("file", filePath);

             const res =await request(app)
            .get('/getreports')
            .set('Authorization',`Bearer ${token}`)
            .query({ lastSync:"2025-10-23T10:50:11.359Z",deviceId:"device123" });
            console.log(res,"get res--->>>>")
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.data.length).toBe(3);
            expect(res.body.data[0]).toHaveProperty("fileName");
            expect(res.body.data[0]).toHaveProperty("uploadedBy");
            expect(res.body.message).toMatch("Report List is here");
        })

        test("GET/reportListFailCase -> should fail to get report (on device not found condition)",async()=>{
           const filePath = path.join(__dirname,"sample3.pdf");
            await request(app)
                .post('/uploadreport')
                .set('Authorization',`Bearer ${token}`)
                .field("name", "Health Report2")
                .field("relatedTo", "general")
                .field("deviceId", "device123")
                .attach("file", filePath);
             const res =await request(app)
            .get('/getreports')
            .set('Authorization',`Bearer ${token}`)
            .query({ lastSync:"2025-10-23T10:50:11.359Z",deviceId:"device1235" });

             expect(res.statusCode).toBe(404);
             expect(res.body.message).toMatch("User or device not found")
        })

        test("DELETE/deleteDocument -> should delete report/document successfully",async()=>{
            const filePath = path.join(__dirname,"sample3.pdf");
            const addRes=await request(app)
                .post('/uploadreport')
                .set('Authorization',`Bearer ${token}`)
                .field("name", "Health Report3")
                .field("relatedTo", "general")
                .field("deviceId", "device123")
                .attach("file", filePath);
                console.log(addRes,"add res===>>>")
            const res= await request(app)
            .put('/deletereport')
            .set('Authorization',`Bearer ${token}`)
            .send({id:addRes.body.data._id.toString()})
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe(true);
            expect(res.body.message).toMatch("Document deleted successfully");
            expect(res.body.data.isDeleted).toBe(true)

        })

         test("GET/downloadReportFile -> should download report file",async()=>{
           const filePath = path.join(__dirname,"sample3.pdf");
           let addRes= await request(app)
                .post('/uploadreport')
                .set('Authorization',`Bearer ${token}`)
                .field("name", "Health ReportDownload") 
                .field("relatedTo", "general")
                .field("deviceId", "device123")
                .attach("file", filePath);
             const res =await request(app)
            .get('/downloadreport')
            .set('Authorization',`Bearer ${token}`)
            .query({ id: addRes.body.data._id.toString()});

            expect(res.headers["content-type"]).toBe("application/pdf");
            expect(res.headers["content-disposition"]).toContain("attachment");
            expect(res.headers["content-disposition"]).toMatch(/sample3\.pdf/)
        })

         test("GET/downloadReportFileFailCase -> should fail to download report file with 404",async()=>{
           
             const res =await request(app)
            .get('/downloadreport')
            .set('Authorization',`Bearer ${token}`)
            .query({ id:"690af6e4d4dc7b6840b501d9"})
            .expect(404);

            expect(res.body.message).toMatch("Document not found");
        })
    })
})