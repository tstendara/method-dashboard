import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function AlertDialog({methodResponse, openAlert, setOpenAlert}) {
  // const [open, setOpen] = React.useState(openAlert);
  console.log(methodResponse)
  let {totalAmount} = methodResponse
  // totalAmount = 10000
  React.useEffect(() => {
    console.log('should render')
  })

  const handleClickOpen = () => {
    setOpenAlert(true);
  };

  const handleClose = () => {
    setOpenAlert(false);
  };

  // function to rewrite total amount to currency format
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  return (
    <div>
      {/* <Button variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </Button> */}
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
    </div>
  );
}