export function Button({
  children,
  variant = 'ghost',
  size = 'default',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const variants = {
    primary: 'button primary',
    ghost: 'button ghost',
    'ghost-cyan': 'button ghost cyan',
  };

  const sizes = {
    default: '',
    small: 'small',
    wide: 'wide',
  };

  const classes = [
    variants[variant] || variants.ghost,
    sizes[size] || '',
    className,
    fullWidth ? 'wide' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}