import type { Metadata } from "next";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

/**
 * App metadata
 */
export const metadata: Metadata = {
  title: "Remember Pertinent Info",
  description: "A smart memory assistant to help you remember what matters",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          /* Make MUI AppBar fully colorless across modes */
          .MuiAppBar-root,
          .MuiPaper-root.MuiAppBar-root {
            background-color: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          /* Remove any pseudo-element overlays */
          .MuiAppBar-root::before,
          .MuiAppBar-root::after {
            content: none !important;
            background: none !important;
          }

          /* Ensure Toolbar inside AppBar is also transparent */
          .MuiAppBar-root .MuiToolbar-root {
            background: transparent !important;
          }
        `}</style>
      </head>
      <body>
        {/* MUI theme provider wraps the entire app */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}