import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const roleNav = {
  admin: [
    { to: '/', label: 'Dashboard' },
    { to: '/users', label: 'Users' },
    { to: '/students', label: 'Students' },
    { to: '/teachers', label: 'Teachers' },
    { to: '/courses', label: 'Courses' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/marks', label: 'Marks' },
    { to: '/discipline', label: 'Discipline' },
    { to: '/homework', label: 'Homework' },
    { to: '/exercises', label: 'Exercises' },
    { to: '/notes', label: 'Notes' },
    { to: '/fees', label: 'Fees' },
    { to: '/announcements', label: 'Announcements' },
  ],
  bursar: [
    { to: '/', label: 'Dashboard' },
    { to: '/fees', label: 'Fees & Payments' },
    { to: '/students', label: 'Students' },
  ],
  dean: [
    { to: '/', label: 'Dashboard' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/teachers', label: 'Teachers' },
    { to: '/students', label: 'Students' },
    { to: '/discipline', label: 'Discipline' },
  ],
  teacher: [
    { to: '/', label: 'Dashboard' },
    { to: '/marks', label: 'Marks' },
    { to: '/discipline', label: 'Discipline' },
    { to: '/homework', label: 'Homework' },
    { to: '/notes', label: 'Notes' },
    { to: '/exercises', label: 'Exercises' },
    { to: '/attendance', label: 'Attendance' },
  ],
  student: [
    { to: '/', label: 'Dashboard' },
    { to: '/notes', label: 'Notes' },
    { to: '/exercises', label: 'Exercises' },
    { to: '/homework', label: 'Homework' },
    { to: '/reports', label: 'My Reports' },
  ],
};

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const navItems = roleNav[user?.role] || roleNav.admin;

  return (
    <aside style={styles.aside}>
      <div style={styles.logo}>
        <span style={styles.logoText}>Gishoma</span>
        <span style={styles.logoSub}>School Management</span>
      </div>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  aside: {
    width: '240px',
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    padding: '1.5rem 0',
    flexShrink: 0,
  },
  logo: {
    padding: '0 1.5rem 1.5rem',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: '1rem',
  },
  logoText: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.5rem',
    display: 'block',
  },
  logoSub: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navItem: {
    padding: '0.6rem 1.5rem',
    color: 'var(--color-text-muted)',
    fontSize: '0.9rem',
  },
  navItemActive: {
    color: 'var(--color-accent)',
    background: 'rgba(59, 130, 246, 0.1)',
    borderLeft: '3px solid var(--color-accent)',
  },
};
