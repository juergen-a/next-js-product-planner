import Link from 'next/link';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <div className={styles.Footer}>
      <div>Company Abcdef | Department: Product Development</div>
    </div>
  );
}
