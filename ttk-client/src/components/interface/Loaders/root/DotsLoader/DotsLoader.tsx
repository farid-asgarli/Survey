import styles from './DotsLoader.module.css';

export default function DotsLoader() {
  return (
    <div className={styles.dots_loader}>
      {[...Array(10)].map((_, i) => (
        <span
          className={styles['single-dot']}
          style={{
            animationDelay: i === 0 ? `0` : `0.${i}s`,
          }}
          key={i}
        />
      ))}
    </div>
  );
}
