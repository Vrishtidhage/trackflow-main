import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import { api } from "../api";
import { AuthContext } from "../contexts/AuthContext";
import PageHeader from "../components/ui/PageHeader";
import PageWrapper from "../components/ui/PageWrapper";
import { FormatDate } from "../components/BugsCard";

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(user);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message || "Failed to load profile"));
  }, []);

  const email = profile?.email || "Unknown user";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <PageWrapper>
      <PageHeader title="Profile" />
      {error && <Alert severity="error">{error}</Alert>}

      <Card elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
            <Avatar sx={{ width: 72, height: 72, bgcolor: "#2563eb", fontWeight: 800 }}>
              {initials}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h5" fontWeight={800}>
                {email}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Chip size="small" icon={<PersonOutlineOutlinedIcon />} label={profile?.role || "developer"} />
                <Chip size="small" label={`User ID #${profile?.id || "-"}`} />
              </Stack>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={1.5}>
            <Typography color="text.secondary">
              Account created: {FormatDate(profile?.created_at, true) || "Unavailable"}
            </Typography>
            <Typography color="text.secondary">
              Last updated: {FormatDate(profile?.updated_at, true) || "Unavailable"}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
