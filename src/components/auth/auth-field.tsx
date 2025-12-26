// src/components/auth/auth-field.tsx
import { Input } from "@/components/ui/input";
import { toEnglishDigits } from "@/lib/utils";

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string[];
}

export function AuthField({
  label,
  error,
  onChange,
  ...props
}: AuthFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.type === "tel") {
      e.target.value = toEnglishDigits(e.target.value).replace(/[^0-9]/g, "");
    }
    onChange?.(e);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-bold text-gray-700 mr-1">{label}</label>
      )}
      <Input
        {...props}
        onChange={handleChange}
        className="h-14 rounded-2xl bg-gray-50/50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all text-lg mt-2"
      />
      {error && (
        <p className="text-xs text-red-500 font-medium px-1">{error[0]}</p>
      )}
    </div>
  );
}
