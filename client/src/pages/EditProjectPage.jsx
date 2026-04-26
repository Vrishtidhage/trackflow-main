import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Stack,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowLeft, UserPlus, Trash2, Users } from "lucide-react";

import API_BASE_URL from "../api";
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
  danger: "#ef4444",
};

export default function EditProjectPage() {
  const navigate = useNavigate();
  const { project_id } = useParams();

  const [project, setProject] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null); // ✅ NEW

  // ✅ FETCH PROJECT
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/projects/${project_id}`);
        const data = res.data?.data;

        setProject(data);
        setTitle(data?.title || "");
        setDescription(data?.description || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [project_id]);

  // ✅ LOAD USERS
  useEffect(() => {
    if (!showModal) return;

    setLoadingUsers(true);
    axios
      .get(`${API_BASE_URL}/users`)
      .then((res) => setAllUsers(res.data?.data || []))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoadingUsers(false));
  }, [showModal]);

  // ✅ ADD MEMBER
  const addMember = useCallback(async (userId) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/projects/${project_id}/members/add/${userId}`
      );
      setProject(res.data?.data);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setError("Failed to add member");
    }
  }, [project_id]);

  // ✅ REMOVE MEMBER
  const removeMember = useCallback(async (userId) => {
    if (!window.confirm("Remove this member?")) return;

    try {
      const res = await axios.delete(
        `${API_BASE_URL}/projects/${project_id}/members/remove/${userId}`
      );
      setProject(res.data?.data);
    } catch (err) {
      console.error(err);
      setError("Failed to remove member");
    }
  }, [project_id]);

  // ✅ SUBMIT
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await axios.put(`${API_BASE_URL}/projects/${project_id}`, {
        title: title.trim(),
        description,
      });

      navigate("/projects");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Failed to update project"
      );
    } finally {
      setSubmitting(false);
    }
  }, [title, description, project_id, navigate, submitting]);

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
        title="Project Settings"
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

      <Box display="flex" justifyContent="center" mt={2}>
        <Card
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 700,
            borderRadius: "16px",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>

            {/* ERROR */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>

                {/* GENERAL */}
                <Box>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    General Information
                  </Typography>

                  <Stack spacing={2.5}>
                    <TextField
                      label="Project Title"
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
                      rows={4}
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
                  </Stack>
                </Box>

                <Divider />

                {/* MEMBERS */}
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight={700}>
                      Team Members
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<UserPlus size={16} />}
                      onClick={() => setShowModal(true)}
                    >
                      Add Member
                    </Button>
                  </Stack>

                  <List sx={{ bgcolor: COLORS.bgSecondary, borderRadius: "10px" }}>
                    {project?.members?.map((user, index) => (
                      <Box key={user.id}>
                        <ListItem
                          secondaryAction={
                            project.created_by_id !== user.id && (
                              <IconButton onClick={() => removeMember(user.id)}>
                                <Trash2 size={18} color={COLORS.danger} />
                              </IconButton>
                            )
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              {user.email?.[0]?.toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>

                          <ListItemText
                            primary={user.email?.split("@")[0]}
                            secondary={user.email}
                          />
                        </ListItem>

                        {index < project.members.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Box>

                {/* SUBMIT */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disableElevation
                  disabled={submitting || !title.trim()}
                >
                  {submitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Save Project Settings"
                  )}
                </Button>

              </Stack>
            </form>

          </CardContent>
        </Card>
      </Box>

      {/* MODAL */}
      <Dialog open={showModal} onClose={() => setShowModal(false)}>
        <DialogTitle>Add Team Member</DialogTitle>

        <DialogContent>
          {loadingUsers ? (
            <CircularProgress />
          ) : (
            <List>
              {allUsers
                .filter((u) => !project.members.some((m) => m.id === u.id))
                .map((u) => (
                  <ListItem
                    key={u.id}
                    secondaryAction={
                      <Button onClick={() => addMember(u.id)}>Add</Button>
                    }
                  >
                    <ListItemText primary={u.email} />
                  </ListItem>
                ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}