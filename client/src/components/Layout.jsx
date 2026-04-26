import { Box, Drawer, List, ListItem, ListItemText, Toolbar, AppBar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { getTokenPayload, isAdminUser } from "../utils/auth";

const drawerWidth = 220;

export default function Layout({ children }) {
  const isAdmin = isAdminUser(getTokenPayload());

  return (
    <Box sx={{ display: "flex" }}>

      {/* Top Navbar */}
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6">TrackFlow</Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          [`& .MuiDrawer-paper`]: { width: drawerWidth }
        }}
      >
        <Toolbar />
        <List>
          <ListItem button component={Link} to="/projects">
            <ListItemText primary="Projects" />
          </ListItem>

          {isAdmin && (
            <ListItem button component={Link} to="/dashboard">
              <ListItemText primary="Dashboard" />
            </ListItem>
          )}

          <ListItem button component={Link} to="/code-runner">
            <ListItemText primary="AI Runner" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
