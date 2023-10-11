import React from 'react';
import { Link as WouterLink } from 'wouter';
import { Path } from 'wouter/use-location';

const externalLinkRegex = /http(s?):\/\/(.*)/;

export type LinkProps = { to: Path; href?: never } | { href: Path; to?: never };

const Link = React.forwardRef<HTMLAnchorElement, React.PropsWithChildren<LinkProps>>(
  (props: React.PropsWithChildren<LinkProps>, ref: React.Ref<HTMLAnchorElement>) => {
    const { to, href = to } = props;

    const isExternal = externalLinkRegex.test(href as string);
    if (isExternal) {
      return <a ref={ref} {...props} />;
    }
    return <WouterLink ref={ref} {...props} />;
  }
);

export default Link;
