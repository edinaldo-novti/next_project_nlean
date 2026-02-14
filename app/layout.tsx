import '@/app/globals.css'
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className="antialiased bg-green-500"
      >
      {children}
    </body>
  </html>
  );
}
