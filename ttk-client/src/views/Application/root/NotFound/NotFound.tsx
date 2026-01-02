import { AppIllustrations } from '@src/components/illustrations';
import styles from './NotFound.module.scss';

export default function NotFound() {
  return (
    <section className={styles['views__not-found']}>
      <div className={styles.inner}>
        <AppIllustrations.Void width={300} height={300} />
        <div className={styles.content}>
          <h1>Təəsüf ki, axtardığınız səhifə tapılmadı</h1>
          <span className={styles.legend}>Yanlışlıq olduğunu düşünürsünüzsə, zəhmət olmasa administratorla əlaqə saxlayın.</span>
        </div>
      </div>
    </section>
  );
}
