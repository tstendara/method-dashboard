const MethodApi = require('./MethodApi.js')
const fs = require('fs')

module.exports = async function (importIO, resp) {
    let io = importIO
    let rawData = await fs.promises.readFile(__dirname + '/../uploads/json/processed.json')
    let data = JSON.parse(rawData)
  
    try {
        const api = new MethodApi(data, io)
        console.log('Submitting payments')
        api.last = true
        await api.submitPayments()
        api.total_funds_source_acc = await api.transformData(api.total_funds_source_acc,'sourceAcc', 'total')
        api.total_funds_branch = await api.transformData(api.total_funds_branch,'branch', 'total')
        await api.saveReport(resp)
        io.emit('finishedPayments', {'totalPaid': Number(api.totalPaid), 'failed': api.failed, 'api_data: ': api.data.length, 'total_funds_branch: ': api.total_funds_branch, 'total_funds_source_acc': api.total_funds_source_acc})
    }
    catch(e){
        console.log(e)
    } 
}