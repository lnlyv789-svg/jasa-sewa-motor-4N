// src/components/Button.jsx

const Button = ({
  children,
  variant = "solid", // "solid" | "outline" | "ghost"
  size = "medium", // "small" | "medium" | "large"
  className = "",
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
}) => {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Variant styles
  const variantStyles = {
    solid: "bg-[#F9A826] text-[#0B132B] hover:bg-[#e0991f] focus:ring-[#F9A826]",
    outline:
      "border-2 border-[#F9A826] text-[#F9A826] bg-transparent hover:bg-[#F9A826] hover:text-[#0B132B] focus:ring-[#F9A826]",
    ghost: "text-[#F9A826] bg-transparent hover:bg-[#F9A826]/10 focus:ring-[#F9A826]",
  };

  // Size styles
  const sizeStyles = {
    small: "px-4 py-2 text-sm",
    medium: "px-6 py-3 text-base",
    large: "px-8 py-4 text-lg",
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "";

  // Disabled styles
  const disabledStyles = disabled
    ? "opacity-50 cursor-not-allowed hover:scale-100"
    : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${widthStyles}
        ${disabledStyles}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;