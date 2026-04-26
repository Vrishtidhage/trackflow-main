import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { api } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import { AuthContext } from "../contexts/AuthContext";
import { IMAGES, SURFACE } from "../theme/visuals";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("username", email.trim().toLowerCase());
      params.append("password", password);

      const response = await api.post("/auth/admin-login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = response.data?.access_token || response.data?.data?.access_token;
      if (!token) throw new Error("Token not received");

      localStorage.setItem("accessToken", token);
      setUser(jwtDecode(token) || null);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Admin login failed");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper showNavbar={false} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Grid container sx={{ width: "100%", maxWidth: 1040, borderRadius: 4, overflow: "hidden", boxShadow: "0 28px 80px rgba(16, 24, 40, 0.18)" }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            minHeight: { xs: 260, md: 560 },
            p: 4,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.92)), url(${IMAGES.admin})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Chip label="Admin control center" sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.92)", fontWeight: 800 }} />
          <Box>
            <Typography variant="h3" fontWeight={900}>Operational visibility</Typography>
            <Typography mt={2} sx={{ color: "#dbeafe" }}>
              Review users, roles, activity, and global bug health from a protected admin workspace.
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={{ bgcolor: "#fff", display: "flex", alignItems: "center" }}>
          <Box sx={{ width: "100%", p: { xs: 3, md: 6 } }}>
            <Typography variant="overline" sx={{ color: SURFACE.primary, fontWeight: 900 }}>
              Restricted access
            </Typography>
            <Typography variant="h4" fontWeight={900} mb={1}>
              Admin Login
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Sign in with an admin account to manage TrackFlow.
            </Typography>

            <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
              <CardContent sx={{ p: "28px !important" }}>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  type="text"
                  label="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Login"}
                </Button>
              </Stack>
            </form>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}
