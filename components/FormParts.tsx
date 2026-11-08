import type { FormState } from "@/lib/types";

type FieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: string;
  textarea?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Field({ name, label, error, hint, textarea, className = "", ...rest }: FieldProps) {
  const id = `f-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const common = { id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy, className: "field" };
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-semibold text-ink">
        {label}
        {!rest.required && <span className="font-normal text-bark"> (isteğe bağlı)</span>}
      </label>
      {textarea ? <textarea rows={4} {...common} {...rest} /> : <input {...common} {...rest} />}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-bark">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm font-semibold text-[#9b3a26]">
          {error}
        </p>
      )}
    </div>
  );
}

/** Hidden from people and assistive tech; bots tend to fill it. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Web siteniz
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  const success = state.status === "success";
  return (
    <p
      role={success ? "status" : "alert"}
      className={`rounded-xl px-4 py-3 font-semibold ${success ? "bg-sage-soft text-forest" : "bg-[#f6e2dc] text-[#7a2c1c]"}`}
    >
      {state.message}
    </p>
  );
}

export const initialFormState: FormState = { status: "idle" };
