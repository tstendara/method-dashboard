import React, { useState, memo, useMemo } from 'react';
import Button from '@mui/material/Button';

import { csvFormat } from './utils/createCSV.js';
import API from './api/index.js';
const api = new API();

const ReportList = ({ methodResp }) => {
    const [reportList, setReportList] = useState([])

    useMemo(() => {
        api.getFiles().then((resp) => {
            setReportList(resp)
        })
    }, [methodResp])

    const handleDownload = (id) => {
        api.getReportByID(id).then(async(resp) => {
            let csvArray = await csvFormat(resp)
            const blob = new Blob([csvArray], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob)       
            const a = document.createElement('a')
            a.setAttribute('href', url)
            a.setAttribute('download', `employeeList${id}.csv`);
            a.click()
        })
    }

    return (
        <>
        {reportList.map(({name}, idx) => {
            let id = name.slice(8, name.length)          
            return (
            <Button key={idx} variant="contained" onClick={() => handleDownload(id)}>
                {name}
            </Button>
            )})
        }
        </>
    )
}

const compareProps = (prevProps, nextProps) => {
    return prevProps.methodResp === nextProps.methodResp
}
export default memo(ReportList, compareProps);