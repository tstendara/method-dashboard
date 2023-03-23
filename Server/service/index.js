/* eslint-disable */
const MethodApi = require('./MethodApi.js')
const fs = require('fs')

module.exports = async function (importIO) {
    let io = importIO
    let rawData = await fs.promises.readFile(__dirname + '/../uploads/json/processed.json')
    let data = JSON.parse(rawData)
  
    try {
        const api = new MethodApi(data, io)
        console.log('Creating employees')
        await api.createEntities()
        console.log('Creating source accs')
        new Promise(resolve => setTimeout(resolve, 5000))
        await api.createSourceAccs(); 
        console.log('Creating destination accs')
        new Promise(resolve => setTimeout(resolve, 5000))
        api.last = true
        await api.createDestinationEntities()
        let fileID = await api.saveFile()
        await api.saveUpdatedFile()
        io.emit('finished', {'fileID': fileID, 'totalAmount': Number(api.totalAmount)})
    }
    catch(e){
        console.log(e)
    } 
}
