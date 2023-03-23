const postApi = async(payload, endpoint) => {
    return new Promise(async(resolve, reject) => {
        let response =  await fetch(`https://dev.methodfi.com/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + process.env.METHOD_API, 
                'Content-Type': 'application/json'
            },
                body: payload
        }).catch((e) => reject(e))
        try {
            let results = await response.json()
            resolve(results)
        }
        catch(e){
            reject(e)
        }
    })
}

const createDestinationEntity = async({ entity_id }, { mch_id, AccountNumber }) => {
    return await new Promise(async (resolve, reject) => {
        let [entityID, mchID, accountNumber] = [entity_id, mch_id, AccountNumber[0]]
        let body = JSON.stringify({
            'holder_id': entityID,
            'liability': {
                'mch_id': mchID,
                'account_number': accountNumber
            }
        })
        try {
            let results = await postApi(body, 'accounts')
            if(!results.success) reject('destination entity failed')
            let {data:{id}} = results
            resolve(id)
        }
        catch(e){
            reject(e)
        }
    })
}

const createSrcEntity = async({entity_id}, { AccountNumber, RoutingNumber}) => {
    return new Promise(async (resolve, reject) => {
        let body = JSON.stringify({
            'holder_id': entity_id,
            'ach': {
                'routing': RoutingNumber,
                'number': AccountNumber,
                'type': 'checking'
            }
        })
        try {
            let results = await postApi(body, 'accounts')
            if(!results.success) reject('source entity failed')
            let {data:{id}} = results
            resolve(id)
        }
        catch(e){
            reject(e)
        }
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
        try {
            let results = await postApi(body, 'entities')
            if(!results.success) reject('user entity failed')
            let {data: {id}} = results
            resolve(id)
        }
        catch(e){
            reject(e)
        }
    })
} 

const submitPayment = async({ mch_id, dest_id }, amount) => {
    return new Promise(async (resolve, reject) => {
        let body = JSON.stringify({
            'amount': amount,
            'source': mch_id,
            'destination': dest_id,
            'description': 'Loan Pmt'
        })
        try {
            let results = await postApi(body, 'payments')
            if(!results.success) {
                console.log('payload: ', body)
                console.log('results: ', results)
                reject('Payment Failed')
            }
            resolve('Payment Successful')
        }
        catch(e){
            reject(e)
        }
    })
}

const postLocalApi = async(payload, endpoint) => {
    return new Promise(async(resolve, reject) => {
        let response =  await fetch(`http://localhost:3000/${endpoint}`, {
            headers: {
            'Content-Type': 'application/json'
        },
            method: 'POST',
            body: JSON.stringify(payload)
        }).catch((err) => console.log(err))
        try {
            let results = await response.json()
            resolve(results)
        }
        catch(e){
            console.log(e)
            reject(e)
        }
    })
}

module.exports = { postLocalApi, createEntity, createSrcEntity, createDestinationEntity, postApi, submitPayment }