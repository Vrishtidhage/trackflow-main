import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Button,
  Box,
  Typography,
  Grid,
  LinearProgress,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import AddIcon from "@mui/icons-material/Add";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";

import ProjectCard from "../components/ProjectCard";
import API_BASE_URL from "../api";

import PageWrapper from "../components/ui/PageWrapper";
import PageHeader from "../components/ui/PageHeader";
import { IMAGES, SURFACE } from "../theme/visuals";
import { canManageProjects, getTokenPayload } from "../utils/auth";

// Style Constants
const COLORS = {
  bg: "#f3f4f6",
  primaryText: "#111827",
  secondaryText: "#6b7280",
  accent: "#2563eb",
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const canCreateProjects = canManageProjects(getTokenPayload());

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects`);

        setProjects(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const totalBugs = projects.reduce((sum, project) => sum + (project?.bugs?.length || 0), 0);
  const doneBugs = projects.reduce(
    (sum, project) => sum + (project?.bugs || []).filter((bug) => bug.status === "done").length,
    0
  );
  const activeBugs = Math.max(totalBugs - doneBugs, 0);
  const chartData = projects.slice(0, 6).map((project) => ({
    name: project.title?.slice(0, 14) || `Project ${project.id}`,
    bugs: project?.bugs?.length || 0,
  }));
  const statusData = [
    { name: "Active", value: activeBugs, color: SURFACE.primary },
    { name: "Done", value: doneBugs, color: SURFACE.success },
  ];

  return (
    <PageWrapper>
      
      {/* HEADER */}
      <PageHeader
        title="Projects"
        action={
          canCreateProjects ? (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={() => navigate("/projects/new")}
            sx={{
              bgcolor: COLORS.accent,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              "&:hover": { bgcolor: "#1d4ed8" },
            }}
          >
            New Project
          </Button>
          ) : null
        }
      />

      <Typography
        sx={{ color: COLORS.secondaryText }}
        mb={4}
        fontSize="0.95rem"
      >
        Manage your projects and track bugs across your organization
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            elevation={0}
            sx={{
              minHeight: 280,
              color: "#fff",
              borderRadius: 3,
              overflow: "hidden",
              backgroundImage: `linear-gradient(135deg, rgba(15,23,42,0.88), rgba(37,99,235,0.45)), url(${IMAGES.workspace})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 900, color: "#bfdbfe" }}>
                Workspace health
              </Typography>
              <Typography variant="h4" fontWeight={900} mt={1}>
                {projects.length} projects, {totalBugs} tracked bugs
              </Typography>
              <Stack direction="row" spacing={2} mt={4}>
                <Box>
                  <Typography variant="h3" fontWeight={900}>{activeBugs}</Typography>
                  <Typography color="#dbeafe">Active</Typography>
                </Box>
                <Box>
                  <Typography variant="h3" fontWeight={900}>{doneBugs}</Typography>
                  <Typography color="#dbeafe">Resolved</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0} sx={{ height: 280, border: `1px solid ${SURFACE.line}`, borderRadius: 3 }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography fontWeight={900} mb={2}>Bugs by project</Typography>
              <ResponsiveContainer width="100%" height="82%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="bugs" fill={SURFACE.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card elevation={0} sx={{ height: 280, border: `1px solid ${SURFACE.line}`, borderRadius: 3 }}>
            <CardContent sx={{ height: "100%" }}>
              <Typography fontWeight={900} mb={2}>Resolution mix</Typography>
              <ResponsiveContainer width="100%" height="82%">
                <PieChart>
                  <Pie data={statusData} innerRadius={52} outerRadius={84} dataKey="value" paddingAngle={4}>
                    {statusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* LOADING */}
      {loading ? (
        <Box sx={{ width: "100%", mt: 4 }}>
          <LinearProgress
            sx={{
              borderRadius: 5,
              height: 6,
              bgcolor: "#e5e7eb",
              "& .MuiLinearProgress-bar": {
                bgcolor: COLORS.accent,
              },
            }}
          />
          <Typography
            sx={{ color: COLORS.secondaryText, textAlign: "center" }}
            mt={2}
            fontSize={14}
          >
            Fetching projects...
          </Typography>
        </Box>
      ) : projects.length === 0 ? (
        /* EMPTY STATE */
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 10,
            py: 8,
            px: 2,
            bgcolor: "#fff",
            borderRadius: "16px",
            border: "1px dashed #d1d5db",
          }}
        >
          <FolderOpenOutlinedIcon
            sx={{ fontSize: 48, color: "#9ca3af", mb: 2 }}
          />

          <Typography
            variant="h6"
            sx={{ color: COLORS.primaryText }}
            fontWeight={600}
          >
            No projects found
          </Typography>

          <Typography
            sx={{ color: COLORS.secondaryText, textAlign: "center" }}
            mb={3}
          >
            You haven't created any projects yet. Start by creating your first one.
          </Typography>

          {canCreateProjects && (
            <Button
              variant="outlined"
              onClick={() => navigate("/projects/new")}
              sx={{ textTransform: "none", borderRadius: "8px" }}
            >
              Create your first project
            </Button>
          )}
        </Box>
      ) : (
        /* PROJECT LIST */
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid size={{ xs: 12 }} key={project.id}>
              <ProjectCard
                projects={projects}
                setProjects={setProjects}
                handleClick={() =>
                  navigate(`/projects/${project.id}/bugs`)
                }
                project={project}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </PageWrapper>
  );
}
