import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../api";

import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import { ArrowLeft, Save } from "lucide-react";

import PageWrapper from "../components/ui/PageWrapper";
import PageHeader from "../components/ui/PageHeader";
import Spinner from "../components/utils/Spinner";

// Design Tokens
const COLORS = {
  border: "#e5e7eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  bgSecondary: "#f9fafb",
  accent: "#2563eb",
};

export default function EditBugPage() {
  const navigate = useNavigate();
  const { bug_id, project_id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null); // ✅ NEW

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchBug = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bugs/${bug_id}`);
        const bug = res.data?.data;

        setTitle(bug?.title || "");
        setDescription(bug?.description || "");
        setStatus(bug?.status || "todo");
        setPriority(bug?.priority || "low");
      } catch (err) {
        console.error("Error fetching bug:", err);
        setError("Failed to load bug data");
      } finally {
        setLoading(false);
      }
    };

    fetchBug();
  }, [bug_id]);

  // ✅ SUBMIT HANDLER
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axios.put(`${API_BASE_URL}/bugs/${bug_id}`, {
        title: title.trim(),
        description,
        status,
        priority,
      });

      navigate(`/projects/${project_id}/bugs/${bug_id}`);
    } catch (err) {
      console.error("Error updating bug:", err);
      setError(
        err.response?.data?.message ||
        "Failed to update bug"
      );
    } finally {
      setSubmitting(false);
    }
  }, [title, description, status, priority, bug_id, project_id, navigate, submitting]);

  if (loading) {
    return (
      <PageWrapper sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <Spinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageHeader
        title={`Edit Bug #${bug_id}`}
        action={
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate(`/projects/${project_id}/bugs/${bug_id}`)}
            sx={{ textTransform: "none", color: COLORS.textSecondary }}
          >
            Cancel Changes
          </Button>
        }
      />

      <Box display="flex" justifyContent="center" mt={2}>
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 600,
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>

            <Typography
              variant="h6"
              fontWeight={700}
              mb={3}
              color={COLORS.textPrimary}
            >
              Update Information
            </Typography>

            {/* ERROR */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>

                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                  disabled={submitting}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: COLORS.bgSecondary,
                    },
                  }}
                />

                <TextField
                  label="Description"
                  multiline
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  disabled={submitting}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: COLORS.bgSecondary,
                    },
                  }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    select
                    label="Current Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    fullWidth
                    disabled={submitting}
                  >
                    <MenuItem value="todo">Todo</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="in_review">In Review</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Priority Level"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    fullWidth
                    disabled={submitting}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="top">Top</MenuItem>
                  </TextField>
                </Stack>

                <Box pt={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disableElevation
                    disabled={submitting || !title.trim()}
                    startIcon={!submitting && <Save size={18} />}
                    sx={{
                      py: 1.5,
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: COLORS.accent,
                      "&:hover": { bgcolor: "#1d4ed8" },
                    }}
                  >
                    {submitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </Box>

              </Stack>
            </form>

          </CardContent>
        </Card>
      </Box>
    </PageWrapper>
  );
}