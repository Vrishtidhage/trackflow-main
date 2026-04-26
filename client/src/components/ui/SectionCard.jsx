import { Card, CardContent } from "@mui/material";

export default function SectionCard({ children }) {
  return (
    <Card sx={{ backgroundColor: "#1f2937", color: "white" }}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}