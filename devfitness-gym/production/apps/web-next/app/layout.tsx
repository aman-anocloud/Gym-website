import "./globals.css";

export const metadata = {
  title: "DEV FITNESS GYM",
  description: "Gym management system for DEV FITNESS GYM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
