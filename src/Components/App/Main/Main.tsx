import React, { useContext, useState } from "react";
import { Navigate, Outlet } from 'react-router';
import { observer } from "mobx-react";
import { AppBar, Avatar, Badge, Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemAvatar, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Pagination, TextField, Toolbar, Typography } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AccountCircle, Search } from "@mui/icons-material";
import SettingsIcon from '@mui/icons-material/Settings';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import RestoreIcon from '@mui/icons-material/Restore';
import Grid from '@mui/material/Grid';
import { ApplicationContext } from "../../../Store/ApplicationStore";
import SessionRedirector from "../../Common/SessionRedirector";


export const Main = observer(() => {
  const store = useContext(ApplicationContext);
  const [ userPanelVisible, setUserPanelVisible ] = useState(false);
  const [ drawerVisible, toggleDrawer ] = useState(false);
  const logout = () => {
    store.session.logout();
    setUserPanelVisible(false);
  }
  let anchorEl = null;
  return (
    <div className="Main">
      <SessionRedirector></SessionRedirector>
      <Drawer open={drawerVisible} onClose={() => toggleDrawer(false)}>
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          <nav>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <RestoreIcon />
                  </ListItemIcon>
                  <ListItemText primary="History" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <QueueMusicIcon />
                  </ListItemIcon>
                  <ListItemText primary="Playlists" />
                </ListItemButton>
              </ListItem>
            </List>
          </nav>
          <Divider />
          <nav>
            <List>
            </List>
          </nav>
          <Divider />
          <nav>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItemButton>
              </ListItem>
            </List>
          </nav>
        </Box>
      </Drawer>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            onClick={() => toggleDrawer(true)}
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            onClick={(e) => { anchorEl = e.target; setUserPanelVisible(!userPanelVisible) }}
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit">
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={userPanelVisible}
            onClose={() => setUserPanelVisible(false)}>
            <MenuItem onClick={() => setUserPanelVisible(false)}>
              Username
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => logout()}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Outlet />
    </div>
  );
});
