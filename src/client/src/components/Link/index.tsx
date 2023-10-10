import React from 'react';
import { LinkProps, Link as WouterLink } from 'wouter';

const externalLinkRegex = /http(s?)/;

const Link: React.FC<LinkProps> = React.forwardRef(
  (props: LinkProps, ref: React.Ref<HTMLAnchorElement>) => {
    const target = props.to || props.href || '';
    const isExternal = externalLinkRegex.test(target);
	console.log({target, isExternal});
	
    if (isExternal) {
      return <a {...props} ref={ref} />;
    }
    // @ts-expect-error WouterLink does not accept ref although it forwards it
    return <WouterLink {...props} ref={ref} />;
  }
);

export default Link;
