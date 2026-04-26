import { useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Avatar,
  Stack,
  Paper,
  Tooltip,
  Alert,
} from "@mui/material";
import { Edit3, Trash2, Check, X } from "lucide-react";

import { FormatDate } from "./BugsCard";
import TextWithBugLinks from "./utils/TextWithBugLinks";
import API_BASE_URL from "../api";

// Design Tokens
const COLORS = {
  border: "#e5e7eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  bgSecondary: "#f9fafb",
  accent: "#2563eb",
  danger: "#ef4444",
};

export default function CommentCard({ comment, userId, commentsState, project_id }) {
  const { setComments } = commentsState;

  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment?.content || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ NEW

  const isAuthor = userId === comment?.created_by_id;

  // ✅ SAFE DELETE
  const handleDelete = useCallback(async () => {
    if (!window.confirm("Delete this comment permanently?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/comments/${comment.id}`);

      setComments((prev) =>
        prev.filter((c) => c.id !== comment.id)
      );
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Failed to delete comment");
    }
  }, [comment.id, setComments]);

  // ✅ SAFE UPDATE
  const handleUpdate = useCallback(async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/comments/${comment.id}`,
        { content }
      );

      const updatedComment = res.data?.data;

      setComments((prev) =>
        prev.map((c) =>
          c.id === updatedComment.id ? updatedComment : c
        )
      );

      setEditing(false);
    } catch (err) {
      console.error("Update failed:", err);
      setError("Failed to update comment");
    } finally {
      setLoading(false);
    }
  }, [content, comment.id, setComments, loading]);

  // ✅ SAFE USER DATA
  const email = comment?.created_by?.email || "unknown";
  const username = email.split("@")[0];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "#d1d5db",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        },
      }}
    >
      <Stack direction="row" spacing={2}>

        {/* AVATAR */}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: "0.9rem",
            fontWeight: 600,
            bgcolor: COLORS.bgSecondary,
            color: COLORS.accent,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          {email[0]?.toUpperCase()}
        </Avatar>

        <Box sx={{ flexGrow: 1 }}>

          {/* HEADER */}
          <Stack direction="row" justifyContent="space-between">
            <Box mb={1}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color={COLORS.textPrimary}
              >
                {username}
              </Typography>

              <Typography
                variant="caption"
                color={COLORS.textSecondary}
              >
                {FormatDate(comment?.created_at, true)}
              </Typography>
            </Box>

            {/* ACTIONS */}
            {isAuthor && !editing && (
              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setEditing(true)}>
                    <Edit3 size={16} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete">
                  <IconButton size="small" onClick={handleDelete}>
                    <Trash2 size={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
            )}
          </Stack>

          {/* ERROR */}
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          {/* CONTENT */}
          {editing ? (
            <Stack spacing={1.5}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    bgcolor: COLORS.bgSecondary,
                  },
                }}
              />

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Check size={14} />}
                  onClick={handleUpdate}
                  disabled={loading || !content.trim()}
                >
                  {loading ? "Saving..." : "Save"}
                </Button>

                <Button
                  size="small"
                  startIcon={<X size={14} />}
                  onClick={() => {
                    setEditing(false);
                    setContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "#4b5563",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
                mt: 0.5,
              }}
            >
              <TextWithBugLinks
                text={comment?.content || ""}
                projectId={project_id}
              />
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}