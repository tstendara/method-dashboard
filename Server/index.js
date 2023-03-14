const express = require("express");
const fs = require("fs")
const cors = require("cors");
const path = require("path");

const port = 3000;
const app = express();

const { saveFile, findReport, saveReport, getFileById, sortedCollection } = require("../DB/Controllers/index.js")
const { parseFile } = require("./utility.js")
const { parseStringPromise } = require('xml2js');

// const MethodApi = require("./method_api/MethodApi.js");
// const { method } = require("../DB/Models/EmployeeSchema.js");

const router = express.Router();
const corsOptions = {
    allowedOrigins: ['http://localhost:3001']
}
const configuredCors = cors(corsOptions);

app.use(configuredCors)
app.use(express.json({limit: '60mb'}));
app.use(express.urlencoded({ extended: true, limit: '60mb'}));
// app.use(express.static(path.join(__dirname, 'uploads'))) // maybe server up files from here
app.use(router)


router.post("/XmlToJson", async(req, res) => {
    try{
        let file = await parseFile(req);
        let oldPath = file.filepath;
        let newPath = path.join(__dirname, 'uploads/xml') + '/'+  file.originalFilename
        let rawData = fs.readFileSync(oldPath)
        await fs.promises.writeFile(newPath, rawData)
        const xmlData = fs.readFileSync(__dirname + `/uploads/xml/sample.xml`)
        let {root: {row}} = await parseStringPromise(xmlData, async(err, results) => results)
        res.send(row)
    }
    catch(err) {
        console.log(err)
        res.sendStatus(500)
    }
});

router.post("/saveFile", async(req, res) => {
    let data = req.body;
    try{
        let collectionNum = await saveFile(data)
        res.send(collectionNum.toString())
    }
    catch(e){
        console.log(e)
        res.sendStatus(500)
    }
})

router.post("/saveReport", async(req,res) => {
    let data = req.body;
    try{
        let collectionNum = await saveReport(data)
        res.send(collectionNum.toString())
    }
    catch(e){
        console.log(e)
        res.sendStatus(500)
    }
})

router.get("/allFiles", async(req, res) => {
    try{
        let result = await sortedCollection()
        res.send(result)
        }   
        catch(e){
            console.log(e)
        }
})

router.get("/report/:id", async(req, res) => {
    console.log(req.params)
    try{
        const { id } = req.params;
        let results = await findReport(id)
        res.send(results)
    }
    catch(e){
        console.log(e)
        res.sendStatus(500)
        }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));