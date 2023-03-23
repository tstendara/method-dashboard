import { useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const AlertDialog = ({ methodResponse, openAlert, setOpenAlert, setLoading, setPaymentDisabled, socket, setPaymentResp }) => {
  let {totalAmount} = methodResponse

  useEffect(() => {
    socket.on('finishedPayments', data => {
      console.log('finished')
      console.log(data)
      setLoading(0)
      setPaymentResp(data)
    })
  }, [openAlert])

  const handleClose = () => {
    setOpenAlert(false);
  };
  
  const handlePay = () => {
    setOpenAlert(false);
    setPaymentDisabled(true)
    socket.emit('pay', methodResponse)
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  return (
    <>
      <Dialog
        open={openAlert}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Total Employee debt payment: "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {formatCurrency(totalAmount)}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Decline</Button>
          <Button onClick={handlePay} autoFocus>
            Pay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default AlertDialog;