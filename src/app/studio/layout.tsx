// The Studio gets its own root layout so none of the site's styles leak into it.
// Access is protected by Sanity's own login: only project members can sign in.
export default function StudioLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body style={{margin: 0}}>{children}</body>
    </html>
  )
}
