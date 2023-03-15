import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import axios from 'axios'

import WorkerBuilder from './worker/woker-builder';
import Worker from './worker/Method.worker.js';
import './xmlParser.css'

const instance = new WorkerBuilder(Worker);

const XmlHandler = ({ setData, setPaymentDisabled, setLoading, setMethodResponse }) => {
  const [reportDisbaled, setReportDisabled] = useState(true);
  
  useEffect(() => {
    instance.onmessage = (e) => {
      let { loading, funds_sourceAccs, funds_branches, totalAmount } = e.data

      if(!funds_sourceAccs && !funds_branches && !totalAmount){
        setLoading(loading)
      }else{
        setPaymentDisabled(false)
        setLoading(0)
        setMethodResponse({funds_sourceAccs, funds_branches, totalAmount})
        console.log(funds_sourceAccs, '\n', funds_branches, '\n', totalAmount)
      }
    };
  })

  const handleFile = async(e) => {
    setReportDisabled(true)
    setPaymentDisabled(true)
    const data = new FormData();
    const file = e.target.files[0];

    data.append('file', file, file.name)

    let config = {
      headers: {
          'Content-Type': 'multipart/form-data',
          'Access-Control-Allow-Origin': '*'
      }
    }

    await axios.post("http://localhost:3000/XmlToJson", data, config)
    .then(({data}) => {
      console.log('file uploaded successfully');
      setData(data)
      instance.postMessage({'data': data});
    })
    .catch(err => console.log(err))  
  };

  const createReport = () => {
    console.log('create report');
  };

  return (
    <div className="xml-handler">
      <input className="file-upload" type="file" onChange={handleFile} />
      <Button variant="contained" onClick={createReport} disabled={reportDisbaled}>
        Create report
      </Button>
    </div>
  );
};

export default XmlHandler;