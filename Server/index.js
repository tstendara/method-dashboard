const express = require("express");
const fs = require("fs")
const cors = require("cors");
const path = require("path");
const { parseStringPromise } = require('xml2js');

const port = 3000;
const app = express();

const { saveFile, findReport, saveReport, sortedCollection } = require("../DB/Controllers/index.js")
const { parseFile } = require("./utility.js")

const router = express.Router();

const corsOptions = {
    allowedOrigins: ['http://localhost:3001']
}
const configuredCors = cors(corsOptions);

app.use(configuredCors)
app.use(express.json({limit: '200mb'}));
app.use(router)

var server = require('http').Server(app);
var io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3001",
        maxHttpBufferSize: 1e9
    }
});

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

router.post("/processRawData", async(req, res) => {
    let data = req.body;    
    try{
        let results = await new Promise(async(resolve, reject) => {
            const uniqueEmpRef = {};
            let newEmployeeList = []
            await data.forEach((obj) => {
                let { Employee, Amount, Payee, Payor } = obj;
                let amount = Amount[0];
                let payee = Payee[0];
                let payor = Payor[0];
        
                const {FirstName, LastName} = Employee[0];
                const name = `${FirstName} ${LastName}`;
                
                let newObj = {
                  'payor': {
                    'AccountNumber': payor['AccountNumber'][0],
                    'RoutingNumber': payor['ABARouting'][0],
                  },
                   'LoanAccountNumber': payee['LoanAccountNumber'][0],
                   'PlaidId': payee.PlaidId[0],
                    'Amount': amount,
                }
        
                if (name in uniqueEmpRef) {
                  let curAmount = newEmployeeList[uniqueEmpRef[name]].Amount[0].slice(1)
                  let newAmount = (parseFloat(curAmount) + parseFloat(amount.slice(1))).toFixed(2)
                  newEmployeeList[uniqueEmpRef[name]].Amount[0] = `$${newAmount}`
        
                  newEmployeeList[uniqueEmpRef[name]]['destinationAccounts'].push(newObj)
                } else {
                  obj['destinationAccounts'] = [] 
                  obj['destinationAccounts'].push(newObj)
                  newEmployeeList.push(obj)
                  uniqueEmpRef[name] = newEmployeeList.length-1; // idx of the new employee list
                }
                resolve(newEmployeeList)
            })
        })
        await fs.promises.writeFile(__dirname + '/uploads/json/processed.json', JSON.stringify(results))
        res.send(results)
    }
    catch(e){
        console.log(e)
        res.sendStatus(500)
    }
})

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on("start", async(data) => {
        console.log('clientEvent:', data)
        await require('./service/index.js')(io)
    })
    socket.on("pay", async(resp) => {
        console.log('clientEvent:', resp)
        await require('./service/handlePayment.js')(io, resp)
    })
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(port, () => console.log(`Example app listening on port ${port}!`));