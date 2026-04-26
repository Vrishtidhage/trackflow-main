import { useContext, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Grid,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { api } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import { AuthContext } from "../contexts/AuthContext";
import { isAdminUser } from "../utils/auth";
import { IMAGES, SURFACE } from "../theme/visuals";

const COLORS = {
  primary: "#2563eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
};

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMode(location.pathname === "/register" ? "register" : "login");
    setSuccess(location.state?.message || null);
  }, [location.pathname, location.state]);

  const loginWithCredentials = useCallback(
    async (loginEmail, loginPassword) => {
      const params = new URLSearchParams();
      params.append("username", loginEmail.trim().toLowerCase());
      params.append("password", loginPassword);

      const response = await api.post("/auth/login", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const token =
        response.data?.access_token || response.data?.data?.access_token;

      if (!token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("accessToken", token);
      const payload = jwtDecode(token) || null;
      setUser(payload);
      navigate(isAdminUser(payload) ? "/admin" : "/dashboard");
    },
    [navigate, setUser]
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password) {
        setError("Please enter email and password");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      if (mode === "register" && password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        if (mode === "register") {
          await api.post("/users", { email: normalizedEmail, password });
          setEmail(normalizedEmail);
          setPassword("");
          setConfirmPassword("");
          setMode("login");
          navigate("/login", {
            replace: true,
            state: { message: "Registration successful. Please log in to continue." },
          });
          setSuccess("Registration successful. Please log in to continue.");
          return;
        }

        await loginWithCredentials(normalizedEmail, password);
      } catch (err) {
        const backendError = err.response?.data || {};
        setError(
          backendError?.message ||
            backendError?.detail ||
            err.message ||
            (mode === "register" ? "Registration failed" : "Login failed")
        );
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    [email, password, confirmPassword, mode, loginWithCredentials, navigate, setUser]
  );

  return (
    <PageWrapper
      showNavbar={false}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Fade in timeout={600}>
        <Grid container sx={{ width: "100%", maxWidth: 1120, borderRadius: 4, overflow: "hidden", boxShadow: "0 28px 80px rgba(16, 24, 40, 0.18)" }}>
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{
              minHeight: { xs: 280, md: 640 },
              p: 4,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              color: "#fff",
              backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.18), rgba(15,23,42,0.88)), url(${IMAGES.auth})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <Chip label="Secure team workspace" sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.92)", fontWeight: 800 }} />
            <Box>
              <Typography variant="h3" fontWeight={900} sx={{ maxWidth: 440 }}>
                Ship cleaner software with every bug in view.
              </Typography>
              <Typography mt={2} sx={{ color: "#dbeafe", maxWidth: 430 }}>
                Track projects, assign issues, review history, and keep admin tools separate from user workflows.
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ bgcolor: "#ffffff", display: "flex", alignItems: "center" }}>
            <Box sx={{ width: "100%", p: { xs: 3, md: 6 } }}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" sx={{ color: SURFACE.primary, fontWeight: 900 }}>
                  {mode === "login" ? "Sign in" : "Register"}
                </Typography>
                <Typography variant="h4" fontWeight={900} color={COLORS.textPrimary}>
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </Typography>

                <Typography variant="body2" color={COLORS.textSecondary} mt={1}>
                  {mode === "login"
                    ? "Enter your credentials to access your workspace."
                    : "Create your account, then log in to continue."}
                </Typography>
              </Box>

          <Card
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <CardContent sx={{ p: "32px !important" }}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    fullWidth
                    disabled={loading}
                    required
                  />

                  <TextField
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    helperText={mode === "register" ? "Use at least 8 characters" : ""}
                    inputProps={{ minLength: mode === "register" ? 8 : undefined }}
                    fullWidth
                    disabled={loading}
                    required
                  />

                  {mode === "register" && (
                    <TextField
                      label="Confirm password"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      fullWidth
                      disabled={loading}
                      required
                    />
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{ bgcolor: COLORS.primary }}
                  >
                    {loading ? (
                      <CircularProgress size={22} color="inherit" />
                    ) : mode === "login" ? (
                      "Sign in"
                    ) : (
                      "Create account"
                    )}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>
            </Box>
          </Grid>
        </Grid>
      </Fade>
    </PageWrapper>
  );
}
