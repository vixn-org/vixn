"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export type AdminThemeMode = "dark" | "light";

interface AdminThemeContextType {
  mode: AdminThemeMode;
  toggleMode: () => void;
  setMode: (mode: AdminThemeMode) => void;
}

export const AdminThemeContext = createContext<AdminThemeContextType>({
  mode: "dark",
  toggleMode: () => {},
  setMode: () => {},
});

export const useAdminTheme = () => useContext(AdminThemeContext);

export default function AdminMuiThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<AdminThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("vixn_admin_theme") as AdminThemeMode | null;
    if (saved === "light" || saved === "dark") {
      setModeState(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (mode === "dark") {
        document.documentElement.classList.add("dark", "admin-dark");
        document.documentElement.classList.remove("admin-light");
        document.body.classList.add("dark", "admin-dark");
        document.body.classList.remove("admin-light");
      } else {
        document.documentElement.classList.remove("dark", "admin-dark");
        document.documentElement.classList.add("admin-light");
        document.body.classList.remove("dark", "admin-dark");
        document.body.classList.add("admin-light");
      }
    }
  }, [mode]);

  const setMode = (newMode: AdminThemeMode) => {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("vixn_admin_theme", newMode);
    }
  };

  const toggleMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  const theme = useMemo(() => {
    const isDark = mode === "dark";

    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: {
          main: isDark ? "#f43f5e" : "#1e293b",
          light: isDark ? "#fb7185" : "#334155",
          dark: isDark ? "#e11d48" : "#0f172a",
          contrastText: "#ffffff",
        },
        secondary: {
          main: isDark ? "#818cf8" : "#2563eb",
          light: isDark ? "#a5b4fc" : "#3b82f6",
          dark: isDark ? "#6366f1" : "#1d4ed8",
          contrastText: "#ffffff",
        },
        success: {
          main: isDark ? "#10b981" : "#059669",
          light: "#34d399",
          dark: "#047857",
        },
        warning: {
          main: isDark ? "#f59e0b" : "#d97706",
          light: "#fbbf24",
          dark: "#b45309",
        },
        error: {
          main: "#ef4444",
          light: "#f87171",
          dark: "#dc2626",
        },
        background: {
          default: isDark ? "#090d16" : "#f8fafc",
          paper: isDark ? "#0f1422" : "#ffffff",
        },
        text: {
          primary: isDark ? "#f8fafc" : "#0f172a",
          secondary: isDark ? "#94a3b8" : "#64748b",
        },
        divider: isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0",
      },
      shape: {
        borderRadius: 8,
      },
      typography: {
        fontFamily:
          'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
            contained: {
              backgroundColor: isDark ? "#f43f5e" : "#0f172a",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: isDark ? "#e11d48" : "#1e293b",
                boxShadow: "none",
              },
            },
            outlined: {
              borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
              color: isDark ? "#f8fafc" : "#334155",
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
              "&:hover": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.25)" : "#cbd5e1",
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#f8fafc",
                boxShadow: "none",
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              border: isDark
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "1px solid #e2e8f0",
              backgroundColor: isDark ? "#0f1422" : "#ffffff",
              boxShadow: isDark
                ? "0 4px 20px -2px rgba(0, 0, 0, 0.5)"
                : "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
              backgroundImage: "none",
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none",
              backgroundColor: isDark ? "#0f1422" : "#ffffff",
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              fontWeight: 600,
              fontSize: "0.75rem",
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : undefined,
              color: isDark ? "#e2e8f0" : undefined,
            },
          },
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#f8fafc",
              transition: "border-color 0.15s ease, background-color 0.15s ease",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#e2e8f0",
                borderWidth: "1px !important",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.25)" : "#cbd5e1",
                borderWidth: "1px !important",
              },
              "&.Mui-focused": {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#ffffff",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: isDark ? "#f43f5e" : "#0f172a",
                borderWidth: "1px !important",
              },
            },
            input: {
              fontSize: "0.875rem",
              color: isDark ? "#f8fafc" : "#0f172a",
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
              color: isDark ? "#cbd5e1" : "#334155",
            },
            head: {
              backgroundColor: isDark ? "#090d16" : "#f8fafc",
              color: isDark ? "#94a3b8" : "#475569",
              fontWeight: 700,
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundColor: isDark ? "#0f1422" : "#ffffff",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e2e8f0",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            },
          },
        },
        MuiMenu: {
          styleOverrides: {
            paper: {
              backgroundColor: isDark ? "#0f1422" : "#ffffff",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #e2e8f0",
              color: isDark ? "#f8fafc" : "#0f172a",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
            },
          },
        },
        MuiMenuItem: {
          styleOverrides: {
            root: {
              color: isDark ? "#f8fafc" : "#0f172a",
              "&:hover": {
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#f1f5f9",
              },
              "&.Mui-selected": {
                backgroundColor: isDark ? "rgba(244, 63, 94, 0.15)" : "#f1f5f9",
                color: isDark ? "#fb7185" : "#0f172a",
                "&:hover": {
                  backgroundColor: isDark ? "rgba(244, 63, 94, 0.25)" : "#e2e8f0",
                },
              },
            },
          },
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              "& .MuiTab-root": {
                color: isDark ? "#94a3b8" : "#64748b",
                "&.Mui-selected": {
                  color: "#ffffff",
                  backgroundColor: isDark ? "#f43f5e" : "#0f172a",
                },
              },
            },
          },
        },
      },
    });
  }, [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode,
      setMode,
    }),
    [mode]
  );

  return (
    <AdminThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AdminThemeContext.Provider>
  );
}
