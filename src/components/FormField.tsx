
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

const FormField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  error,
}: FormFieldProps) => (
  <div className="space-y-2 text-left">
    <Label htmlFor={name} className="block text-left">
      {label} {required && "*"}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={error ? "border-red-500" : ""}
    />
    {error && (
      <p className="text-sm text-red-500 mt-1">{error}</p>
    )}
  </div>
);

export default FormField;
