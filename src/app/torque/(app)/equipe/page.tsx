import { KeyRound } from "lucide-react";

import { saveMember, toggleMember } from "@/app/torque/actions/team";
import { Field, PageHeader, Panel, Saved, SubmitButton, field } from "@/components/torque/ui";
import { listStores } from "@/db/queries";
import type { Store, User } from "@/db/schema";
import { listTeam } from "@/db/torque-queries";
import { requireSession } from "@/lib/auth";
import { publishedAt } from "@/lib/format";
import { getTenant } from "@/lib/tenant";
import { cn } from "@/lib/utils";

export const metadata = { title: "Equipe" };

const ROLE = { master: "Master", manager: "Gestor", seller: "Vendedor" } as const;

function MemberForm({ user, stores }: { user?: User; stores: Store[] }) {
  return (
    <form action={saveMember} className="grid gap-3 md:grid-cols-3 xl:grid-cols-[1.2fr_1.3fr_1fr_0.9fr_1fr_1.1fr_auto] xl:items-end">
      {user && <input type="hidden" name="id" value={user.id} />}
      <Field label="Nome *">
        <input name="name" required defaultValue={user?.name} className={field} />
      </Field>
      <Field label="E-mail (login)">
        <input name="email" type="email" defaultValue={user?.email ?? ""} className={field} />
      </Field>
      <Field label="WhatsApp">
        <input name="phone" defaultValue={user?.phone ?? ""} className={field} />
      </Field>
      <Field label="Papel">
        <select name="role" defaultValue={user?.role ?? "seller"} className={field}>
          <option value="seller">Vendedor</option>
          <option value="manager">Gestor</option>
        </select>
      </Field>
      <Field label="Loja">
        <select name="storeId" defaultValue={user?.storeId ?? ""} className={field}>
          <option value="">Todas</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label={user?.passwordHash ? "Nova senha" : "Senha de acesso"}>
        <input name="password" type="password" autoComplete="new-password" placeholder={user?.passwordHash ? "Manter atual" : "Opcional"} className={field} />
      </Field>
      <SubmitButton>{user ? "Salvar" : "Adicionar"}</SubmitButton>
    </form>
  );
}

export default async function Equipe({ searchParams }: { searchParams: Promise<{ salvo?: string; erro?: string; editar?: string }> }) {
  const s = await requireSession(["master", "manager"]);
  const tenant = await getTenant();
  const [team, stores] = await Promise.all([listTeam(tenant.id), listStores(tenant.id)]);
  const { salvo, erro, editar } = await searchParams;

  return (
    <div>
      <PageHeader title="Equipe" kicker="Vendedores e gestores da loja" />
      <Saved show={!!salvo}>Equipe atualizada.</Saved>
      {erro && <p className="mb-4 rounded-lg bg-[#fde8e8] px-4 py-3 text-sm font-medium text-[#a3242f]">{erro}</p>}

      <Panel className="mb-5 p-0" data-tour="equipe-lista">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wide text-[#6b6b76]">
              <tr>
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Papel</th>
                <th className="px-5 py-3 font-medium">Loja</th>
                <th className="px-5 py-3 font-medium">Acesso ao Torque</th>
                <th className="px-5 py-3 font-medium">Rodízio</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {team.map(({ user: u, store }) => (
                <tr key={u.id} className={cn("border-b last:border-0", !u.active && "opacity-50")}>
                  <td className="px-5 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-[#6b6b76]">{u.email ?? u.phone ?? "—"}</p>
                  </td>
                  <td className="px-5 py-3">{ROLE[u.role]}</td>
                  <td className="px-5 py-3">{store?.name ?? "Todas"}</td>
                  <td className="px-5 py-3">
                    {u.passwordHash ? (
                      <span className="flex items-center gap-1.5 text-[#1d6b3d]">
                        <KeyRound className="size-3.5" /> Sim{u.lastLoginAt && <span className="text-xs text-[#6b6b76]">· {publishedAt(u.lastLoginAt)}</span>}
                      </span>
                    ) : (
                      <span className="text-[#6b6b76]">Não</span>
                    )}
                  </td>
                  <td className="px-5 py-3">{u.role === "seller" ? (u.active ? "Recebendo leads" : "Pausado") : "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <a href={`?editar=${u.id}#editar`} className="h-9 rounded-lg border border-[#d6d6dc] px-3 text-sm font-medium leading-9 hover:bg-[#f5f5f7]">
                        Editar
                      </a>
                      {u.id !== s.user.id && (
                        <form action={toggleMember}>
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="active" value={u.active ? "0" : "1"} />
                          <button className="h-9 rounded-lg px-3 text-sm font-medium text-primary hover:bg-[#eef1fd]">{u.active ? "Desativar" : "Reativar"}</button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {editar && team.find((t) => t.user.id === Number(editar)) && (
        <Panel id="editar" className="mb-5">
          <h2 className="mb-3 text-base font-semibold">Editar {team.find((t) => t.user.id === Number(editar))!.user.name}</h2>
          <MemberForm user={team.find((t) => t.user.id === Number(editar))!.user} stores={stores} />
        </Panel>
      )}

      <Panel>
        <h2 className="text-base font-semibold">Adicionar à equipe</h2>
        <p className="mb-4 text-sm text-[#6b6b76]">
          Vendedor entra no rodízio de leads da loja dele. Com e-mail e senha, também acessa o Torque e vê só os próprios leads.
        </p>
        <MemberForm stores={stores} />
      </Panel>
    </div>
  );
}
