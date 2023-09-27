import React from 'react';
import { LinkProps, Link as WouterLink } from 'wouter';

const externalLinkRegex = /|^https?:\/\/|:\/\/|mailto:|tel:|skype:|tg:|t.me/;

const Link: React.FC<LinkProps> = React.forwardRef(
  (props: LinkProps, ref: React.Ref<HTMLAnchorElement>) => {
    const target = props.to || props.href || '';
    const isExternal = externalLinkRegex.test(target);
    if (isExternal) {
      return <a {...props} ref={ref} />;
    }
    // @ts-expect-error WouterLink does not accept ref although it forwards it
    return <WouterLink {...props} ref={ref} />;
  }
);

export default Link;
