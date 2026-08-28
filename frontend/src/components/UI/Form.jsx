export function Form({ onSubmit, children, className = '' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  };

  return (
    <form className={`stack-form ${className}`} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

export function FormRow({ children, className = '' }) {
  return <div className={`form-row ${className}`}>{children}</div>;
}