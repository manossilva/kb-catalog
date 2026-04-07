import ColorDot from './ColorDot'
import styles from './ProductCard.module.css'

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%2327272A' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%23555' font-size='16' text-anchor='middle' dy='.3em'%3ESem imagem%3C/text%3E%3C/svg%3E"

export default function ProductCard({ product, isAdmin, onEdit, onDelete }) {
  const { sizes = [], colors = [] } = product

  return (
    <div className={styles.card}>
      <img
        className={styles.img}
        src={product.image_url}
        alt={product.title}
        loading="lazy"
        onError={e => { e.target.src = FALLBACK }}
      />

      <div className={styles.body}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.comp}>{product.composition}</p>

        {sizes.length > 0 && (
          <div className={styles.sizes}>
            {sizes.map(s => (
              <div key={s.id} className={styles.badge}>
                <strong>{s.size_type}</strong> · REF {s.reference} · Qtd {s.quantity}
              </div>
            ))}
          </div>
        )}

        {colors.length > 0 && (
          <div className={styles.colors}>
            {colors.map(c => (
              <ColorDot key={c.id} hex={c.hex_color} code={c.code} name={c.name} />
            ))}
          </div>
        )}

        <div className={styles.footer}>
          {product.video_url ? (
            <a href={product.video_url} target="_blank" rel="noopener noreferrer" className={styles.video}>
              ▶ Ver vídeo
            </a>
          ) : <span />}

          {isAdmin && (
            <div className={styles.adminBtns}>
              <button className="btn btn-ghost btn-sm" onClick={() => onEdit(product)}>Editar</button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(product.id)}>×</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
