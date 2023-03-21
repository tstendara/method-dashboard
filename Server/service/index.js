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
        new Promise(resolve => setTimeout(resolve, 15000))
        await api.createSourceAccs(); // 45
        console.log('Creating destination accs')
        new Promise(resolve => setTimeout(resolve, 15000))
        api.last = true
        await api.createDestinationEntities()
        api.total_funds_source_acc = await api.transformData(api.total_funds_source_acc,'sourceAcc', 'total')
        api.total_funds_branch = await api.transformData(api.total_funds_branch,'branch', 'total')
        let reportID = await api.savejsonAndReport()
        console.log({'reportID': reportID, 'totalAmount': Number(api.totalAmount), 'funds_sourceAccs': api.total_funds_source_acc, 'funds_branches': api.total_funds_branch})
        console.log('failed: ', api.failed, api.failed.length,api.failed[0])
        io.emit('finished', {'reportID': reportID, 'totalAmount': Number(api.totalAmount), 'funds_sourceAccs': api.total_funds_source_acc, 'funds_branches': api.total_funds_branch})
    }
    catch(e){
        console.log(e)
    } 
}
