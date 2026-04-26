export function BlueButton({
  children,
  onClick,
  className = "",
  type = "button",
  size = "py-2 px-4",
  disabled = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation(); // ✅ prevents parent click interference
        if (onClick) onClick(e);
      }}
      className={`flex items-center justify-center ${size} rounded-lg font-semibold
      bg-blue-600 text-white shadow-md
      hover:bg-blue-700 hover:shadow-lg
      focus:outline-none focus:ring-2 focus:ring-blue-400
      disabled:bg-blue-400 disabled:cursor-not-allowed
      transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

export function BlackButton({
  children,
  onClick,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={(e) => {
        e.stopPropagation(); // ✅ important fix
        if (onClick) onClick(e);
      }}
      className={`flex items-center justify-center py-2 px-4 rounded-lg font-semibold
      bg-neutral-800 text-white border border-neutral-600
      hover:bg-neutral-700 hover:border-neutral-500 hover:shadow-md
      focus:outline-none focus:ring-2 focus:ring-neutral-400
      transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}

export function RedButton({
  children,
  onClick,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={(e) => {
        e.stopPropagation(); // ✅ prevents click blocking
        if (onClick) onClick(e);
      }}
      className={`flex items-center justify-center py-2 px-4 rounded-lg font-semibold
      bg-red-600 text-white shadow-md
      hover:bg-red-700 hover:shadow-lg
      focus:outline-none focus:ring-2 focus:ring-red-400
      transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}