import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import image from './method.png'

const styles = {
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: 2,
  },
  title: {
    flexGrow: 1,
  },
  avatar: {
    marginLeft: 2,
  },
};

const ResponsiveAppBar = () => {
  return (
    <div style={styles.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" style={styles.menuButton} color="inherit" aria-label="menu">
            <img src={image} alt="Logo" height="30" />
          </IconButton>
          <Typography variant="h6" style={styles.title}>
            Loan repayment System
          </Typography>
          <Button color="inherit">Report</Button>
          <Avatar alt="User Avatar" src="/path/to/avatar.jpg" style={styles.avatar} />
        </Toolbar>
      </AppBar>
    </div>
  );
}
export default ResponsiveAppBar;