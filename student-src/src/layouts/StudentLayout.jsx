import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

// The top nav comes from the site shell (js/bundles/app-shell.js → nav.js).
export default function StudentLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = pathname.startsWith('/dashboard') ? 'Vocabulary – EnglishWithDan' : 'EnglishWithDan';
  }, [pathname]);

  return <Outlet />;
}
