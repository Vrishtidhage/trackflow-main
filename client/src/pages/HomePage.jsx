import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  BarChart3,
  Bug,
  CheckCircle2,
  ClipboardList,
  Lock,
  LogOut,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import { AuthContext } from "../contexts/AuthContext";
import { IMAGES } from "../theme/visuals";
import { getTokenPayload, isAdminUser } from "../utils/auth";

const quickActions = [
  {
    icon: <UserPlus size={22} />,
    title: "User reports",
    text: "Users register, log in, and submit bugs inside their workspace.",
  },
  {
    icon: <ClipboardList size={22} />,
    title: "Admin reviews",
    text: "Admins manage projects, users, roles, analytics, and bug activity.",
  },
  {
    icon: <CheckCircle2 size={22} />,
    title: "Solution shared",
    text: "Admins can publish a solution directly on the reported bug.",
  },
];

const roleItems = [
  ["User", "Report bugs, track your own reports, read admin solutions."],
  ["Admin", "Access both user tools and protected admin controls."],
];

export default function HomePage() {
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);
  const tokenPayload = getTokenPayload();
  const isLoggedIn = Boolean(tokenPayload);
  const isAdmin = isAdminUser(tokenPayload);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    navigate("/");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f6f8fb", color: "#101828" }}>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "rgba(255,255,255,0.95)",
          borderBottom: "1px solid #dbe3ef",
          backdropFilter: "blur(14px)",
        }}
      >
        <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 } }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: { xs: 1.5, md: 0 }, minHeight: { md: 72 }, width: "100%" }}
          >
            <Stack direction="row" spacing={2.5} alignItems="center" flexWrap="wrap">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #2563eb, #14b8a6)",
                  boxShadow: "0 12px 26px rgba(37,99,235,0.24)",
                }}
              />
              <Typography fontWeight={900} fontSize={21}>
                TrackFlow
              </Typography>
              <Button
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                sx={{ textTransform: "none", fontWeight: 800, color: "#475467" }}
              >
                About Us
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="flex-end"
              sx={{ ml: "auto", flexShrink: 0 }}
            >
              {isLoggedIn ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() => navigate(isAdmin ? "/admin" : "/dashboard")}
                    sx={{ textTransform: "none", fontWeight: 900 }}
                  >
                    {isAdmin ? "Admin Dashboard" : "Dashboard"}
                  </Button>
                  <Button
                    startIcon={<LogOut size={17} />}
                    onClick={handleLogout}
                    sx={{ textTransform: "none", fontWeight: 800 }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate("/login")}
                    sx={{ textTransform: "none", fontWeight: 900, color: "#475467" }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate("/register")}
                    sx={{ textTransform: "none", fontWeight: 900, px: 2.5 }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.90), rgba(15,23,42,0.68), rgba(15,23,42,0.28)), url(${IMAGES.productHero})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 7, md: 10 } }}>
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3} sx={{ maxWidth: 760 }}>
                <Chip
                  icon={<ShieldCheck size={16} />}
                  label="Secure bug reporting with admin solutions"
                  sx={{ alignSelf: "flex-start", bgcolor: "rgba(255,255,255,0.92)", fontWeight: 900 }}
                />
                <Typography variant="h1" sx={{ fontSize: { xs: 42, md: 68 }, lineHeight: 1, fontWeight: 900 }}>
                  A simple way to report, track, and solve bugs.
                </Typography>
                <Typography sx={{ color: "#dbeafe", fontSize: { xs: 17, md: 20 }, lineHeight: 1.7 }}>
                  TrackFlow keeps the user side clean and the admin side powerful. Users report issues and follow their own bug history. Admins manage the system and add solution guidance when bugs are reviewed.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight size={18} />}
                    onClick={() => navigate(isLoggedIn ? (isAdmin ? "/admin" : "/dashboard") : "/login")}
                    sx={{ textTransform: "none", fontWeight: 900, px: 3 }}
                  >
                    {isLoggedIn ? "Go to dashboard" : "Get started"}
                  </Button>
                  {!isLoggedIn && (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate("/register")}
                      sx={{ textTransform: "none", fontWeight: 900, px: 3, bgcolor: "#fff", color: "#0f172a", "&:hover": { bgcolor: "#e0f2fe" } }}
                    >
                      Create account
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Card elevation={0} sx={{ borderRadius: 2, border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 28px 80px rgba(0,0,0,0.28)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.25} mb={2}>
                    <BarChart3 size={20} color="#2563eb" />
                    <Typography fontWeight={900}>Today in TrackFlow</Typography>
                  </Stack>
                  <Grid container spacing={1.5}>
                    {[
                      ["Reports", "18"],
                      ["In review", "6"],
                      ["Solved", "12"],
                    ].map(([label, value]) => (
                      <Grid size={{ xs: 4 }} key={label}>
                        <Box sx={{ border: "1px solid #e5e7eb", borderRadius: 2, p: 1.5 }}>
                          <Typography color="text.secondary" fontSize={12}>
                            {label}
                          </Typography>
                          <Typography variant="h4" fontWeight={900}>
                            {value}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: "#f8fafc", border: "1px solid #e5e7eb" }}>
                    <Stack direction="row" spacing={1.25} alignItems="center" mb={1}>
                      <Bug size={18} color="#2563eb" />
                      <Typography fontWeight={900}>Bug reported</Typography>
                    </Stack>
                    <Typography color="text.secondary" fontSize={14}>
                      Payment validation issue reviewed by admin. Solution is now attached to the report.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={2.5}>
          {quickActions.map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.title}>
              <Card elevation={0} sx={{ height: "100%", border: "1px solid #dbe3ef", borderRadius: 2 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ color: "#2563eb", mb: 2 }}>{item.icon}</Box>
                  <Typography fontWeight={900} mb={1}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary">{item.text}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Box component="section" sx={{ bgcolor: "#fff", borderBlock: "1px solid #dbe3ef" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2}>
                <Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 900 }}>
                  Proper Structure
                </Typography>
                <Typography variant="h3" fontWeight={900}>
                  Clear access for every role.
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.7 }}>
                  Users should not see admin dashboards, charts, user management, or role controls. Admins can access the complete app, including user-side reporting and admin-side monitoring.
                </Typography>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2}>
                {roleItems.map(([title, text]) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={title}>
                    <Card elevation={0} sx={{ height: "100%", border: "1px solid #dbe3ef", borderRadius: 2 }}>
                      <CardContent sx={{ p: 3 }}>
                        <Lock size={22} color="#2563eb" />
                        <Typography variant="h5" fontWeight={900} mt={2} mb={1}>
                          {title}
                        </Typography>
                        <Typography color="text.secondary">{text}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container id="about" maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                minHeight: 320,
                borderRadius: 2,
                backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.58)), url(${IMAGES.workspace})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 24px 70px rgba(16,24,40,0.14)",
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2}>
              <Typography variant="overline" sx={{ color: "#2563eb", fontWeight: 900 }}>
                About TrackFlow
              </Typography>
              <Typography variant="h3" fontWeight={900}>
                Built for simple reporting and accountable resolution.
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: 17, lineHeight: 1.7 }}>
                TrackFlow helps teams keep bug reporting organized without mixing user tools and admin controls. The user flow stays focused: report a bug, track its status, and read the solution. The admin flow adds oversight, analytics, role management, and solution publishing.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
