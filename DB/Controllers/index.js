const mongoose = require('mongoose');

const EmployeeSchema = require("../Models/EmployeeSchema.js");
const ReportSchema = require("../Models/ReportSchema.js");

const query = 'mongodb+srv://tylers:8ir7D51yjupne4Iz@method.tzciphz.mongodb.net/Method-dashboard';
const db = (query);

mongoose.Promise = global.Promise;
mongoose.connect(db, { useNewUrlParser : true,
    useUnifiedTopology: true }, function(error) {
        if (error) {
            console.log("Error!" + error);
        }
    });
    
let Report = mongoose.model("Report", ReportSchema, "reports")


const saveFile = async(data) => {
    try{
        if(!data) throw new error("No data to save")
        let results = await mongoose.connection.db.listCollections().toArray()
        let employeeNum = results.length
        let newcollectionName = `employee${employeeNum}`
        let Employee = mongoose.model("Employee", EmployeeSchema, newcollectionName)
        await Employee.insertMany(data)
        return results.length
    }
    catch(e){
        console.error(e)
    }
}

const findReport = async(id) => {
    try{
        let report = await Report.findOne({EmployeeID: id})
        return report
    }
    catch(e){
        console.error(e)
    }
}

const saveReport = async (data) => {
    try{
        if(!data) throw new error("No data to save")
        await Report.create(data)
        return true
    }
    catch(e){
        console.error(e)
        return false
    }
}

let getFileById = async (id) => {
    try{
        const Employee = mongoose.model("employee"+id, EmployeeSchema)
        const employeeInfo = await Employee.find()
        return employeeInfo
    }
    catch(e){
        console.log(e)
        throw e;
    }
}

const sortedCollection = async() => {
    try{
        let results = await mongoose.connection.db.listCollections().toArray()

        results = Object.values(results).filter(({name}) => name.slice(0, 8) === "employee" && !isNaN(name[name.length-1]))
        results.sort((obj1, obj2) => {
            if(Number(obj1.name.slice(8)) > Number(obj2.name.slice(8))) return -1;
            if(Number(obj1.name.slice(8)) < Number(obj2.name.slice(8))) return 1;
            return 0;
        })
        return results
    }   
    catch(e){
        console.log(e)
    }
}

module.exports = { saveFile, findReport, saveReport, getFileById, sortedCollection }