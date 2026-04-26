import { useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import axios from "axios";
import API_BASE_URL from "../api";

import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import { ArrowLeft, FolderPlus } from "lucide-react";

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

export default function NewProjectPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ NEW

  // ✅ SAFE HANDLER
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`${API_BASE_URL}/projects`, {
        title: title.trim(),
        description,
      });

      navigate("/projects");
    } catch (err) {
      console.error("Error creating project:", err);
      setError(
        err.response?.data?.message ||
        "Failed to create project. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [title, description, navigate, loading]);

  return (
    <PageWrapper>
      <PageHeader
        title="Initialize New Project"
        action={
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/projects")}
            sx={{ textTransform: "none", color: COLORS.textSecondary }}
          >
            Back to Projects
          </Button>
        }
      />

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
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

            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <FolderPlus size={20} color={COLORS.accent} />
              <Typography
                variant="h6"
                fontWeight={700}
                color={COLORS.textPrimary}
              >
                Project Identity
              </Typography>
            </Stack>

            {/* ERROR */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>

                <TextField
                  label="Project Title"
                  placeholder="e.g., E-commerce Redesign 2026"
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
                  placeholder="Outline the goals and scope of this project..."
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
                      "Launch Project"
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
