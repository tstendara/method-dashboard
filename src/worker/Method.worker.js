/* eslint-disable */

export default async() => {

    self.onmessage = async(e) => {
        let {data} = e.data
  
        const postApi = async(payload, endpoint) => {
            return new Promise(async(resolve, reject) => {
                let response =  await fetch(`https://dev.methodfi.com/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer sk_fVmhQGAcDJHJdggPhVbDGXYC',
                        'Content-Type': 'application/json'
                    },
                        body: payload,
                        timeout: 0
                }).catch((err) => console.log(err, '| ', payload))
                try {
                    let results = await response.json()
                    if(!results.success) throw new Error('failed to upload')
                    resolve(results)
                }
                catch(e){
                    console.log(e, '| Response: ', results, '\n payload: ', payload)
                }
            })
        }

        const createDestinationEntity = async({ entity_id, mch_id, AccountNumber }) => {
            return await new Promise(async (resolve, reject) => {
                let [entityID, mchID, accountNumber] = [entity_id, mch_id, AccountNumber[0]]
                let body = JSON.stringify({
                    'holder_id': entityID,
                    'liability': {
                        'mch_id': mchID,
                        'account_number': accountNumber
                    }
                })
                let {data:{id}} = await postApi(body, 'accounts')
                if(!id) reject('no id')
                resolve(id)
            })
        }
        
        const createSrcEntity = async({ ABARouting, AccountNumber, entity_id }) => {
            return new Promise(async (resolve, reject) => {
                let [routingNumber, accountNumber, entityid] = [ABARouting[0], AccountNumber[0], entity_id]
                let body = JSON.stringify({
                    'holder_id': entityid,
                    'ach': {
                        'routing': routingNumber,
                        'number': accountNumber,
                        'type': 'checking'
                    }
                })
                let {data:{id}} = await postApi(body, 'accounts')
                if(!id) reject('no id')
                resolve(id)
            })
        };
        
        const createEntity = async({ FirstName, LastName, DOB, PhoneNumber }) => {
            return await new Promise(async (resolve, reject) => {
                let [firstName, lastName, dob, phoneNumber] = [FirstName[0], LastName[0], DOB[0], PhoneNumber[0]]
                let year = dob.slice(dob.length-4)
                let monthDay = dob.slice(0,5)
                dob = `${year}-${monthDay}`
                let body = JSON.stringify({
                    'type': 'individual',
                    'individual': {
                        'first_name': firstName.trim(),
                        'last_name': lastName.trim(),
                        'phone': '+15121231111',
                        'dob': dob
                    }
                })
                let {data: {id}} = await postApi(body, 'entities')
                if(!id) reject('no id')
                resolve(id)
            })
        } 

        const postLocalApi = async(payload, endpoint) => {
            return new Promise(async(resolve, reject) => {
                let response =  await fetch(`http://localhost:3000/${endpoint}`, {
                    headers: {
                    'Content-Type': 'application/json'
                },
                    method: 'POST',
                    body: JSON.stringify(payload),
                    timeout: 0
                }).catch((err) => console.log(err))
                try {
                    let results = await response.json()
                    console.log('saved report!')
                    resolve(results)
                }
                catch(e){
                    console.log(e)
                }
            })
        }
 
    class ApiPosts {
        constructor(data){
            this.data = data,
            this.modifiedData = [],
            this.count = 0,
            this.limit = 1200, //data.length
            this.last = false,
            this.interval = 600, // Rate limit
            this.total_funds_source_acc = {},
            this.total_funds_branch = {},
            this.status_every_payment = [],
            this.totalAmount = 0
        }

        createEntities = async() => {
            await this.postingToApi(this.creatingEntities)
            this.resetCount()
        }
        createSourceAccs = async() => {
            await this.postingToApi(this.creatingSourceEntities)
            this.resetCount()
        }
        createDestinationEntities = async() => {
            await this.postingToApi(this.creatingDestinationEntities)
            this.resetCount()
        }

        resetCount = () => {
            this.count = 0
            this.data = this.modifiedData
            this.modifiedData = []
        }
        
        setPercentage = () => {
            let percent = this.getPercentage()
            postMessage({"loading": percent})
            this.count++
        }

        getPercentage = () => Math.round(100 / this.limit * this.count)

        postingToApi = async(func) => {
            let limit = this.limit 
            let interval = this.interval
            let json = this.data 
            
            while(this.count < limit){
                try{
                    let batch = json.slice(this.count, this.count + interval) 
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
                try{
                    let entities = await batch.map(async(obj, idx) => {
                        let {Employee, Amount} = obj
                        let dunkinId = Employee[0]['DunkinBranch'][0]
                        
                        // report calculations
                        this.addTotalFunds(Amount[0], dunkinId, this.total_funds_branch)

                        let amount = Amount[0].replaceAll('$','')
                        let total = Number(amount) + Number(this.totalAmount)
                        this.totalAmount = Number(total.toFixed(2))

                        let entityId = await createEntity(Employee[0])
                        obj.Payor[0]['entity_id'] = entityId
                        this.setPercentage()
                        return obj
                    })
                    await Promise.all(entities).then((data) => {
                        this.modifiedData.push(...data)
                        resolve()
                    })
                }
                catch(e){
                    console.log(e, ' | ', Employee[0])
                }
            })
        }

        creatingSourceEntities = async(batch) => {
            return await new Promise(async (resolve, reject) => {
                try{
                    let results = await batch.map(async(data,idx) => { 
                        let { Payor, Amount } = data 
                        if (data.Payor[0]['entity_id'] === '') throw new Error('not defined entity_id')
                        let amount = Amount[0]
                        let accountNum = Payor[0].AccountNumber[0]
    
                        // report calculations
                        await this.addTotalFunds(amount, accountNum, this.total_funds_source_acc)

                        let response_id = await createSrcEntity(Payor[0])
                        data.Payor[0]['mch_id'] = response_id
                        this.setPercentage()
                        return data;
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
                    let results = await batch.map(async(data,idx) => { 
                        let { Payor } = data 
                        let response_id = await createDestinationEntity(Payor[0])
                        data.Payor[0]['dest_id'] = response_id
                        this.setPercentage()
                        return data;
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
    }

    try {
        const api = new ApiPosts(data)
        await api.createEntities()
        console.log('Creating source accs')
        new Promise(resolve => setTimeout(resolve, 2000))
        await api.createSourceAccs();
        console.log('Creating destination accs')
        new Promise(resolve => setTimeout(resolve, 2000))
        api.last = true
        await api.createDestinationEntities()
        let reportID = await api.savejsonAndReport()
        postMessage({'reportID': reportID, 'totalAmount': Number(api.totalAmount), 'funds_sourceAccs': api.total_funds_source_acc, 'funds_branches': api.total_funds_branch})
    }
    catch(e){
        console.log(e)
    } 
    }
}