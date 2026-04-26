import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Divider,
} from "@mui/material";

import Priority from "./utils/Priority";
import Status from "./utils/Status";
import Spinner from "./utils/Spinner";

// Design Tokens
const COLORS = {
  border: "#e5e7eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  accent: "#2563eb",
};

// ✅ SAFE DATE FORMAT
export function FormatDate(isoDate, Time = false) {
  if (!isoDate) return "";

  const dateObj = new Date(isoDate);

  if (isNaN(dateObj)) return "";

  const optionsDate = { year: "numeric", month: "long", day: "numeric" };
  const optionsTime = { hour: "2-digit", minute: "2-digit" };

  const formattedDate = dateObj.toLocaleDateString(undefined, optionsDate);
  const formattedTime = dateObj.toLocaleTimeString(undefined, optionsTime);

  return Time
    ? `${formattedDate}, ${formattedTime}`
    : formattedDate;
}

export default function BugsCard({ bugs }) {
  const navigate = useNavigate();
  const { project_id } = useParams();

  if (!Array.isArray(bugs)) return <Spinner />;

  return bugs.map((bug) => {
    if (!bug) return null;

    return (
      <Card
        key={bug.id}
        onClick={() => {
          if (!bug?.id) return;
          const targetProjectId = project_id || bug.project_id;
          if (!targetProjectId) return;
          navigate(`/projects/${targetProjectId}/bugs/${bug.id}`);
        }}
        sx={{
          mb: 1.5,
          borderRadius: "12px",
          border: `1px solid ${COLORS.border}`,
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateX(4px)",
            borderColor: COLORS.accent,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
        }}
      >
        <CardContent sx={{ p: "20px !important" }}>

          {/* MAIN */}
          <Box display="flex" alignItems="flex-start" gap={3}>
            
            {/* ID */}
            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "monospace",
                bgcolor: "#f9fafb",
                px: 1,
                py: 0.5,
                borderRadius: "6px",
                border: `1px solid ${COLORS.border}`,
              }}
            >
              #{bug?.id || "—"}
            </Typography>

            <Box flex={1}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={1}
              >
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color={COLORS.textPrimary}
                  sx={{ lineHeight: 1.2 }}
                >
                  {bug?.title || "Untitled Bug"}
                </Typography>

                <Stack direction="row" spacing={1.5}>
                  <Priority priority={bug?.priority} />
                  <Status status={bug?.status} />
                </Stack>
              </Stack>

              <Typography
                mt={1}
                color={COLORS.textSecondary}
                fontSize={14}
                sx={{
                  lineHeight: 1.5,
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {bug?.description || "No description provided"}
              </Typography>

              {/* FOOTER */}
              <Stack
                direction="row"
                divider={
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{ height: 12, my: "auto" }}
                  />
                }
                spacing={2}
                mt={2}
              >
                <Typography
                  fontSize={11}
                  fontWeight={500}
                  sx={{
                    color: "#9ca3af",
                    textTransform: "uppercase",
                  }}
                >
                  Created: {FormatDate(bug?.created_at)}
                </Typography>

                <Typography
                  fontSize={11}
                  fontWeight={500}
                  sx={{
                    color: "#9ca3af",
                    textTransform: "uppercase",
                  }}
                >
                  Updated: {FormatDate(bug?.updated_at)}
                </Typography>
              </Stack>
            </Box>
          </Box>

        </CardContent>
      </Card>
    );
  });
}
