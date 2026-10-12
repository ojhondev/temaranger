import { Tabs } from "./ui";

const ITEMS = [
  { href: "/torque/site", label: "Identidade" },
  { href: "/torque/site/banners", label: "Banners" },
  { href: "/torque/site/aparencia", label: "Aparência" },
  { href: "/torque/site/inicio", label: "Página inicial" },
  { href: "/torque/site/veiculo", label: "Página do veículo" },
  { href: "/torque/site/contato", label: "Contato e WhatsApp" },
  { href: "/torque/site/lojas", label: "Lojas" },
  { href: "/torque/site/dominio", label: "Domínio" },
];

export function SiteTabs({ active }: { active: string }) {
  return (
    <div data-tour="site-abas">
      <Tabs items={ITEMS} active={active} />
    </div>
  );
}
