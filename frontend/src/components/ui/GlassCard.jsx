
const GlassCard = ({
  title,
  children,
  className = "",
  variant = 'default',
  elevated = false,
  ...rest
}) => {
  const clickable = typeof rest.onClick === 'function';

  const variants = {
    default: 'bg-white/60 backdrop-blur-xl border border-white/40',
    subtle: 'bg-white/40 backdrop-blur-sm border border-white/20',
    dark: 'bg-gray-900/40 backdrop-blur-xl border border-gray-700/30 text-white',
    accent: 'bg-blue-50/60 backdrop-blur-xl border border-blue-200/40',
  };

  const classes = `
    ${variants[variant]}
    shadow-md rounded-2xl p-6
    ${elevated ? 'shadow-lg hover:shadow-xl' : ''}
    ${clickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all' : ''}
    ${className}
  `;

  return (
    <div
      {...rest}
      className={classes.trim()}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && rest.onClick?.() : undefined}
    >
      {title && (
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
};

export default GlassCard;
