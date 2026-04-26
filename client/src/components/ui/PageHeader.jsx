import { Box, Typography } from "@mui/material";
import { SURFACE } from "../../theme/visuals";

export default function PageHeader({ title, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
        mb: 3,
      }}
    >
      {typeof title === "string" ? (
        <Box>
          <Typography variant="overline" sx={{ color: SURFACE.primary, fontWeight: 900 }}>
            TrackFlow
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, color: SURFACE.ink }}>
            {title}
          </Typography>
        </Box>
      ) : (
        title
      )}
      {action}
    </Box>
  );
}
