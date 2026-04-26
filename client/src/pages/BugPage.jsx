import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
  TextField,
} from "@mui/material";

import {
  UserPlus,
  History,
  ArrowLeft,
  Trash2,
  Edit3,
  Lightbulb,
} from "lucide-react";

import Status from "../components/utils/Status";
import Priority from "../components/utils/Priority";
import { FormatDate } from "../components/BugsCard";
import CommentsSection from "../components/CommentsSection";
import Spinner from "../components/utils/Spinner";
import NameCard from "../components/utils/NameCard";
import TextWithBugLinks from "../components/utils/TextWithBugLinks";
import API_BASE_URL from "../api";
import { canManageProjects, getTokenPayload, isAdminUser } from "../utils/auth";

import PageWrapper from "../components/ui/PageWrapper";
import PageHeader from "../components/ui/PageHeader";

export default function BugPage() {
  const navigate = useNavigate();
  const { bug_id, project_id } = useParams();

  const [bug, setBug] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openSolutionModal, setOpenSolutionModal] = useState(false);
  const [solutionText, setSolutionText] = useState("");
  const [savingSolution, setSavingSolution] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const tokenPayload = getTokenPayload();
  const canAssignUsers = canManageProjects(tokenPayload);
  const canAddSolution = isAdminUser(tokenPayload);
  const canEditBug = bug && (isAdminUser(tokenPayload) || bug.created_by_id === tokenPayload?.user_id);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bugRes = await axios.get(`${API_BASE_URL}/bugs/${bug_id}`);
        const bugData = bugRes.data?.data;

        setBug(bugData);

        const commentsRes = await axios.get(
          `${API_BASE_URL}/bugs/${bug_id}/comments`
        );

        setComments(commentsRes.data?.data || []);
      } catch (e) {
        setError(e.response?.data?.message || "Error loading bug details");
      }
    };

    fetchData();
  }, [bug_id]);

  // ✅ LOAD USERS
  useEffect(() => {
    if (!openModal) return;

    setLoadingUsers(true);

    axios
      .get(`${API_BASE_URL}/projects/${project_id}/users`)
      .then((res) => setAllUsers(res.data?.data || []))
      .finally(() => setLoadingUsers(false));
  }, [openModal, project_id]);

  // ✅ DELETE
  const handleDelete = useCallback(async () => {
    if (!window.confirm("Delete this bug?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/bugs/${bug_id}`);
      navigate(`/projects/${project_id}/bugs`);
    } catch (err) {
      console.error(err);
    }
  }, [bug_id, project_id, navigate]);

  // ✅ ASSIGN
  const handleAssignChange = async (checked, userId) => {
    try {
      let res;
      if (checked) {
        res = await axios.post(
          `${API_BASE_URL}/bugs/${bug.id}/assign/${userId}`
        );
      } else {
        res = await axios.delete(
          `${API_BASE_URL}/bugs/${bug.id}/unassign/${userId}`
        );
      }
      setBug(res.data?.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenSolution = () => {
    setSolutionText(bug?.solution || "");
    setOpenSolutionModal(true);
  };

  const handleSaveSolution = async () => {
    const trimmed = solutionText.trim();
    if (!trimmed) return;

    setSavingSolution(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/bugs/${bug.id}/solution`, {
        solution: trimmed,
      });
      setBug(res.data?.data);
      setOpenSolutionModal(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save solution");
    } finally {
      setSavingSolution(false);
    }
  };

  if (!bug)
    return (
      <PageWrapper sx={{ display: "flex", justifyContent: "center", pt: 10 }}>
        <Spinner />
      </PageWrapper>
    );

  return (
    <PageWrapper>

      {/* HEADER */}
      <PageHeader
        title={<Typography variant="h4">Bug #{bug.id}</Typography>}
        action={
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate(`/projects/${project_id}/bugs`)}
          >
            Back
          </Button>
        }
      />

      <Box display="flex" flexDirection="column" gap={4}>

        {error && <Paper sx={{ p: 2 }}>{error}</Paper>}

        {/* TITLE */}
        <Typography variant="h5">{bug.title}</Typography>

        <Stack direction="row" spacing={1}>
          <Status status={bug.status} />
          <Priority priority={bug.priority} />
        </Stack>

        {/* DETAILS */}
        <Card>
          <CardContent>

            <Typography fontWeight={700}>Description</Typography>

            <Typography mt={1}>
              <TextWithBugLinks
                text={bug.description}
                projectId={project_id}
              />
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography fontWeight={700}>Assignees</Typography>

            <Stack direction="row" spacing={1} mt={1}>
              {bug?.assignees?.length ? (
                bug.assignees.map((u) => (
                  <NameCard key={u.id} email={u.email} />
                ))
              ) : (
                <Typography>No assignees</Typography>
              )}
            </Stack>

            <Typography mt={2} fontSize={12}>
              Created {FormatDate(bug.created_at, true)}
            </Typography>

          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border: "1px solid #dbe3ef",
            borderRadius: 3,
            bgcolor: bug.solution ? "#f0fdf4" : "#fff7ed",
          }}
        >
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                  <Lightbulb size={20} color={bug.solution ? "#16a34a" : "#d97706"} />
                  <Typography fontWeight={900}>Admin Solution</Typography>
                </Stack>
                {bug.solution ? (
                  <>
                    <Typography sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                      {bug.solution}
                    </Typography>
                    {bug.solution_updated_at && (
                      <Typography mt={2} fontSize={12} color="text.secondary">
                        Updated {FormatDate(bug.solution_updated_at, true)}
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary">
                    No solution has been added by an admin yet. Once an admin reviews this bug, the fix guidance will appear here.
                  </Typography>
                )}
              </Box>
              {canAddSolution && (
                <Button
                  variant="contained"
                  startIcon={<Lightbulb size={18} />}
                  onClick={handleOpenSolution}
                  sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, textTransform: "none" }}
                >
                  {bug.solution ? "Edit Solution" : "Add Solution"}
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* ACTIONS (NOW ALWAYS VISIBLE) */}
        <Stack direction="row" spacing={2}>

          {canEditBug && (
            <Button
              variant="contained"
              startIcon={<Edit3 />}
              onClick={() =>
                navigate(`/projects/${project_id}/bugs/${bug.id}/edit`)
              }
            >
              Edit
            </Button>
          )}

          {canAssignUsers && (
            <Button
              variant="outlined"
              startIcon={<UserPlus />}
              onClick={() => setOpenModal(true)}
            >
              Assign
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={<History />}
            onClick={() =>
              navigate(`/projects/${project_id}/bugs/${bug.id}/history`)
            }
          >
            History
          </Button>

          {canEditBug && (
            <Button
              color="error"
              variant="outlined"
              startIcon={<Trash2 />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}

        </Stack>

        {/* COMMENTS */}
        <CommentsSection
          project_id={project_id}
          setComments={setComments}
          bugId={bug_id}
          comments={comments}
        />
      </Box>

      {/* MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>Assign Users</DialogTitle>

        <DialogContent>
          {loadingUsers ? (
            <Spinner />
          ) : (
            allUsers.map((u) => {
              const checked =
                bug?.assignees?.some((m) => m.id === u.id);

              return (
                <FormControlLabel
                  key={u.id}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(e) =>
                        handleAssignChange(e.target.checked, u.id)
                      }
                    />
                  }
                  label={u.email}
                />
              );
            })
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSolutionModal} onClose={() => setOpenSolutionModal(false)} fullWidth maxWidth="md">
        <DialogTitle>{bug.solution ? "Edit Bug Solution" : "Add Bug Solution"}</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" mb={2}>
            Write clear fix steps, workaround notes, or investigation guidance for the user who reported this bug.
          </Typography>
          <TextField
            autoFocus
            multiline
            minRows={8}
            fullWidth
            label="Solution / Fix Guidance"
            value={solutionText}
            onChange={(event) => setSolutionText(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSolutionModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSolution}
            disabled={savingSolution || !solutionText.trim()}
          >
            {savingSolution ? "Saving..." : "Save Solution"}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}
