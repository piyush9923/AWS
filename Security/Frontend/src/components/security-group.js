import React, { useState } from 'react';
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
import Box from '@material-ui/core/Box';

// Paramters
const regions = [
  { value: 'eu-west-1', label: 'eu-west-1' },
  { value: 'ap-southeast-1', label: 'ap-southeast-1' },
  { value: 'us-east-1', label: 'us-east-1' }
];
var post_region = ""
var post_sg_grp_name = ""

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



const SelectRegion = () => {
  const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
  });
  const classes = useStyles();
  const [region_select, setRegion] = useState("None");
  const [instances_info, setInstancesInfo] = useState([]);
  const [instances, setInstances] = useState([]);
  const [sg_grp_list, setSgGrpLst] = useState([]);
  const [sg_grp_detail, setSgGrpDetail] = useState([]);
  const [table_row, setTableRow] = useState([]);

  const instancechange = async (event) => {
    let temp_url = "https://gum7dhldfj.execute-api.eu-west-3.amazonaws.com/dev/sg-detail?region="+event.value+"&action=instance_detail";
    setRegion(event.value)
    post_region = event.value;
    // Authorization
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken;
    // console.log(token)
    const headers = {'Authorization': token}
    const response = await fetch(temp_url,{headers});
    const res_json = await response.json();
    const get_instances = res_json.body.instances;
    setInstancesInfo(get_instances)
    var instance_list = [];
    for (var i=0; i<get_instances.length; i++) {
      let temp = {value: get_instances[i].name, label: get_instances[i].name}
      instance_list.push(temp);
    }
    setInstances(instance_list)
    setRegion(event.value)
  };


  const sgchange = (event) => {
    const instance_select = instances_info.filter((instance) => instance.name===event.value);
    var sg_list = [];
    for (var i=0; i<instance_select.length; i++) {
      for (var j=0; j<instance_select[i].security_groups.length; j++) {
        let temp = {value: instance_select[i].security_groups[j].group_id, label: instance_select[i].security_groups[j].group_name};
        sg_list.push(temp);
      }
    }
    setSgGrpLst(sg_list)
  };

  const getSgDeatil = async (event) => {
    post_sg_grp_name = event.value
    let temp_url = "https://gum7dhldfj.execute-api.eu-west-3.amazonaws.com/dev/sg-detail?region="+region_select+"&action=sg_detail&security_grp_id="+event.value;
    // getting token
    // Authorization
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken;
    const headers = {'Authorization': token}
    const response = await fetch(temp_url, {headers});
    const res_json = await response.json();
    const get_sg = res_json.body.security_groups[0];
    setSgGrpDetail(get_sg);
    let sg_temp = []
    get_sg.map((sec_grp) => {
          let fromPort = sec_grp.FromPort;
          let ipProtocol = sec_grp.IpProtocol;
          let toPort = sec_grp.ToPort;
          let ip_list = sec_grp.IpRanges
          // console.log(sec_grp)
          for (var i=0; i<ip_list.length; i++) {
            let ip = ip_list[i].CidrIp
            let desc = null
            if (ip_list[i].Description){
              desc = ip_list[i].Description;
            }
            else{
              desc = '-'
            }
            let data = {fromPort, ipProtocol, ip, desc, toPort};
            sg_temp.push(data)
          }
          return "Done"
        })
      setTableRow(sg_temp);
  };


  return (
    <div>
      <span><h4>Select Region: </h4><Select options={regions} onChange={instancechange} /></span>
      <span><br /><h4>Select Instance: </h4><Select options={instances} onChange={sgchange} /></span>
      <span><br /><h4>Select Security Group: </h4><Select options={sg_grp_list} onChange={getSgDeatil} /></span>
      <h4><br />IP List</h4>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Port</TableCell>
              <TableCell align="center">Protocol</TableCell>
              <TableCell align="center">CIDR Range</TableCell>
              <TableCell align="center">Description</TableCell>
              {/*<TableCell align="right">To Port</TableCell>*/}
            </TableRow>
          </TableHead>
          <TableBody>
            {table_row.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.fromPort}
                </TableCell>
                <TableCell align="center">{row.ipProtocol}</TableCell>
                <TableCell align="center">{row.ip}</TableCell>
                <TableCell align="center">{row.desc}</TableCell>
                {/*<TableCell align="right">{row.toPort}</TableCell>*/}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}




