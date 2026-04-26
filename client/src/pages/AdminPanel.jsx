import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { api } from "../api";
import PageWrapper from "../components/ui/PageWrapper";
import PageHeader from "../components/ui/PageHeader";

export default function AdminPanel() {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingUserId, setSavingUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [summaryResponse, usersResponse, activityResponse] = await Promise.all([
          api.get("/admin/summary"),
          api.get("/admin/users"),
          api.get("/admin/activity"),
        ]);
        setSummary(summaryResponse.data?.data || summaryResponse.data);
        setUsers(usersResponse.data?.data || usersResponse.data || []);
        setActivity(activityResponse.data?.data || activityResponse.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleRoleChange = async (userId, role) => {
    setSavingUserId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role } : user))
      );
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Failed to update role");
    } finally {
      setSavingUserId(null);
    }
  };

  const exportUsersCsv = () => {
    const rows = [["id", "email", "role", "created_at"], ...users.map((user) => [
      user.id,
      user.email,
      user.role,
      user.created_at,
    ])];
    const csv = rows
      .map((row) => row.map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "trackflow-users.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper>
      <PageHeader
        title="Admin Panel"
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={exportUsersCsv} sx={{ textTransform: "none" }}>
              Export Users
            </Button>
            <Button variant="outlined" onClick={handleLogout} sx={{ textTransform: "none" }}>
              Logout
            </Button>
          </Stack>
        }
      />

      {loading && <LinearProgress sx={{ borderRadius: 1 }} />}
      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && summary && (
        <Stack spacing={3}>
          <Typography color="text.secondary">Signed in as: {summary.admin_email}</Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card><CardContent><Typography color="text.secondary">Total Users</Typography><Typography variant="h4">{summary.total_users}</Typography></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card><CardContent><Typography color="text.secondary">Total Projects</Typography><Typography variant="h4">{summary.total_projects}</Typography></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card><CardContent><Typography color="text.secondary">Total Bugs</Typography><Typography variant="h4">{summary.total_bugs}</Typography></CardContent></Card>
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Recent Users</Typography>
              {summary.recent_users?.length ? (
                <Stack spacing={1.5}>
                  {summary.recent_users.map((user) => (
                    <Box key={user.id} sx={{ p: 1.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                      <Typography fontWeight={600}>{user.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Joined: {new Date(user.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No users yet.</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Activity Log</Typography>
              {activity.length ? (
                <Stack spacing={1.5}>
                  {activity.map((item) => (
                    <Box key={item.id} sx={{ p: 1.5, border: "1px solid #e5e7eb", borderRadius: 2 }}>
                      <Typography fontWeight={700}>
                        {item.user_email} changed {item.field_name} on bug #{item.bug_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(item.changed_at).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No activity yet.</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>User Roles</Typography>
              <Stack spacing={1.5}>
                {users.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      p: 1.5,
                      border: "1px solid #e5e7eb",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{user.email}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ID: {user.id}
                      </Typography>
                    </Box>
                    <Select
                      size="small"
                      value={user.role}
                      onChange={(event) => handleRoleChange(user.id, event.target.value)}
                      disabled={savingUserId === user.id}
                      sx={{ minWidth: 140 }}
                    >
                      <MenuItem value="viewer">Viewer</MenuItem>
                      <MenuItem value="developer">Developer</MenuItem>
                      <MenuItem value="manager">Manager</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </PageWrapper>
  );
}
