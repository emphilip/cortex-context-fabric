import type { AnchorHTMLAttributes, ReactNode } from "react";

// Storybook stub for next/link: render as a regular <a>. We don't exercise
// Next's prefetching behaviour in component stories.
interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export default function Link({ href, children, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
