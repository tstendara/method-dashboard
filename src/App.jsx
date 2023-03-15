import './App.css'
import { useState } from 'react'
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
import { Box, LinearProgress } from '@mui/material';

import AlertDialog from './AlertDialog.jsx'
import XmlHandler from './xmlParser.jsx'
import ResponsiveAppBar from './Header.jsx';
import ReportList from './ReportList';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [paymentDisabled, setPaymentDisabled] = useState(true);
  const [loading, setLoading] = useState(0);
  const [disable, setDisable] = useState(false);
  const [reports, setReports] = useState([]);
  const [methodResp, setMethodResp] = useState({});
  const [openAlert, setOpenAlert] = useState(false);

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
    <Box> 
        <h2>Reports</h2>
        <ReportList reports={reports} disable={disable} methodResp={methodResp} />
    </Box>
    </div>
  </>
  );
}
export default Dashboard