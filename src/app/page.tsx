import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/dashboard');
  return null; // redirect() is a server-side utility, component should return null or JSX
}
