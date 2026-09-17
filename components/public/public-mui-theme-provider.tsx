"use client";

import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export default function PublicMuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: {
            main: "#f43f5e", // Rose 500
            light: "#fb7185",
            dark: "#e11d48",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#818cf8", // Indigo 400
            light: "#a5b4fc",
            dark: "#6366f1",
            contrastText: "#ffffff",
          },
          background: {
            default: "#0a0d14",
            paper: "#121826",
          },
          text: {
            primary: "#f8fafc",
            secondary: "#94a3b8",
          },
          divider: "transparent",
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily:
            'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          button: {
            textTransform: "none",
            fontWeight: 600,
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 9999,
                border: "none",
                boxShadow: "none",
                textTransform: "none",
                "&:hover": {
                  border: "none",
                  boxShadow: "none",
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                border: "none",
                borderRadius: 9999,
                fontWeight: 600,
                fontSize: "0.75rem",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                border: "none",
                backgroundImage: "none",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                border: "none",
                boxShadow: "none",
                backgroundImage: "none",
              },
            },
          },
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
