import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, className, disabled, ...props }, ref) => {
    // Se disabled, evite a navegação e aplique estilos apropriados
    if (disabled) {
      return (
        <span
          className={cn(
            "cursor-not-allowed opacity-60",
            className
          )}
          {...props}
        >
          {children}
        </span>
      );
    }

    // Determina se é uma URL externa ou interna
    const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

    // Para links externos, use o elemento anchor padrão
    if (isExternal) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn(
            "inline-flex items-center text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    }

    // Para links internos, use o RouterLink do react-router-dom
    return (
      <RouterLink
        ref={ref}
        to={href}
        className={cn(
          "inline-flex items-center text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = "Link"; 