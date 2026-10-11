import { changePassword, updateProfile } from "@/app/torque/actions/team";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { requireSession } from "@/lib/auth";

export const metadata = { title: "Conta" };

export default async function Conta({ searchParams }: { searchParams: Promise<{ salvo?: string; erro?: string }> }) {
  const s = await requireSession();
  const { salvo, erro } = await searchParams;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Minha conta" />
      <Saved show={salvo === "1"}>Perfil atualizado.</Saved>
      <Saved show={salvo === "senha"}>Senha alterada.</Saved>
      {erro && (
        <p className="mb-4 rounded-lg bg-[#fde8e8] px-4 py-3 text-sm font-medium text-[#a3242f]">
          {erro === "senha-atual" ? "A senha atual não confere." : "A nova senha precisa de 8+ caracteres e as duas devem ser iguais."}
        </p>
      )}
      <div className="flex flex-col gap-5">
        <Panel>
          <h2 className="mb-4 text-base font-semibold">Perfil</h2>
          <form action={updateProfile} className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome">
              <input name="name" defaultValue={s.user.name} className={field} />
            </Field>
            <Field label="WhatsApp">
              <input name="phone" defaultValue={s.user.phone ?? ""} className={field} />
            </Field>
            <Field label="E-mail (login)" hint="Para trocar o e-mail, peça ao gestor.">
              <input value={s.user.email ?? ""} disabled className={`${field} bg-[#f5f5f7]`} />
            </Field>
            <div className="sm:col-span-2">
              <SubmitButton>Salvar perfil</SubmitButton>
            </div>
          </form>
        </Panel>
        <Panel>
          <h2 className="mb-4 text-base font-semibold">Trocar senha</h2>
          <form action={changePassword} className="grid gap-4 sm:grid-cols-3">
            <Field label="Senha atual">
              <input name="current" type="password" autoComplete="current-password" required className={field} />
            </Field>
            <Field label="Nova senha">
              <input name="next" type="password" autoComplete="new-password" minLength={8} required className={field} />
            </Field>
            <Field label="Repita a nova senha">
              <input name="confirm" type="password" autoComplete="new-password" minLength={8} required className={field} />
            </Field>
            <div className="sm:col-span-3">
              <SubmitButton>Trocar senha</SubmitButton>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}
