import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import API_BASE_URL, { api } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import PageWrapper from "../components/ui/PageWrapper";
import { IMAGES, SURFACE } from "../theme/visuals";
import { isAdminUser } from "../utils/auth";

const COLORS = {
  border: "#dbe3ef",
  primaryText: "#101828",
  secondaryText: "#667085",
  accent: "#2563eb",
  success: "#16a34a",
  warning: "#d97706",
};

const RANGES = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={8} sx={{ p: 1.5, border: `1px solid ${COLORS.border}` }}>
      <Typography fontWeight={900} fontSize={13} mb={0.5}>
        {label}
      </Typography>
      {payload.map((item) => (
        <Stack key={item.dataKey} direction="row" spacing={1} alignItems="center">
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: item.color }} />
          <Typography fontSize={12}>
            {item.name}: <strong>{item.value}</strong>
          </Typography>
        </Stack>
      ))}
    </Paper>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [reported, setReported] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/bugs/reported")])
      .then(([projectsRes, bugsRes]) => {
        setProjects(projectsRes.data || []);
        setReported(bugsRes.data || []);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const totalReported = reported.length;
  const resolvedReports = reported.filter((bug) => bug.status === "done").length;
  const openReports = reported.filter((bug) => bug.status !== "done").length;
  const inReviewReports = reported.filter((bug) => bug.status === "in_review").length;
  const resolution = totalReported ? Math.round((resolvedReports / totalReported) * 100) : 0;
  const statusChart = ["todo", "in_progress", "in_review", "done"].map((status) => ({
    status: status.replaceAll("_", " "),
    count: reported.filter((bug) => bug.status === status).length,
  }));
  const priorityChart = ["low", "medium", "high", "top"].map((priority) => ({
    priority,
    count: reported.filter((bug) => bug.priority === priority).length,
  }));

  if (loading) {
    return (
      <PageWrapper>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="55vh">
          <CircularProgress />
        </Box>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Your Dashboard"
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/my-bugs")} sx={{ textTransform: "none", bgcolor: "#fff" }}>
              My Bugs
            </Button>
            <Button variant="contained" onClick={() => navigate("/projects")} sx={{ textTransform: "none" }}>
              Open Projects
            </Button>
          </Stack>
        }
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(37,99,235,0.62)), url(${IMAGES.workspace})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography variant="overline" sx={{ color: "#bfdbfe", fontWeight: 900 }}>
            Signed in workspace
          </Typography>
          <Typography variant="h4" fontWeight={900} mt={1}>
            Welcome, {user?.email || "teammate"}
          </Typography>
          <Typography sx={{ color: "#dbeafe", maxWidth: 720, mt: 1 }}>
            Track the bugs you have reported, see their resolution status, and jump back into projects to submit new issues.
          </Typography>
          <Box mt={3} maxWidth={420}>
            <Stack direction="row" justifyContent="space-between" mb={1}>
              <Typography fontWeight={800}>Report resolution</Typography>
              <Typography fontWeight={900}>{resolution}%</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={resolution}
              sx={{ height: 10, borderRadius: 99, bgcolor: "rgba(255,255,255,0.22)", "& .MuiLinearProgress-bar": { bgcolor: "#22c55e" } }}
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3} mb={3}>
        {[
          ["Available projects", projects.length, SURFACE.primary],
          ["Bugs reported", totalReported, "#7c3aed"],
          ["Open reports", openReports, COLORS.warning],
          ["Resolved reports", resolvedReports, SURFACE.success],
        ].map(([label, value, color]) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
            <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
              <CardContent>
                <Typography fontSize={13} color="text.secondary" fontWeight={800}>
                  {label}
                </Typography>
                <Typography variant="h3" fontWeight={900} color={color}>
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ height: 360, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography fontWeight={900} mb={2}>My Reports by Status</Typography>
              <ResponsiveContainer width="100%" height="86%">
                <BarChart data={statusChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reports" fill={SURFACE.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ minHeight: 360, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent>
              <Typography fontWeight={900} mb={2}>Recent Reports</Typography>
              <Stack spacing={1.5}>
                {reported.slice(0, 5).map((bug) => (
                  <Paper
                    key={bug.id}
                    onClick={() => navigate(`/projects/${bug.project_id}/bugs/${bug.id}`)}
                    sx={{ p: 1.5, cursor: "pointer", border: `1px solid ${SURFACE.line}`, boxShadow: "none" }}
                  >
                    <Typography fontWeight={800}>{bug.title}</Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      <Chip size="small" label={bug.status?.replaceAll("_", " ")} />
                      <Chip size="small" label={bug.priority} />
                    </Stack>
                  </Paper>
                ))}
                {!reported.length && (
                  <Box>
                    <Typography color="text.secondary">You have not reported any bugs yet.</Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/projects")}
                      sx={{ mt: 2, textTransform: "none" }}
                    >
                      Browse projects to report a bug
                    </Button>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ height: 320, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography fontWeight={900} mb={2}>Priority of My Reports</Typography>
              <ResponsiveContainer width="100%" height="84%">
                <BarChart data={priorityChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="priority" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Reports" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ minHeight: 320, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent>
              <Typography fontWeight={900} mb={2}>Useful Next Actions</Typography>
              <Stack spacing={1.5}>
                <Paper sx={{ p: 2, border: `1px solid ${SURFACE.line}`, boxShadow: "none" }}>
                  <Typography fontWeight={800}>Report a new bug</Typography>
                  <Typography color="text.secondary" fontSize={14}>
                    Choose a project, then use Report Bug to submit the issue.
                  </Typography>
                  <Button onClick={() => navigate("/projects")} sx={{ mt: 1, textTransform: "none" }}>
                    Open projects
                  </Button>
                </Paper>
                <Paper sx={{ p: 2, border: `1px solid ${SURFACE.line}`, boxShadow: "none" }}>
                  <Typography fontWeight={800}>Follow up on reviews</Typography>
                  <Typography color="text.secondary" fontSize={14}>
                    You currently have {inReviewReports} reported bug{inReviewReports === 1 ? "" : "s"} in review.
                  </Typography>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d");
  const [activeMetric, setActiveMetric] = useState("total");
  const [projectFilter, setProjectFilter] = useState("all");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/dashboard`);
        const dashboardData = res.data?.data || res.data;
        if (!dashboardData || dashboardData.total_bugs === undefined) {
          throw new Error("Invalid dashboard data");
        }
        setData(dashboardData);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const projectRows = useMemo(() => data?.bugs_per_project || [], [data]);
  const filteredProjectRows = useMemo(() => {
    if (projectFilter === "all") return projectRows;
    return projectRows.filter((row) => row.project === projectFilter);
  }, [projectFilter, projectRows]);

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <CircularProgress size={34} thickness={5} sx={{ color: COLORS.accent }} />
        </Box>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <Alert severity="error">{error}</Alert>
      </PageWrapper>
    );
  }

  if (!data) {
    return (
      <PageWrapper>
        <Typography sx={{ textAlign: "center", color: COLORS.secondaryText, mt: 10 }}>
          No dashboard data available
        </Typography>
      </PageWrapper>
    );
  }

  const total = data.total_bugs || 0;
  const open = data.open_bugs || 0;
  const closed = data.closed_bugs || 0;
  const closedRate = total ? Math.round((closed / total) * 100) : 0;
  const openRate = total ? Math.round((open / total) * 100) : 0;

  const pieData = [
    { name: "Open", value: open, color: COLORS.accent },
    { name: "Closed", value: closed, color: COLORS.success },
  ];

  const multiplier = range === "7d" ? 0.45 : range === "90d" ? 1.35 : 1;
  const trendData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({
    name: day,
    opened: Math.max(Math.round((open + index - 2) * multiplier), 0),
    resolved: Math.max(Math.round((closed + index - 3) * multiplier), 0),
  }));

  const stats = [
    {
      id: "total",
      label: "Total Bugs",
      value: total,
      icon: <BugReportOutlinedIcon fontSize="small" />,
      color: COLORS.primaryText,
      helper: "All bugs in the system",
      progress: 100,
    },
    {
      id: "open",
      label: "Open Bugs",
      value: open,
      icon: <RadioButtonUncheckedIcon fontSize="small" />,
      color: COLORS.accent,
      helper: `${openRate}% of total`,
      progress: openRate,
    },
    {
      id: "closed",
      label: "Closed Bugs",
      value: closed,
      icon: <CheckCircleIcon fontSize="small" />,
      color: COLORS.success,
      helper: `${closedRate}% resolved`,
      progress: closedRate,
    },
  ];

  return (
    <PageWrapper>
      <PageHeader
        title="Admin Overview"
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              select
              size="small"
              label="Project"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              sx={{ minWidth: 180, bgcolor: "#fff" }}
            >
              <MenuItem value="all">All projects</MenuItem>
              {projectRows.map((row) => (
                <MenuItem key={row.project} value={row.project}>
                  {row.project}
                </MenuItem>
              ))}
            </TextField>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={range}
              onChange={(_, value) => value && setRange(value)}
              sx={{ bgcolor: "#fff" }}
            >
              {RANGES.map((item) => (
                <ToggleButton key={item.value} value={item.value} sx={{ fontWeight: 800 }}>
                  {item.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={() => {
                setRange("30d");
                setProjectFilter("all");
                setActiveMetric("total");
              }}
              sx={{ textTransform: "none", bgcolor: "#fff" }}
            >
              Reset
            </Button>
          </Stack>
        }
      />

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          color: "#fff",
          overflow: "hidden",
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.92), rgba(30,58,138,0.70)), url(${IMAGES.admin})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="overline" sx={{ color: "#bfdbfe", fontWeight: 900 }}>
                Executive snapshot
              </Typography>
              <Typography variant="h4" fontWeight={900} mt={1}>
                {total} bugs tracked with {closedRate}% resolution
              </Typography>
              <Typography sx={{ color: "#dbeafe", maxWidth: 720, mt: 1 }}>
                Use the range and project controls to inspect delivery movement, workload distribution, and resolution health.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 2.5, bgcolor: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography fontWeight={800}>Resolution Rate</Typography>
                  <Typography fontWeight={900}>{closedRate}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={closedRate}
                  sx={{ height: 10, borderRadius: 99, bgcolor: "rgba(255,255,255,0.22)", "& .MuiLinearProgress-bar": { bgcolor: "#22c55e" } }}
                />
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3} mb={3}>
        {stats.map((item) => (
          <Grid size={{ xs: 12, sm: 4 }} key={item.id}>
            <Card
              elevation={0}
              onClick={() => setActiveMetric(item.id)}
              sx={{
                borderRadius: 3,
                border: `1px solid ${activeMetric === item.id ? item.color : COLORS.border}`,
                boxShadow: activeMetric === item.id ? `0 16px 36px ${item.color}22` : "0 18px 45px rgba(16,24,40,0.05)",
                cursor: "pointer",
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontSize={13} color={COLORS.secondaryText} fontWeight={800}>
                      {item.label}
                    </Typography>
                    <Typography variant="h3" fontWeight={900} color={item.color}>
                      {item.value}
                    </Typography>
                    <Typography fontSize={12} color={COLORS.secondaryText}>
                      {item.helper}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: `${item.color}12`, color: item.color }}>
                    {item.icon}
                  </Box>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={item.progress}
                  sx={{ mt: 2, height: 7, borderRadius: 99, bgcolor: "#eef2f7", "& .MuiLinearProgress-bar": { bgcolor: item.color } }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ height: 360, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent sx={{ height: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography fontWeight={900}>Status Distribution</Typography>
                <Chip size="small" label={activeMetric} sx={{ fontWeight: 800 }} />
              </Stack>
              <ResponsiveContainer width="100%" height="86%">
                <PieChart>
                  <Pie data={pieData} innerRadius={72} outerRadius={106} dataKey="value" paddingAngle={4}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ height: 360, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography fontWeight={900} mb={2}>Bugs per Project</Typography>
              <ResponsiveContainer width="100%" height="86%">
                <BarChart data={filteredProjectRows}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="project" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Bugs" fill={COLORS.accent} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0} sx={{ height: 360, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography fontWeight={900} mb={2}>Delivery Movement ({range.toUpperCase()})</Typography>
              <ResponsiveContainer width="100%" height="86%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="openedBugs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SURFACE.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={SURFACE.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="resolvedBugs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SURFACE.success} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={SURFACE.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="opened" name="Opened" stroke={SURFACE.primary} fill="url(#openedBugs)" strokeWidth={3} />
                  <Area type="monotone" dataKey="resolved" name="Resolved" stroke={SURFACE.success} fill="url(#resolvedBugs)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ height: 360, borderRadius: 3, border: `1px solid ${SURFACE.line}` }}>
            <CardContent>
              <Typography fontWeight={900} mb={2}>Project Load</Typography>
              <Stack spacing={1.5}>
                {filteredProjectRows.slice(0, 7).map((row) => {
                  const percent = total ? Math.round((row.count / total) * 100) : 0;
                  return (
                    <Box key={row.project}>
                      <Stack direction="row" justifyContent="space-between" mb={0.5}>
                        <Typography fontSize={13} fontWeight={800}>{row.project}</Typography>
                        <Typography fontSize={13} color="text.secondary">{row.count}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={percent}
                        sx={{ height: 8, borderRadius: 99, bgcolor: "#eef2f7", "& .MuiLinearProgress-bar": { bgcolor: percent > 50 ? COLORS.warning : COLORS.accent } }}
                      />
                    </Box>
                  );
                })}
                {!filteredProjectRows.length && (
                  <Typography color="text.secondary">No project data for this filter.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  return isAdminUser(user) ? <AdminDashboard /> : <UserDashboard />;
}
