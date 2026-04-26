import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";

import {
  FolderKanban,
  Bug,
  Pencil,
  Trash2,
  Users,
  CircleCheckBig,
} from "lucide-react";

import { FormatDate } from "./BugsCard";
import { useContext, useMemo, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
import { memo } from "react";
import { canManageProjects } from "../utils/auth";

const COLORS = {
  border: "#e5e7eb",
  primary: "#2563eb",
  success: "#16a34a",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  danger: "#ef4444",
};

function ProjectCard({ project, handleClick, setProjects }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ SAFE + OPTIMIZED
  const bugsDone = useMemo(() => {
    if (!Array.isArray(project?.bugs)) return 0;
    return project.bugs.reduce(
      (count, b) => (b.status === "done" ? count + 1 : count),
      0
    );
  }, [project?.bugs]);

  // ✅ SAFE HANDLER
  const handleEdit = useCallback(
    (e) => {
      e.stopPropagation();
      if (!project?.id) return;
      navigate(`/projects/${project.id}/edit`);
    },
    [project?.id, navigate]
  );

  // ✅ SAFE HANDLER
  const handleDelete = useCallback(
    async (e) => {
      e.stopPropagation();

      if (!project?.id) return;

      const agree = window.confirm(
        "Delete this project? All bugs will be removed."
      );
      if (!agree) return;

      try {
        await axios.delete(`${API_BASE_URL}/projects/${project.id}`);

        setProjects((prev) =>
          prev?.filter((p) => p.id !== project.id)
        );
      } catch (err) {
        console.error("Delete failed:", err);
      }
    },
    [project?.id, setProjects]
  );

  if (!project) return null;

  return (
    <Card
      onClick={handleClick}
      sx={{
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        cursor: "pointer",
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 20px -5px rgba(0,0,0,0.1)",
          borderColor: COLORS.primary,
        },
      }}
    >
      <CardContent sx={{ p: "24px !important" }}>
        
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Stack direction="row" spacing={2} alignItems="center">
            
            <Box
              sx={{
                p: 1.2,
                borderRadius: "10px",
                bgcolor: `${COLORS.primary}10`,
                color: COLORS.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderKanban size={20} strokeWidth={2.5} />
            </Box>

            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: COLORS.textPrimary }}
            >
              {project.title || "Untitled Project"}
            </Typography>
          </Stack>

          {canManageProjects(user) && (
            <Stack direction="row" spacing={0.5}>
              
              <MuiTooltip title="Edit Project">
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  sx={{
                    color: COLORS.textSecondary,
                    "&:hover": {
                      color: COLORS.primary,
                      bgcolor: `${COLORS.primary}10`,
                    },
                  }}
                >
                  <Pencil size={16} />
                </IconButton>
              </MuiTooltip>

              <MuiTooltip title="Delete Project">
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  sx={{
                    color: COLORS.textSecondary,
                    "&:hover": {
                      color: COLORS.danger,
                      bgcolor: `${COLORS.danger}10`,
                    },
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              </MuiTooltip>

            </Stack>
          )}
        </Box>

        {/* DESCRIPTION */}
        <Typography
          color={COLORS.textSecondary}
          fontSize={14}
          sx={{
            lineHeight: 1.6,
            mb: 3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "44px",
          }}
        >
          {project.description || "No description provided for this project."}
        </Typography>

        {/* FOOTER */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pt={2}
          sx={{ borderTop: `1px solid ${COLORS.border}` }}
        >
          <Stack direction="row" spacing={3}>
            
            <Box display="flex" alignItems="center" gap={0.75} sx={{ color: COLORS.textSecondary }}>
              <Bug size={14} />
              <Typography fontWeight={600} fontSize={13}>
                {project?.bugs?.length || 0}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={0.75} sx={{ color: COLORS.success }}>
              <CircleCheckBig size={14} />
              <Typography fontWeight={600} fontSize={13}>
                {bugsDone}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={0.75} sx={{ color: COLORS.textSecondary }}>
              <Users size={14} />
              <Typography fontWeight={600} fontSize={13}>
                {project?.members?.length || 0}
              </Typography>
            </Box>

          </Stack>

          <Typography fontSize={11} fontWeight={600} color="#9ca3af">
            {project?.created_at ? FormatDate(project.created_at) : ""}
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
}

// ✅ FINAL EXPORT
export default memo(ProjectCard);
