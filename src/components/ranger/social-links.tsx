import type { ResolvedSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const PATHS: Record<string, string> = {
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 2.1c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.4-1.2.8-.4.4-.6.7-.8 1.2-.2.4-.3 1-.4 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1.1.2 1.7.4 2.1.2.5.4.9.8 1.2.4.4.7.6 1.2.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.2-.8.4-.4.6-.7.8-1.2.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.2-1-.3-2.1-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.4a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6zm0 7.1a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6zm5.5-7.3a1 1 0 1 1-2 0 1 1 0 0 1 2 0z",
  facebook:
    "M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z",
  youtube:
    "M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.8.3c-.5.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.6 1 1.8.2 7.5.2 7.5.2s4.6 0 7.8-.3c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.7 15V8.4l6.1 3.3L9.7 15z",
  tiktok:
    "M16.6 2h-3.3v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.2a6.3 6.3 0 1 0 5.3 6.2V8.6a7.9 7.9 0 0 0 4.6 1.5V6.8a4.6 4.6 0 0 1-4.6-4.8z",
  linkedin:
    "M20.5 2h-17C2.7 2 2 2.7 2 3.5v17c0 .8.7 1.5 1.5 1.5h17c.8 0 1.5-.7 1.5-1.5v-17c0-.8-.7-1.5-1.5-1.5zM8 19H5v-9h3v9zM6.5 8.7a1.7 1.7 0 1 1 0-3.5 1.7 1.7 0 0 1 0 3.5zM19 19h-3v-4.4c0-1 0-2.4-1.5-2.4s-1.7 1.1-1.7 2.3V19h-3v-9h2.9v1.2c.4-.8 1.4-1.5 2.8-1.5 3 0 3.5 2 3.5 4.5V19z",
  whatsapp:
    "M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.7a11.8 11.8 0 0 0 5.6 1.4c6.5 0 11.8-5.3 11.8-11.8 0-3.2-1.2-6.1-3.4-8.3z",
};

export const SOCIAL_LABELS = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok", linkedin: "LinkedIn", whatsapp: "WhatsApp" };

export function SocialIcon({ name, className }: { name: keyof typeof SOCIAL_LABELS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={cn("size-5", className)} aria-hidden>
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Ícones redondos das redes da loja (só as preenchidas no Torque). */
export function SocialLinks({ settings: st, whatsapp, className }: { settings: ResolvedSettings; whatsapp?: string | null; className?: string }) {
  const items = (
    [
      ["instagram", st.instagram],
      ["facebook", st.facebook],
      ["youtube", st.youtube],
      ["tiktok", st.tiktok],
      ["linkedin", st.linkedin],
      ["whatsapp", whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(st.whatsappMessage)}` : null],
    ] as [keyof typeof SOCIAL_LABELS, string | null | undefined][]
  ).filter(([, href]) => href);
  if (!items.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {items.map(([name, href]) => (
        <a
          key={name}
          href={href!}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={SOCIAL_LABELS[name]}
          className="grid size-10 place-items-center rounded-full bg-white text-[#2e2e38] shadow-[0_1px_3px_rgba(0,0,0,.08)] transition hover:bg-primary hover:text-white active:scale-95"
        >
          <SocialIcon name={name} />
        </a>
      ))}
    </div>
  );
}
