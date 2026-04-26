import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { getTokenPayload, isAdminUser } from "../utils/auth";

const QUICK_PROMPTS = [
  "How do I create a project?",
  "How do I report a bug?",
  "Where is dashboard?",
  "How to run backend?",
];

function getBotReply(message, pathname, isAdmin) {
  const text = message.toLowerCase();

  if (text.includes("create") && text.includes("project")) {
    return {
      text: "Open New Project, enter title/description, then click Launch Project.",
      actions: [{ label: "Open New Project", path: "/projects/new" }],
    };
  }

  if (text.includes("bug") && (text.includes("report") || text.includes("create"))) {
    return {
      text: "Go to any project, then use New Bug to add title, description, status, and priority.",
      actions: [{ label: "Open Projects", path: "/projects" }],
    };
  }

  if (text.includes("dashboard") || text.includes("stats")) {
    return {
      text: isAdmin
        ? "Admin dashboard shows charts, user activity, and project-wide health."
        : "Dashboard opens your private workspace with projects and assigned bugs.",
      actions: [{ label: "Open Dashboard", path: "/dashboard" }],
    };
  }

  if (text.includes("run") || text.includes("start") || text.includes("backend")) {
    return {
      text: "Backend: `cd server` then `./venv/Scripts/python.exe -m uvicorn app.main:app --reload`. Frontend: `cd client` then `npm.cmd run dev`.",
      actions: [],
    };
  }

  if (text.includes("where am i") || text.includes("current page")) {
    return {
      text: `You are currently on: ${pathname}`,
      actions: [],
    };
  }

  return {
    text: "I can help with navigation, creating projects/bugs, and run commands. Try one of the quick prompts.",
    actions: [],
  };
}

export default function HelpChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Hi! I am your TrackFlow helper. Ask me how to create projects, report bugs, or navigate pages.",
      actions: [],
    },
  ]);

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdmin = isAdminUser(getTokenPayload());
  const bottomRef = useRef(null);
  const messageIdRef = useRef(2);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, open]);

  const pushUserAndBotMessage = (rawText) => {
    const trimmed = rawText.trim();
    if (!trimmed) return;
    const userId = messageIdRef.current;
    messageIdRef.current += 1;
    const botId = messageIdRef.current;
    messageIdRef.current += 1;

    const userMessage = {
      id: userId,
      role: "user",
      text: trimmed,
      actions: [],
    };
    const reply = getBotReply(trimmed, pathname, isAdmin);
    const botMessage = {
      id: botId,
      role: "bot",
      text: reply.text,
      actions: reply.actions,
    };

    setMessages((prev) => [...prev, userMessage, botMessage]);
    setInput("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    pushUserAndBotMessage(input);
  };

  return (
    <>
      {open && (
        <Paper
          elevation={10}
          sx={{
            position: "fixed",
            right: 20,
            bottom: 90,
            width: { xs: "calc(100vw - 24px)", sm: 360 },
            maxHeight: 520,
            zIndex: 1600,
            borderRadius: 3,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "#111827",
              color: "#f9fafb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography fontWeight={700} fontSize={14}>
              TrackFlow Help
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#f9fafb" }}>
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Stack spacing={1} sx={{ p: 1.5, height: 320, overflowY: "auto", bgcolor: "#f9fafb" }}>
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <Paper
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    bgcolor: message.role === "user" ? "#2563eb" : "#ffffff",
                    color: message.role === "user" ? "#ffffff" : "#111827",
                    border: message.role === "user" ? "none" : "1px solid #e5e7eb",
                  }}
                >
                  <Typography fontSize={13}>{message.text}</Typography>
                </Paper>

                {message.actions?.length > 0 && (
                  <Stack direction="row" spacing={1} mt={1}>
                    {message.actions.map((action) => (
                      <Button
                        key={action.label}
                        size="small"
                        variant="outlined"
                        onClick={() => navigate(action.path)}
                        sx={{ textTransform: "none" }}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Stack>
                )}
              </Box>
            ))}
            <Box ref={bottomRef} />
          </Stack>

          <Divider />

          <Box sx={{ p: 1.2, bgcolor: "#ffffff" }}>
            <Stack direction="row" spacing={1} mb={1}>
              {QUICK_PROMPTS.slice(0, 2).map((prompt) => (
                <Button
                  key={prompt}
                  size="small"
                  variant="text"
                  onClick={() => pushUserAndBotMessage(prompt)}
                  sx={{ textTransform: "none", fontSize: 11 }}
                >
                  {prompt}
                </Button>
              ))}
            </Stack>

            <form onSubmit={handleSubmit}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Ask for help..."
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                />
                <IconButton type="submit" color="primary" aria-label="send help message">
                  <SendRoundedIcon />
                </IconButton>
              </Stack>
            </form>
          </Box>
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label="open help chatbot"
        onClick={() => setOpen((prev) => !prev)}
        sx={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 1600,
        }}
      >
        {open ? <CloseRoundedIcon /> : <ChatRoundedIcon />}
      </Fab>
    </>
  );
}
