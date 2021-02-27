import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import SecurityIcon from '@material-ui/icons/Security';
import AppsIcon from '@material-ui/icons/Apps';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import WhatshotIcon from '@material-ui/icons/Whatshot';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import {Auth} from "aws-amplify";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: 'auto',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function App() {
  const classes = useStyles();
  async function signOut() {
    try {
      await Auth.signOut();
      window.location.reload();
    } catch (error) {
      console.log('error signing out: ', error);
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Integra Tech
          </Typography>
          <Button color="inherit" onClick={signOut} style={{position: "absolute", right: 0, marginRight: "3rem"}}>Sign Out</Button>
        </Toolbar>
      </AppBar>
      <Drawer
        className={classes.drawer}
        variant="permanent"
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <List>
            <Link to="/">
              <ListItem button key="Home">
                <ListItemIcon><AppsIcon /></ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>
            </Link>
            <Link to="/security-group">
              <ListItem button key="securityGroup">
                <ListItemIcon><SecurityIcon /></ListItemIcon>
                <ListItemText primary="Security Group" />
              </ListItem>
            </Link>
            <Link to="/waf">
              <ListItem button key="WAF">
                <ListItemIcon><WhatshotIcon /></ListItemIcon>
                <ListItemText primary="WAF" />
              </ListItem>
            </Link>
          </List>
          <Divider />
        </div>
      </Drawer>
      {/*<main className={classes.content}>*/}
      {/*  <Toolbar />*/}
      {/*  <h1>Content</h1>*/}
      {/*</main>*/}
    </div>
  );
}
