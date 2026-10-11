"use client";

/** Botão de envio que pede confirmação antes de uma ação destrutiva. */
export function ConfirmButton({ message, ...props }: React.ComponentProps<"button"> & { message: string }) {
  return (
    <button
      {...props}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    />
  );
}
