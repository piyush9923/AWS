import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import publicIp from "public-ip";
import Checkbox from '@material-ui/core/Checkbox';
import { Auth } from 'aws-amplify';

// Paramters
const regions = [
  { value: 'global', label: 'Global (CloudFront)' },
  { value: 'eu-west-1', label: 'eu-west-1' },
  { value: 'ap-southeast-1', label: 'ap-southeast-1' },
  { value: 'us-east-1', label: 'us-east-1' }
  ];

let ip_set_id = "";
var post_region = ""
// dialog theme
const useStyles = makeStyles((theme) => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: 'fit-content',
  },
  formControl: {
    marginTop: theme.spacing(2),
    minWidth: 120,
  },
  formControlLabel: {
    marginTop: theme.spacing(1),
  },
}));



const WafDetails = () => {
  const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
  });
  const classes = useStyles();
  const [ipSetAll, setIpSetList] = useState([]);
  const [ipSetSelected, setIpSetSelected] = useState("");
  const [ipList, setIpList] = useState([]);
  const [table_row, setTableRow] = useState([]);

  const getIpName = async (event) => {
    // Run! Like go get some data from an API.
    setIpSetList("")
    post_region = event.value;
    let temp_url = "https://gum7dhldfj.execute-api.eu-west-3.amazonaws.com/dev/waf-details?region="+event.value+"&action=list_ip_set";
    // Authorization
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken;
    // console.log(token)
    const headers = {'Authorization': token}
    const response = await fetch(temp_url,{headers});
    const res_json = await response.json();
    const raw_ip_set_list = res_json.body;
    var ip_set_list = [];
    for (var i=0; i<raw_ip_set_list.length; i++) {
      let temp = {value: raw_ip_set_list[i]["IPSetId"], label: raw_ip_set_list[i]["Name"]}
      ip_set_list.push(temp);
    }
    setIpSetList(ip_set_list)
  };

  // On page load function
  // useEffect(async  () => {
  //   // Run! Like go get some data from an API.
  //   let temp_url = "https://gum7dhldfj.execute-api.eu-west-3.amazonaws.com/dev/waf-details?action=list_ip_set"
  //   // Authorization
  //   const user = await Auth.currentAuthenticatedUser()
  //   const token = user.signInUserSession.idToken.jwtToken;
  //   // console.log(token)
  //   const headers = {'Authorization': token}
  //   const response = await fetch(temp_url,{headers});
  //   const res_json = await response.json();
  //   const raw_ip_set_list = res_json.body;
  //   var ip_set_list = [];
  //   for (var i=0; i<raw_ip_set_list.length; i++) {
  //     let temp = {value: raw_ip_set_list[i]["IPSetId"], label: raw_ip_set_list[i]["Name"]}
  //     ip_set_list.push(temp);
  //   }
  //   setIpSetList(ip_set_list)
  // }, []);


  const getIpList = async (event) => {
    setIpSetSelected(event.value)
    ip_set_id = event.value
    let temp_url = "https://gum7dhldfj.execute-api.eu-west-3.amazonaws.com/dev/waf-details?action=get_ips&region="+post_region+"&ip_set_id="+event.value;
    // getting token
    // Authorization
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken;
    const headers = {'Authorization': token}
    const response = await fetch(temp_url, {headers});
    const res_json = await response.json();
    const get_ips = res_json.body;
    setIpList(get_ips);
    let ip_temp = []
    get_ips.map((ip) => {
      let type = ip.Type;
      let value = ip.Value;
      let data = {type, value};
      ip_temp.push(data)
      return "Done"
    })
    setTableRow(ip_temp);
  };


  return (
    <div>
      <span><h4>Select Region: </h4><Select options={regions} onChange={getIpName} /></span>
      <span><h4><br />Select Ip Set: </h4><Select options={ipSetAll} onChange={getIpList} /></span>
      <h4><br />WAF Ip selected</h4>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell align="center">IP address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {table_row.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.type}
                </TableCell>
                <TableCell align="center">{row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}




function AddWafIp() {
  const isCidr = require("is-cidr");
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState("");
  const [type, setType] = useState("");
  const [ipEntered, setIpEntered] = useState("");
  const [cidr_error, setCidrError] = useState(false);
  const [use_myip, setUseMyIp] = useState(false);
  const [cidrDisabled, setCidrDisabled] = useState(false);

  const action_list = [
    { value: 'INSERT', label: 'INSERT' },
    { value: 'DELETE', label: 'DELETE' }
  ];

  const type_list = [
    { value: 'IPV4', label: 'IPv4' },
    { value: 'IPV6', label: 'IPv6' }
  ];
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onChangeValue = (e) => {
    let cidr_val = e.target.value;
    let correct_cidr = isCidr.v4(cidr_val);
    if (correct_cidr) {
      setCidrError(false)
      setIpEntered(cidr_val)
    }
    else if (cidr_val.length === 0) {
      setCidrError(false)
    }
    else {
      setCidrError(true)
    }
  }

  const changeAction = (e) => {
    setAction(e.value)
  }

  const changeType = (e) => {
    setType(e.value)
  }

  const setMyip = (event) => {
    setUseMyIp(event.target.checked)
    if (event.target.checked) {
      setCidrDisabled(true)
    }
    else {
      setCidrDisabled(false)
    }

  }

  const handleSubmit = async () => {
    let final_cidr = ipEntered;
    if (use_myip === true) {
      let my_ip_res = await publicIp.v4({fallbackUrls: [ "https://ifconfig.co/ip" ]});
      my_ip_res += "/32";
      final_cidr = my_ip_res;
    }
    // Authorization
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken;
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': token},
      body: JSON.stringify({
        "ip_set_id": ip_set_id,
        "Action": action,
        "region": post_region,
        "user": user.username,
        "IPSetDescriptor": {
          "Type": type,
          "Value": final_cidr
        }
      })
    };


    const response = await fetch('https://gum7dhldfj.execute-api.eu-west-3.amazonaws.com/dev/waf-details/add', requestOptions);
    const res_json = await response.json();
    if (res_json.statusCode === 200) {
      // console.log(res_json)
      setOpen(false)
      alert("Saved");
    }
    else {
      console.log(res_json)
      alert("Something went wrong");
    }

  }


  return (
    <React.Fragment>
      <br />
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Add/Delete WAF IP
      </Button>
      <Dialog
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        aria-labelledby="add-waf-ip"
      >
        <DialogTitle id="add-waf-ip-title">Add IP</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill the form with the details to add the IP.
          </DialogContentText>
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <span>
                <Select options={action_list} onChange={changeAction} label="Action" />
                <Select options={type_list} onChange={changeType} label="IP Type" />
                <TextField
                  autoFocus
                  margin="dense"
                  id="ip_value"
                  label="Ip Value"
                  type="text"
                  disabled = {(cidrDisabled)? "disabled" : ""}
                  helperText={cidr_error ? "Make sure that CIDR is in this format ex: 'X.X.X.X/32'" : ""}
                  error={cidr_error}
                  onChange={onChangeValue}
                  fullWidth
                />
              </span>
              <FormControlLabel
                className={classes.formControlLabel}
                control={<Checkbox checked={use_myip} onChange={setMyip} />}
                label="Use My IP"
              />
            </FormControl>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Close
              </Button>
              <Button onClick={handleSubmit} color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>

      </Dialog>
    </React.Fragment>
  );
}





// Component
const Waf = () => {
  return (<div className='container'>
      <WafDetails />
      <AddWafIp />
    </div>
  );
};

export default Waf;
