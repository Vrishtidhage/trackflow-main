import { useNavigate, useParams } from "react-router-dom";
import { useState, useCallback } from "react";
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
import { ArrowLeft } from "lucide-react";

import PageWrapper from "../components/ui/PageWrapper";
import PageHeader from "../components/ui/PageHeader";

// Design Tokens
const COLORS = {
  border: "#e5e7eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  bgSecondary: "#f9fafb",
  accent: "#2563eb",
};

export default function NewBugPage() {
  const navigate = useNavigate();
  const { project_id } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("low");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ NEW

  // ✅ SAFE HANDLER
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/bugs`, {
        title: title.trim(),
        description,
        status,
        priority,
        project_id,
      });

      navigate(`/projects/${project_id}/bugs`);
    } catch (err) {
      console.error("Error creating bug:", err);
      setError(
        err.response?.data?.message ||
        "Failed to create bug. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [title, description, status, priority, project_id, navigate, loading]);

  return (
    <PageWrapper>
      <PageHeader
        title="Report New Bug"
        action={
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate(`/projects/${project_id}/bugs`)}
            sx={{ textTransform: "none", color: COLORS.textSecondary }}
          >
            Back to Bugs
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
              Bug Details
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
                  placeholder="e.g., Login button not responding on mobile"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: COLORS.bgSecondary,
                    },
                  }}
                />

                <TextField
                  label="Description"
                  placeholder="Describe the steps to reproduce the issue..."
                  multiline
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  disabled={loading}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: COLORS.bgSecondary,
                    },
                  }}
                />

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                >
                  <TextField
                    select
                    label="Initial Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    fullWidth
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
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
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                      },
                    }}
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
                    disabled={loading || !title.trim()}
                    sx={{
                      py: 1.5,
                      borderRadius: "10px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1rem",
                      bgcolor: COLORS.accent,
                      "&:hover": { bgcolor: "#1d4ed8" },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Create Bug Report"
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