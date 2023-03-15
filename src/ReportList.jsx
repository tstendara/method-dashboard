import React, { useState, memo, useMemo } from 'react';
import Button from '@mui/material/Button';

import API from './api/index.js';
const api = new API();

const ReportList = ({ methodResp }) => {
    const [reportList, setReportList] = useState([])

    useMemo(() => {
        api.getFiles().then((resp) => {
            setReportList(resp)
        })
    }, [methodResp])

    const handleID = (id) => {
        api.getReportByID(id).then((resp) => {
          console.log(resp)
        })
    }

    return (
        <>
        {reportList.map(({name}, idx) => {
          let id = name.slice(8, name.length)          
          return (
            <Button key={idx} variant="contained" onClick={() => handleID(id)}>
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