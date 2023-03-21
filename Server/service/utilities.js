const postApi = async(payload, endpoint) => {
    return new Promise(async(resolve, reject) => {
        let response =  await fetch(`https://dev.methodfi.com/${endpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer sk_YJ734xX83WT3MBRyA3EezdAP', //P
                'Content-Type': 'application/json'
            },
                body: payload
                // timeout: 5000
        }).catch((e) => reject(e))
        try {
            let results = await response.json()
            resolve(results)
        }
        catch(e){
            console.log(e, '| Response: ', '\n payload: ', payload)
            reject(e)
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
        try {
            let {data:{id}} = await postApi(body, 'accounts')
            resolve(id)
        }
        catch(e){
            reject(e)
        }
    })
}

const createSrcEntity = async({ ABARouting, AccountNumber, entity_id }) => {
    return new Promise(async (resolve, reject) => {
        let [routingNumber, accountNumber, entityid] = [ABARouting[0], AccountNumber[0], entity_id]
        console.log('\n', routingNumber, accountNumber, entityid, '\n')
        let body = JSON.stringify({
            'holder_id': entityid,
            'ach': {
                'routing': routingNumber,
                'number': accountNumber,
                'type': 'checking'
            }
        })
        console.log('before: ', body)
        try {
            let {data:{id}} = await postApi(body, 'accounts')
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
            let {data: {id}} = await postApi(body, 'entities')
            resolve(id)
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

module.exports = { postLocalApi, createEntity, createSrcEntity, createDestinationEntity, postApi }