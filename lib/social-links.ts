import { Mail, GraduationCap } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { LinkedinIcon } from "@/components/ui/LinkedinIcon";
import type { ComponentType } from "react";

export interface SocialLink {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub",   href: "https://github.com/EvelymVasconcelos",                       icon: GithubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/evelym-marinho-0741a6121/",      icon: LinkedinIcon },
  { label: "Lattes",   href: "https://lattes.cnpq.br/5534406024447727",                    icon: GraduationCap },
  { label: "Email",    href: "mailto:evelymmarinho.dev@gmail.com",                         icon: Mail },
];
