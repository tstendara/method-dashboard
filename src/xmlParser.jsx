import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import axios from 'axios'
import './xmlParser.css'

const XmlHandler = ({ setData, setPaymentDisabled, setLoading, setMethodResponse, socket }) => {
  const [isFileCreated, setIsFileCreated] = useState(false);

  useEffect(() => {
    socket.on('progress', (data) => {
      console.log(data)
      setLoading(data)
    })

    socket.on('finished', data => {
      console.log('finished')
      console.log(data)
      setPaymentDisabled(false)
      setLoading(0)
      setMethodResponse(data)
    })
  }, [isFileCreated])
            
  const handleFile = async(e) => {
    setPaymentDisabled(true)
    const fileData = new FormData();
    const file = e.target.files[0];
    
    fileData.append('file', file, file.name)
    
    let config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Access-Control-Allow-Origin': '*'
      }
    }
    
    let { data } = await axios.post("http://localhost:3000/XmlToJson", fileData, config).catch(err => console.log(err))  
    console.log('file uploaded successfully');
    
    axios.post("http://localhost:3000/processRawData", data)
    .then(({data}) => {
      setData(data)
      // console.log(data)
      socket.emit('start', 'starting')
      setIsFileCreated(true)
    })
    .catch(err => console.log(err))    
  };

  return (
    <div className="xml-handler">
      <input className="file-upload" type="file" onChange={handleFile} />
    </div>
  );
};

export default XmlHandler;