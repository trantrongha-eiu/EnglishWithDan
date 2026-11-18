import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from '../components/Nav';

const ROUTE_TITLES = {
  '/dashboard': 'Sổ từ vựng – EnglishWithDan',
};

export default function StudentLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = ROUTE_TITLES[pathname] || (pathname.startsWith('/dashboard') ? ROUTE_TITLES['/dashboard'] : 'EnglishWithDan');
  }, [pathname]);

  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}
