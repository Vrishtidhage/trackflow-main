import { Box, Container } from "@mui/material";
import Navbar from "../Navbar";
import { SURFACE } from "../../theme/visuals";

export default function PageWrapper({ children, sx = {}, showNavbar = true }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: SURFACE.page,
        background:
          "radial-gradient(circle at top left, rgba(37, 99, 235, 0.10), transparent 34%), linear-gradient(180deg, #ffffff 0%, #f4f7fb 42%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showNavbar && <Navbar />}

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flexGrow: 1,

          // ✅ FIXED: rely on Navbar <Toolbar /> spacer instead
          pt: showNavbar ? 3 : 0,

          pb: 6,
          px: { xs: 2, sm: 3 },

          // ✅ SAFE MERGE
          ...(sx || {}),
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
