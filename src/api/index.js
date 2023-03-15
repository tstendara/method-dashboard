import axios from 'axios';

export default class API {
    constructor() {
        this.axios = axios.create({
            baseURL: 'http://localhost:3000',
            timeout: 1000,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    getFiles = async () => {
        const response = await this.axios.get('/allFiles');
        return response.data;
    }

    getReportByID = async (id) => {
        const response = await this.axios.get(`/report/${id}`);
        console.log(response.data);
        return response.data;
    }
}


