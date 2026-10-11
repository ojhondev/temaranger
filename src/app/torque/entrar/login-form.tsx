"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

import { login, type LoginState } from "../actions/auth";

const field = "h-12 w-full rounded-lg border border-[#d6d6dc] bg-white px-4 text-[15px] outline-none focus:border-[#2a2a33]";

export function LoginForm({ back }: { back?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="voltar" value={back ?? ""} />
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#3d3d47]">
        E-mail
        <input name="email" type="email" autoComplete="email" required className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#3d3d47]">
        Senha
        <span className="relative">
          <input name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${field} pr-12`} />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? "Esconder senha" : "Mostrar senha"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b6b76]"
          >
            {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        </span>
      </label>
      {state.error && <p className="rounded-lg bg-[#fde8ec] px-4 py-3 text-sm font-medium text-[#b4122f]">{state.error}</p>}
      <button
        disabled={pending}
        className="mt-2 flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2a2a33] font-semibold text-white hover:bg-black disabled:opacity-70"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Entrar no Torque
      </button>
      <p className="text-center text-xs text-[#6b6b76]">Esqueceu a senha? Peça ao gestor da loja para redefinir em Equipe.</p>
    </form>
  );
}
