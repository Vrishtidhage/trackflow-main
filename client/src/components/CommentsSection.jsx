import { useContext, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material";
import MessageSquareIcon from "@mui/icons-material/ModeCommentOutlined";

import CommentCard from "./CommentCard";
import Spinner from "./utils/Spinner";
import { AuthContext } from "../contexts/AuthContext";
import API_BASE_URL from "../api";

// Design Tokens
const COLORS = {
  border: "#e5e7eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  bgSecondary: "#f9fafb",
  accent: "#2563eb",
};

export default function CommentsSection({ bugId, comments, setComments, project_id }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ NEW
  const { user } = useContext(AuthContext);

  // ✅ STABLE HANDLER
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!content.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/comments`, {
        content,
        bug_id: bugId
      });

      const newComment = res.data?.data;

      setContent("");

      // ✅ SAFE UPDATE
      setComments((prev) => [...(prev || []), newComment]);

    } catch (err) {
      console.error("Failed to post comment:", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [content, bugId, loading, setComments]);

  // ✅ LOADING STATE
  if (comments === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>

      {/* HEADER */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <MessageSquareIcon sx={{ color: COLORS.textSecondary, fontSize: 22 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Discussion ({comments.length})
        </Typography>
      </Stack>

      {/* ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* INPUT */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: "12px",
          border: `1px solid ${COLORS.border}`,
          bgcolor: "#ffffff"
        }}
      >
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            placeholder="Write a message or mention someone..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: COLORS.bgSecondary,
                borderRadius: "8px",
                fontSize: "0.95rem",
                "& fieldset": { borderColor: COLORS.border },
              }
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disableElevation
              disabled={loading || !content.trim()}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "8px",
                px: 3,
                bgcolor: COLORS.accent,
                "&:hover": { bgcolor: "#1d4ed8" }
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Post Comment"
              )}
            </Button>
          </Box>
        </form>
      </Paper>

      {/* COMMENTS */}
      <Stack spacing={2}>
        {comments.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              bgcolor: COLORS.bgSecondary,
              borderRadius: "12px"
            }}
          >
            <Typography variant="body2" color={COLORS.textSecondary}>
              No comments yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              project_id={project_id}
              comment={comment}
              userId={user?.id}
              commentsState={{ comments, setComments }}
            />
          ))
        )}
      </Stack>

      <Box sx={{ pt: 6 }} />
    </Box>
  );
}