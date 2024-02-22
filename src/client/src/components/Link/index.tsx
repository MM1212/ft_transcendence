import React from "react";
import { Link as WouterLink, useRouter } from "wouter";
import { Path } from "wouter/use-location";

const externalLinkRegex = /http(s?):\/\/(.*)/;

export type LinkProps = React.ComponentProps<'a'> & ({ to: Path; href?: never } | { href: Path; to?: never }) & { external?: boolean };

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<LinkProps>
>(
  (
    {external, ...props}: React.PropsWithChildren<LinkProps>,
    ref: React.Ref<HTMLAnchorElement>
  ) => {
    const { to, href = to } = props;
    const router = useRouter();
    const path = `${router.base}${href}`;
    const isExternal = external || externalLinkRegex.test(path as string);

    if (isExternal) {
      return <a ref={ref} {...props} />;
    }
    return <WouterLink ref={ref} {...props} />;
  }
);

export default Link;
