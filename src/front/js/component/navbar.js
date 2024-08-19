import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import BarChartIcon from '@mui/icons-material/BarChart';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
	const navigate = useNavigate();
	const handleLogout = () => {
	  localStorage.removeItem('access_token');
	  navigate('/login');
	};	
  return (
    <Drawer
      anchor="left" 
      variant="permanent" 
    >
	
	
      <Toolbar />
      <List>
        <ListItem button key="Home" onClick={() => navigate('/dashboard')}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button key="Profile" onClick={() => navigate('/profile')}>
          <ListItemIcon><PersonIcon /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem button key="Habits" onClick={() => navigate('/habits')}>
          <ListItemIcon><CheckBoxIcon /></ListItemIcon>
          <ListItemText primary="Habits" />
        </ListItem>
        <ListItem button key="Reports" onClick={() => navigate('/reports')}>
          <ListItemIcon><BarChartIcon /></ListItemIcon>
          <ListItemText primary="Reports" />
        </ListItem>
        <ListItem button key="Quotes" onClick={() => navigate('/quotes')}>
          <ListItemIcon><FormatQuoteIcon /></ListItemIcon>
          <ListItemText primary="Quotes" />
        </ListItem>
        <ListItem button key="Log out" onClick={handleLogout}>
          <ListItemIcon><ExitToAppIcon /></ListItemIcon>
          <ListItemText primary="Log out" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Navbar;
