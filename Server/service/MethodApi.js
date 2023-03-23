const { createEntity, createSrcEntity, createDestinationEntity, postLocalApi, submitPayment } =  require('./utilities.js')
const fs = require('fs')
class MethodApi {
    constructor(data, io){
        this.io = io,
        this.data = data,
        this.count = 0,
        this.limit = 600, //data.length 
        this.last = false, 
        this.interval = 600, 
        this.total_funds_source_acc = {},
        this.total_funds_branch = {},
        this.status_every_payment = [],
        this.modifiedData = [],
        this.failed = [],
        this.totalAmount = 0,
        this.totalPaid = 0,
        this.lastPercentage = 0
    }

    createEntities = async() => {
        await this.postingToApi(this.creatingEntities)
        await this.resetCount()
    }
    createSourceAccs = async() => {
        await this.postingToApi(this.creatingSourceEntities)
        this.resetCount()
    }
    createDestinationEntities = async() => {
        await this.postingToApi(this.creatingDestinationEntities)
        this.resetCount()
    }
    submitPayments = async() => {
        await this.postingToApi(this.submittingPayments)
        this.resetCount()
    }

    saveUpdatedFile = async() => {
        let json = JSON.stringify(this.data)
        await fs.promises.writeFile(__dirname + '/../uploads/json/processed.json', json)
        return;
    }

    resetCount = async() => {
        this.count = 0
        this.data = this.modifiedData
        this.modifiedData = []
    }
    
    setPercentage = () => {
        let percent = this.getPercentage()
        if(percent % 5 === 0 && percent !== this.lastPercentage) {
            this.io.emit('progress', percent)
            this.lastPercentage = percent
        }
        this.count++
    }

    getPercentage = () => Math.round(100 / this.limit * this.count)

    postingToApi = async(func) => {
        let limit = this.limit 
        let interval = this.interval
        let json = this.data 
        
        while(this.count < limit){
            try{
                let batch;
                let startIDX = this.count
                let endIDX = this.count + interval

                //handle last batch
                if(endIDX > limit){
                    batch = json.slice(startIDX, limit)
                }else {
                    batch = json.slice(this.count, this.count + interval) 
                }

                await func(batch)
                
                console.log('Reached API limit. Waiting for ', '| global count: ', this.count)
                if(this.last && this.count >= limit){ 
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 61000))
            }
            catch(e){
                console.log(e)
            }
        }
    }

    creatingEntities = async(batch) => {
        return new Promise(async (resolve, reject) => {
            try{
                let results = await batch.map(async(obj) => {
                    let { Employee } = obj
                    
                    await createEntity(Employee[0])
                    .then((entity_id) => {
                        obj.Payee[0]['entity_id'] = entity_id
                    })
                    .catch((err) => {
                        console.log(err)
                    })
                    this.setPercentage()
                    return obj;
                })
                await Promise.all(results).then((data) => {
                    this.modifiedData.push(...data)
                    resolve()
                })
            }
            catch(e){
                console.log(e)
            }
        })
    }

    creatingSourceEntities = async(batch) => {
        return await new Promise(async (resolve, reject) => {
            try{
                let results = await batch.map(async(obj,idx) => { 
                    let { Payee, destinationAccounts } = obj 

                    for(let {payor} of destinationAccounts){
                        await createSrcEntity(Payee[0], payor)
                        .then((response_id) => {
                            payor['mch_id'] = response_id
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                    this.setPercentage()
                    return obj;
                })
                await Promise.all(results).then((data) => {
                    this.modifiedData.push(...data)
                    resolve()
                })
            }
            catch(e){
                console.log(e)
            }
        })
    }

    creatingDestinationEntities = async(batch) => {
        return await new Promise(async (resolve, reject) => {
            try {
                let results = await batch.map(async(obj,idx) => { 
                    let { Payee, destinationAccounts } = obj

                    for(let data of destinationAccounts){
                        let {payor, Amount} = data
                        await createDestinationEntity(Payee[0], payor)
                        .then((response_id) => {
                            this.totalAmount = this.calcTot(this.totalAmount, Amount)
                            payor['dest_id'] = response_id
                        })
                        .catch((err) => {
                            console.log(err)
                        })
                    }
                    this.setPercentage()
                    return obj
                })
                await Promise.all(results).then((data) => {
                    this.modifiedData.push(...data)
                    resolve()
                })
            }
            catch(e){
                console.log(e)
            }
        })
    }

    calcTot = (cum, cur) => {
        let total = Number(cur.replaceAll('$','')) + Number(cum)
        return Number(total.toFixed(2))
    }

    submittingPayments = async(batch) => {
        return await new Promise(async (resolve, reject) => {
            try{
                let results = await batch.map(async(obj,idx) => {
                    let { destinationAccounts, Employee, Payor } = obj
                    let dunkinId = Employee[0]['DunkinBranch'][0]
                    let accountNum = Payor[0].AccountNumber[0]

                    for(let {payor, Amount} of destinationAccounts){
                        let amount = Number(Amount.replace('$','').replace('.',''))
                        await submitPayment(payor, amount)
                        .then(() => {
                            this.addTotalFunds(Amount, accountNum, this.total_funds_source_acc)
                            this.addTotalFunds(Amount, dunkinId, this.total_funds_branch)
                            this.totalPaid = this.calcTot(this.totalPaid, Amount)
                        })
                        .catch((err) => {
                            this.failed.push(obj)
                        })
                    }
                    this.setPercentage()
                    return obj
                })
                await Promise.all(results).then((data) => {
                    this.modifiedData.push(...data)
                    resolve()
                })
            }
            catch(e){
                console.log(e)
            }
        })
    }

    saveReport = async({ fileID, totalAmount }) => {
        let sourceAccs = this.total_funds_source_acc
        let branches = this.total_funds_branch
        let paymentStatus = {
            'status': this.totalPaid !== totalAmount || this.failed !== 0 ? `${this.failed.length} Failed payments || ${this.data.length - this.failed.length} Paid` : `All Employees Paid(${this.data.length})`,
            'totalPaid': this.totalPaid
        };

        const report = {
            'EmployeeID': fileID,
            'sourceAccs': sourceAccs,
            'branches': branches,
            'PaymentStatus': [paymentStatus]
        }
        let reportID = await postLocalApi(report, `saveReport`)
        return reportID
    }

    addTotalFunds = async(payment, accountNum, arr) => {
        let amount = payment.replaceAll('$','')                    
        if(arr[accountNum] === undefined){
            arr[accountNum] = Number(amount)
        }else{
            let newTot = arr[accountNum] + Number(amount)
            arr[accountNum] = Number(newTot.toFixed(2))
        }
    }

    saveFile = async() => {
        try{
            let json = this.data
            let collectionNum = await postLocalApi(json, 'saveFile')
            return collectionNum
        }
        catch(e){
            console.log(e)
        }
    }

    transformData = async(data, keyName, valueName) => {
        return Object.entries(data).map(([key, value]) => {
            let results = {
              [keyName]: key,
              [valueName]: value
            }
            return results
        })
    }
}

module.exports = MethodApi