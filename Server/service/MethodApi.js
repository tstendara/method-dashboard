const { createEntity, createSrcEntity, createDestinationEntity, postLocalApi } =  require('./utilities.js')

class MethodApi {
    constructor(data, io){
        this.io = io,
        this.data = data,
        this.modifiedData = [],
        this.count = 0,
        this.limit = 1200, //data.length
        this.last = false, // last time it stopped: 20
        this.interval = 600, // Rate limit
        this.total_funds_source_acc = {},
        this.total_funds_branch = {},
        this.status_every_payment = [],
        this.failed = [],
        this.totalAmount = 0,
        this.lastPercentage = 0
    }

    createEntities = async() => {
        await this.postingToApi(this.creatingEntities)
        console.log('passing: ', this.modifiedData)
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
    getPaymentStatus = async() => {

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
                console.log('limit: ', limit)
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
                await new Promise(resolve => setTimeout(resolve, 30000))
            }
            catch(e){
                console.log(e)
            }
        }
    }

    creatingEntities = async(batch) => {
        return new Promise(async (resolve, reject) => {
 
            let results = await batch.map(async(obj, idx) => {
                let {Employee, Amount} = obj
                let dunkinId = Employee[0]['DunkinBranch'][0]
                
                // report calculations
                this.addTotalFunds(Amount[0], dunkinId, this.total_funds_branch)
                
                let amount = Amount[0].replaceAll('$','')
                let total = Number(amount) + Number(this.totalAmount)
                this.totalAmount = Number(total.toFixed(2))
                // change one object to mess up one for testing
                if(idx % 600 === 0) {
                    Employee[0]['FirstName'][0] = 'bobby';
                    console.log('Employee: ', Employee[0])
                }

                return createEntity(Employee[0])
                .then((entity_id) => {
                    this.setPercentage()
                    obj.Payor[0]['entity_id'] = entity_id
                    return obj;
                })
                .catch((err) => {
                    this.setPercentage()
                    this.failed.push(obj)
                    return obj;
                })
            })
            await Promise.all(results).then((data) => {
                this.modifiedData.push(...data)
                resolve()
            })
            
        })
    }

    creatingSourceEntities = async(batch) => {
        return await new Promise(async (resolve, reject) => {
            try{
                let results = await batch.map(async(obj,idx) => { 
                    let { Payor, Amount } = obj 
                    let amount = Amount[0]
                    let accountNum = Payor[0].AccountNumber[0]

                    // report calculations
                    await this.addTotalFunds(amount, accountNum, this.total_funds_source_acc)

                    return createSrcEntity(Payor[0])
                    .then((response_id) => {
                        obj.Payor[0]['mch_id'] = response_id
                        this.setPercentage()
                        return obj;
                    })
                    .catch((err) => {
                        this.setPercentage()
                        this.failed.push(obj)
                        return obj;
                    })
                })
                await Promise.all(results).then((data) => {
                    this.modifiedData.push(...data)
                    resolve()
                })
            }
            catch(e){
                console.log(e)
                reject()
            }
        })
    }

    creatingDestinationEntities = async(batch) => {
        return await new Promise(async (resolve, reject) => {
            try {
                let results = await batch.map(async(obj,idx) => { 
                    let { Payor } = obj
                    // need to for loop thru all payors 
                    return createDestinationEntity(Payor[0])
                    .then((response_id) => {
                        obj.Payor[0]['dest_id'] = response_id
                        this.setPercentage()
                        return obj;
                    })
                    .catch((err) => {
                        this.setPercentage()
                        this.failed.push(obj)
                        return obj;
                    })
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

    addTotalFunds = async(payment, accountNum, arr) => {
        let amount = payment.replaceAll('$','')                    
        if(arr[accountNum] === undefined){
            arr[accountNum] = Number(amount)
        }else{
            let newTot = arr[accountNum] + Number(amount)
            arr[accountNum] = Number(newTot.toFixed(2))
        }
    }

    savejsonAndReport = async() => {
        try{
            let json = this.data
            let sourceAccs = this.total_funds_source_acc
            let branches = this.total_funds_branch
            let collectionNum = await postLocalApi(json, 'saveFile')
            
            const report = {
                'EmployeeID': collectionNum,
                'sourceAccs': sourceAccs,
                'branches': branches,
                'PaymentStatus': {"status": "pending"}
            }
            let reportID = await postLocalApi(report, `saveReport`)
            return reportID
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