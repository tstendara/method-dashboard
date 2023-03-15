import axios from 'axios';

export default class API {
    constructor() {
        this.axios = axios.create({
            baseURL: 'http://localhost:3000'
        });
    }

    getFiles = async () => {
        try{
            const response = await this.axios.get('/allFiles');
            return response.data;
        }
        catch(err){
            console.log(err)
        }
    }

    getReportByID = async (id) => {
        try{
            const response = await this.axios.get(`/report/${id}`);
            return response.data;
        }
        catch(err){
            console.log(err)
        }
    }
}


