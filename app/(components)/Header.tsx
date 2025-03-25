import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <div className={styles.Header}>
      <div>
        <div>
          <div>Logo</div>
        </div>
        <nav>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </nav>
      </div>
    </div>
  );
}
