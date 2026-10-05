function Button({ children }) {
  return (
    <button
      type="button"
      className="rounded-lg bg-indigo-600 px-6 py-3 font-medium transition hover:bg-indigo-500"
    >
      {children}
    </button>
  );
}

export default Button;