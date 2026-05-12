import { redirect } from 'next/navigation';

export default function StudioRoot() {
  // Studio index redirects to first tab (Data); same as gui-demo IA.
  redirect('/studio/data');
}
