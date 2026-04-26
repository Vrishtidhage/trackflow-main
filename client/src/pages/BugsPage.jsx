import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  InputAdornment,
  Divider,
  Paper,
  Chip,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";

import BugsCard from "../components/BugsCard";
import Spinner from "../components/utils/Spinner";
import API_BASE_URL from "../api";

import PageWrapper from "../components/ui/PageWrapper";
import PageHeader from "../components/ui/PageHeader";

const COLORS = {
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  accent: "#2563eb",
  border: "#e5e7eb",
};

export default function BugsPage() {
  const navigate = useNavigate();
  const { project_id } = useParams();

  const [project, setProject] = useState(null);
  const [bugs, setBugs] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [assignee, setAssignee] = useState("all");

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects/${project_id}`);

        const data = res.data?.data || {};
        setProject(data);
        setBugs(data?.bugs || []);
        setFilteredBugs(data?.bugs || []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load bugs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project_id]);

  useEffect(() => {
    if (!Array.isArray(bugs)) return;

    const searchLower = search.toLowerCase();

    let filtered = bugs.filter((bug) => {
      const title = bug?.title?.toLowerCase() || "";
      const desc = bug?.description?.toLowerCase() || "";
      return title.includes(searchLower) || desc.includes(searchLower);
    });

    if (status !== "all") {
      filtered = filtered.filter((b) => b?.status === status);
    }

    if (priority !== "all") {
      filtered = filtered.filter((b) => b?.priority === priority);
    }

    if (assignee !== "all") {
      filtered = filtered.filter((bug) =>
        bug?.assignees?.some((user) => String(user.id) === assignee)
      );
    }

    setFilteredBugs(filtered);
  }, [search, status, priority, assignee, bugs]);

  const projectUsers = project?.members || [];

  return (
    <PageWrapper>

      {/* HEADER */}
      <PageHeader
        title={
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: COLORS.accent, fontWeight: 700 }}>
              Project Issues
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {project?.title || "Loading..."}
            </Typography>
          </Stack>
        }
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ViewKanbanOutlinedIcon />}
              onClick={() => navigate(`/projects/${project_id}/board`)}
              sx={{ textTransform: "none" }}
            >
              Board
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/projects/${project_id}/bugs/new`)}
              sx={{ textTransform: "none" }}
            >
              Report Bug
            </Button>
          </Stack>
        }
      />

      <Typography mb={4}>{project?.description}</Typography>

      {/* FILTER */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            placeholder="Search title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small">
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="todo">Todo</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="in_review">In Review</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="top">Top</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Assignee</InputLabel>
            <Select label="Assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} sx={{ minWidth: 180 }}>
              <MenuItem value="all">All</MenuItem>
              {projectUsers.map((user) => (
                <MenuItem key={user.id} value={String(user.id)}>
                  {user.email}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip label={`${filteredBugs.length} shown`} sx={{ fontWeight: 700 }} />
        </Stack>
      </Paper>

      {/* LOADING */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <Spinner />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : bugs.length === 0 ? (
        <Typography>No issues found</Typography>
      ) : filteredBugs.length === 0 ? (
        <Typography>No issues match your filters</Typography>
      ) : (
        <BugsCard bugs={filteredBugs} />
      )}
    </PageWrapper>
  );
}
