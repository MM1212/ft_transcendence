import React from "react";
import { Link as WouterLink, useRouter } from "wouter";
import { Path } from "wouter/use-location";

const externalLinkRegex = /http(s?):\/\/(.*)/;

export type LinkProps = { to: Path; href?: never } | { href: Path; to?: never };

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.PropsWithChildren<LinkProps>
>(
  (
    props: React.PropsWithChildren<LinkProps>,
    ref: React.Ref<HTMLAnchorElement>
  ) => {
    const { to, href = to } = props;
    const router = useRouter();
    const path = `${router.base}${href}`;
    const isExternal = externalLinkRegex.test(path as string);

    if (isExternal) {
      return <a ref={ref} {...props} />;
    }
    // @ts-expect-error pois pois
    return <WouterLink ref={ref} {...props} />;
  }
);

export default Link;
