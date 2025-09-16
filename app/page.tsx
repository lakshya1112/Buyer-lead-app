// app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // The middleware already protects this route, so if a user
  // lands here, they are authenticated. Redirect to the main app page.
  redirect('/buyers');
}