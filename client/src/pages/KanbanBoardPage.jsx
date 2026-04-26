import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { api } from "../api";
import PageHeader from "../components/ui/PageHeader";
import PageWrapper from "../components/ui/PageWrapper";
import Priority from "../components/utils/Priority";
import Spinner from "../components/utils/Spinner";

const COLUMNS = [
  { key: "todo", label: "Todo", color: "#64748b" },
  { key: "in_progress", label: "In Progress", color: "#2563eb" },
  { key: "in_review", label: "In Review", color: "#7c3aed" },
  { key: "done", label: "Done", color: "#16a34a" },
];

export default function KanbanBoardPage() {
  const { project_id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/projects/${project_id}`)
      .then((res) => setProject(res.data))
      .catch((err) => setError(err.message || "Failed to load board"))
      .finally(() => setLoading(false));
  }, [project_id]);

  const grouped = useMemo(() => {
    const bugs = project?.bugs || [];
    return COLUMNS.reduce((acc, column) => {
      acc[column.key] = bugs.filter((bug) => bug.status === column.key);
      return acc;
    }, {});
  }, [project?.bugs]);

  return (
    <PageWrapper>
      <PageHeader
        title={`${project?.title || "Project"} Board`}
        action={
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/projects/${project_id}/bugs`)}
            sx={{ textTransform: "none" }}
          >
            List view
          </Button>
        }
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={10}>
          <Spinner />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={2}>
          {COLUMNS.map((column) => (
            <Grid size={{ xs: 12, md: 3 }} key={column.key}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  minHeight: 520,
                  bgcolor: "#f8fafc",
                  border: "1px solid #e5e7eb",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography fontWeight={900}>{column.label}</Typography>
                  <Chip
                    size="small"
                    label={grouped[column.key]?.length || 0}
                    sx={{ bgcolor: column.color, color: "#fff", fontWeight: 800 }}
                  />
                </Stack>

                <Stack spacing={1.5}>
                  {grouped[column.key]?.map((bug) => (
                    <Card
                      key={bug.id}
                      elevation={0}
                      onClick={() => navigate(`/projects/${project_id}/bugs/${bug.id}`)}
                      sx={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 2,
                        cursor: "pointer",
                        "&:hover": { borderColor: column.color },
                      }}
                    >
                      <CardContent sx={{ p: "16px !important" }}>
                        <Typography fontWeight={900} sx={{ mb: 1 }}>
                          {bug.title}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          fontSize={13}
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            mb: 1.5,
                          }}
                        >
                          {bug.description || "No description"}
                        </Typography>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography fontFamily="monospace" fontSize={12} color="text.secondary">
                            #{bug.id}
                          </Typography>
                          <Priority priority={bug.priority} />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}

                  {!grouped[column.key]?.length && (
                    <Typography color="text.secondary" fontSize={13}>
                      No bugs in this lane.
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </PageWrapper>
  );
}
