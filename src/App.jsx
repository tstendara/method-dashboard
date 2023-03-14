import './App.css'
import { useState, useEffect } from 'react'
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import { Alert, Box, LinearProgress } from '@mui/material';

import AlertDialog from './AlertDialog.jsx'
import XmlHandler from './xmlParser.jsx'
import ResponsiveAppBar from './Header.jsx';

function Dashboard() {
  const [data, setData] = useState([]);
  const [paymentDisabled, setPaymentDisabled] = useState(true);
  const [loading, setLoading] = useState(0);
  const [disable, setDisable] = useState(false);
  const [reports, setReports] = useState([{'name': 'report1'}, {'name': 'report2'}]);
  const [methodResp, setMethodResp] = useState({});
  const [openAlert, setOpenAlert] = useState(false);
  
  // useEffect(() => {
  //   // get reports from db
  //   // setReports(reports)
  // }, [])

  const handlePaymentSummary = async() => setOpenAlert(true)
  
  return (
  <>
    <ResponsiveAppBar />
    <div className="container">
    <h1>Dashboard</h1>
    {loading !== 0 ?
    <LinearProgress 
    variant="determinate"
    value={loading}
    /> : null
    }
    {/* <AlertDialog /> */}
    <Button variant="contained" onClick={handlePaymentSummary} disabled={paymentDisabled}>
        Submit payment
      </Button>
      {
        openAlert ? 
        <AlertDialog methodResponse={methodResp} openAlert={openAlert} setOpenAlert={setOpenAlert} />
        : null
      }
    <div style={{ height: 500, width: '100%', marginBottom: 15, color: 'red' }}>
      <DataGrid
      initialState={{
        sorting: {
          sortModel: [{ field: 'age', sort: 'asc' }],
        }
      }}
        columns={[{ field: 'employee', minWidth: 15, align: 'center' }, {field: 'payor'}, { field: 'amount' }]}
        sortingOrder={['desc', 'asc']}
        rows={data.map(({Employee, Payor, Payee, Amount},idx) => {
          return {
              id: idx,
              employee: Employee[0].FirstName + " " + Employee[0].LastName,
              payor: Payor[0].Name,
              amount: Amount[0]
          }
      })}
        sx={{
          boxShadow: 2,
          border: 2,                 
          borderColor: 'primary.light',
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
        }}
      />
    </div>
    <XmlHandler setData={setData} setPaymentDisabled={setPaymentDisabled} setLoading={setLoading} setDisable={setDisable} setMethodResponse={setMethodResp} />
    <Box> {/* create list of reports here  */}
        <h2>Reports</h2>
        {reports.map(({name}, idx) => {
          // use idx to grab report data from /report/:id 
          return (
            <Button key={idx} variant="contained" onClick={() => console.log('oi')} disabled={disable}>
              {name}
            </Button>
          )})}
    </Box>
    </div>
  </>
  );
}

// create a new file xmlHandler.js in src folder that contains a react component that will convert xml file to json file


export default Dashboard