function AddSecurityGroup() {
  const isCidr = require("is-cidr");
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [port, setPort] = useState("");
  const [protocol, setProtocal] = useState("");
  const [cidr, setCidr] = useState("");
  const [cidr_error, setCidrError] = useState(false);
  const [desc, setDesc] = useState("");
  const [use_myip, setUseMyIp] = useState(false);
  const [cidrDisabled, setCidrDisabled] = useState(false);
  
  const protocol_list = [
      { value: '22', label: 'ssh' },
      { value: '80', label: 'http' },
      { value: '443', label: 'https' },
      { value: '', label: 'other' }
    ];

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const onChangeValue = (e) => {
    let event = e.target;
    let action = event.id;
    if (action==='port') {
      setPort(event.value)
    }
    else if (action==='cidr') {
      let cidr_val = event.value;
      let correct_cidr = isCidr.v4(cidr_val);
      if (correct_cidr) {
        setCidrError(false)
        setCidr(cidr_val)
      }
      else if (cidr_val.length === 0) {
        setCidrError(false)
      }
      else {
        setCidrError(true)
      }
      
    }
    else{
      setDesc(event.value)
    }
  }

  const onSelectChangeValue = (e) => {
    setPort(e.value)
    // setProtocal(e.value)
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

  const handleSubmit = async (e) => {
    let final_cidr = cidr;
    if (use_myip === true) {
      var my_ip_res = await publicIp.v4({fallbackUrls: [ "https://ifconfig.co/ip" ]});
      my_ip_res += "/32";
      final_cidr = my_ip_res;
    }
    // Authorization
    const user = await Auth.currentAuthenticatedUser()
    const token = user.signInUserSession.idToken.jwtToken;
    // console.log(protocol)
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token},
        body: JSON.stringify({
                "region": post_region,
                "type": "static",
                "user": user.username,
                "GroupId": post_sg_grp_name,
                "IpList": [
                  {
                    "IpProtocol": "tcp",
                    "FromPort": parseInt(port),
                    "ToPort": parseInt(port),
                    "IpRanges": [
                      {
                        "CidrIp": final_cidr,
                        "Description": desc
                      }
                    ]
                  }
                ]
              })
    };
  
    // console.log(requestOptions)
    // console.log(final_cidr)

    const response = await fetch('https://gum7dhldfj.execute-api.eu-west-3.amazonaws.com/dev/add-sg', requestOptions);
    // console.log(res_json)
    const res_json = await response.json();
    if (res_json.statusCode === 200) {
      // console.log(res_json)
      setOpen(false)
      alert("Saved");
    }
    else {
      alert("Something went wrong");
    }
  }

  


  return (
    <React.Fragment>
      <br />
      <Button variant="outlined" color="primary" onClick={handleClickOpen}>
        Add IP
      </Button>
      <Dialog
        maxWidth="lg"
        open={open}
        onClose={handleClose}
        aria-labelledby="add-security-group"
      >
        <DialogTitle id="add-security-group-title">Add IP</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Fill the form with the details to add the IP.
          </DialogContentText>
          <form className={classes.form} noValidate>
            <FormControl className={classes.formControl}>
              <span>
                <Select options={protocol_list} onChange={onSelectChangeValue} label="Protocol" />
                <TextField
                  autoFocus
                  margin="dense"
                  id="port"
                  label="Port"
                  type="number"
                  value={port}
                  onChange={onChangeValue}
                  fullWidth
                />
                <TextField
                  autoFocus
                  margin="dense"
                  id="cidr"
                  label="CIDR Range"
                  type="text"
                  onChange={onChangeValue}
                  disabled = {(cidrDisabled)? "disabled" : ""}
                  helperText={cidr_error ? "Make sure that CIDR is in this format ex: 'X.X.X.X/32'" : ""}
                  error={cidr_error}
                  fullWidth
                />
                <TextField
                  autoFocus
                  margin="dense"
                  id="description"
                  label="Desription"
                  type="text"
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
const UseEffectBasics = () => {
  return (<Box color="text.primary" className='container' style={{maxWidth: "80%"}}>
            <SelectRegion />
            <AddSecurityGroup />
          </Box>
        );
};

export default UseEffectBasics;
