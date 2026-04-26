import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import SearchIcon from "@mui/icons-material/Search";

import { api } from "../api";
import BugsCard from "../components/BugsCard";
import PageHeader from "../components/ui/PageHeader";
import PageWrapper from "../components/ui/PageWrapper";
import Spinner from "../components/utils/Spinner";

const STATUSES = ["all", "todo", "in_progress", "in_review", "done"];
const PRIORITIES = ["all", "low", "medium", "high", "top"];

function label(value) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function MyBugsPage() {
  const [bugs, setBugs] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/bugs/reported")
      .then((res) => setBugs(res.data || []))
      .catch((err) => setError(err.message || "Failed to load reported bugs"))
      .finally(() => setLoading(false));
  }, []);

  const filteredBugs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return bugs.filter((bug) => {
      const matchesQuery =
        !needle ||
        bug.title?.toLowerCase().includes(needle) ||
        bug.description?.toLowerCase().includes(needle);
      const matchesStatus = status === "all" || bug.status === status;
      const matchesPriority = priority === "all" || bug.priority === priority;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [bugs, priority, query, status]);

  return (
    <PageWrapper>
      <PageHeader
        title="My Reported Bugs"
        action={
          <Chip
            icon={<AssignmentTurnedInOutlinedIcon />}
            label={`${filteredBugs.length} reported`}
            sx={{ fontWeight: 700 }}
          />
        }
      />

      <Paper elevation={0} sx={{ p: 2, border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search reported bugs"
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#6b7280" }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            size="small"
            sx={{ minWidth: 170 }}
          >
            {STATUSES.map((item) => (
              <MenuItem key={item} value={item}>
                {label(item)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
            size="small"
            sx={{ minWidth: 170 }}
          >
            {PRIORITIES.map((item) => (
              <MenuItem key={item} value={item}>
                {label(item)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <Spinner />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : filteredBugs.length ? (
        <BugsCard bugs={filteredBugs} />
      ) : (
        <Paper elevation={0} sx={{ p: 5, textAlign: "center", border: "1px dashed #d1d5db" }}>
          <Typography variant="h6" fontWeight={800}>
            No assigned bugs match your filters
          </Typography>
          <Typography color="text.secondary" mt={1}>
            Bugs you report will appear here.
          </Typography>
          <Button sx={{ mt: 3, textTransform: "none" }} href="/projects">
            Browse projects
          </Button>
        </Paper>
      )}
    </PageWrapper>
  );
}
