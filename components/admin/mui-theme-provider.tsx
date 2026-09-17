"use client";

import { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

export default function AdminMuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#1e293b", // Slate 800 - crisp, professional minimal
            light: "#334155",
            dark: "#0f172a",
            contrastText: "#ffffff",
          },
          secondary: {
            main: "#2563eb", // Professional Blue accent
            light: "#3b82f6",
            dark: "#1d4ed8",
          },
          success: {
            main: "#059669",
            light: "#10b981",
            dark: "#047857",
          },
          warning: {
            main: "#d97706",
            light: "#f59e0b",
            dark: "#b45309",
          },
          background: {
            default: "#f8fafc",
            paper: "#ffffff",
          },
          text: {
            primary: "#0f172a",
            secondary: "#64748b",
          },
          divider: "#e2e8f0",
        },
        shape: {
          borderRadius: 8, // Crisp, professional 8px (not over-rounded)
        },
        typography: {
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          button: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.8125rem",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                boxShadow: "none",
                padding: "6px 14px",
                "&:hover": {
                  boxShadow: "none",
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                fontWeight: 600,
                fontSize: "0.75rem",
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                backgroundColor: "#f8fafc",
                transition: "border-color 0.15s ease, background-color 0.15s ease",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#e2e8f0",
                  borderWidth: "1px !important",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#cbd5e1",
                  borderWidth: "1px !important",
                },
                "&.Mui-focused": {
                  backgroundColor: "#ffffff",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#0f172a",
                  borderWidth: "1px !important",
                },
              },
              input: {
                fontSize: "0.875rem",
                color: "#0f172a",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              root: {
                borderColor: "#f1f5f9",
              },
            },
          },
        },
      }),
    []
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
