import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const AlertDialog = ({methodResponse, openAlert, setOpenAlert}) => {
  let {totalAmount} = methodResponse

  const handleClose = () => {
    setOpenAlert(false);
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
          <Button onClick={handleClose} autoFocus>
            Pay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
export default AlertDialog;