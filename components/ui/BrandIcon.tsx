import type { ReactNode, SVGProps } from "react";

/**
 * Base dos logos de marca. O lucide-react 1.x tirou os ícones de marca, então GitHub e LinkedIn são desenhados aqui,
 * com o mesmo traço do lucide (24×24, traço 2, pontas arredondadas) para combinar com os outros ícones.
 */
export type BrandIconProps = Omit<SVGProps<SVGSVGElement>, "children">;

export function BrandIcon({ children, ...props }: BrandIconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}
