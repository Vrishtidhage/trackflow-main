import { useContext, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  Box,
  Stack,
  Container,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import { canManageProjects, getTokenPayload, isAdminUser } from "../utils/auth";
import { AuthContext } from "../contexts/AuthContext";
import { SURFACE } from "../theme/visuals";

const COLORS = {
  border: SURFACE.line,
  textPrimary: SURFACE.ink,
  textSecondary: SURFACE.muted,
  accent: SURFACE.primary,
};

export default function Navbar({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { setUser } = useContext(AuthContext);
  const tokenPayload = getTokenPayload();
  const isLoggedIn = Boolean(tokenPayload);
  const isAdmin = isAdminUser(tokenPayload);
  const canCreateProjects = canManageProjects(tokenPayload);

  const navLinks = [
    isLoggedIn ? { label: "Dashboard", path: "/dashboard" } : null,
    isLoggedIn ? { label: "Projects", path: "/projects" } : null,
    isLoggedIn ? { label: "My Bugs", path: "/my-bugs" } : null,
    isLoggedIn ? { label: "Profile", path: "/profile" } : null,
    isAdmin ? { label: "Admin", path: "/admin" } : null,
  ].filter(Boolean);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleNavigate = useCallback(
    (path) => {
      navigate(path);
      setOpen(false);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/");
    setOpen(false);
  }, [navigate, setUser]);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: "#ffffff",
          backdropFilter: "blur(18px)",
          color: COLORS.textPrimary,
          borderBottom: `1px solid ${COLORS.border}`,
          boxShadow: "0 12px 36px rgba(16, 24, 40, 0.06)",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              height: 64,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* LOGO */}
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                textDecoration: "none",
                color: COLORS.textPrimary,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  background: "linear-gradient(135deg, #2563eb, #0f172a)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 24px rgba(37, 99, 235, 0.28)",
                }}
              />
              TrackFlow
            </Typography>

            {/* DESKTOP */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: isActive(link.path)
                      ? COLORS.accent
                      : COLORS.textSecondary,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    px: 2,
                    borderRadius: "8px",
                    bgcolor: isActive(link.path) ? "#eff6ff" : "transparent",
                    "&:hover": {
                      bgcolor: "#eff6ff",
                      color: COLORS.accent,
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}

              {canCreateProjects && (
                <Button
                  startIcon={<AddBoxOutlinedIcon fontSize="small" />}
                  onClick={() => navigate("/projects/new")}
                  sx={{
                    color: "#ffffff",
                    bgcolor: COLORS.accent,
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    mr: 2,
                    borderRadius: "8px",
                    boxShadow: "0 10px 18px rgba(37, 99, 235, 0.18)",
                    "&:hover": { bgcolor: "#1d4ed8" },
                  }}
                >
                  New Project
                </Button>
              )}

              {children && <Box>{children}</Box>}

              {!isLoggedIn && (
                <>
                  <Button
                    onClick={() => navigate("/login")}
                    sx={{
                      color: COLORS.textSecondary,
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      borderRadius: "8px",
                      "&:hover": { bgcolor: "#eff6ff", color: COLORS.accent },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/register")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      borderRadius: "8px",
                      boxShadow: "0 10px 18px rgba(37, 99, 235, 0.18)",
                    }}
                  >
                    Register
                  </Button>
                </>
              )}

              {isLoggedIn && (
                <Button
                  onClick={handleLogout}
                  sx={{
                    color: COLORS.textSecondary,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    "&:hover": { bgcolor: "#f9fafb" },
                  }}
                >
                  Logout
                </Button>
              )}
            </Box>

            {/* MOBILE BUTTON */}
            <IconButton
              sx={{
                display: { xs: "flex", md: "none" },
                color: COLORS.textPrimary,
              }}
              onClick={() => setOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* DRAWER */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            borderLeft: `1px solid ${COLORS.border}`,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography fontWeight={800}>TrackFlow</Typography>

            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Stack spacing={1}>
            {navLinks.map((link) => (
              <Button
                key={link.path}
                fullWidth
                onClick={() => handleNavigate(link.path)}
                sx={{
                  justifyContent: "flex-start",
                  color: isActive(link.path)
                    ? COLORS.accent
                    : COLORS.textSecondary,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                {link.label}
              </Button>
            ))}

            {canCreateProjects && (
              <Button
                fullWidth
                onClick={() => handleNavigate("/projects/new")}
                sx={{
                  justifyContent: "flex-start",
                  color: COLORS.textSecondary,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                New Project
              </Button>
            )}

            {children && <Box py={2}>{children}</Box>}

            {!isLoggedIn && (
              <>
                <Button
                  fullWidth
                  onClick={() => handleNavigate("/login")}
                  sx={{
                    justifyContent: "flex-start",
                    color: COLORS.textSecondary,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                  }}
                >
                  Login
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleNavigate("/register")}
                  sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 800, py: 1.5 }}
                >
                  Register
                </Button>
              </>
            )}

            {isLoggedIn && (
              <Button
                fullWidth
                onClick={handleLogout}
                sx={{
                  justifyContent: "flex-start",
                  color: COLORS.textSecondary,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                }}
              >
                Logout
              </Button>
            )}
          </Stack>
        </Box>
      </Drawer>

      {/* SPACER */}
      <Toolbar />
    </>
  );
}
