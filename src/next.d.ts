declare module 'next/link' {
  import React from 'react';
  
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    prefetch?: boolean;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
  }

  const Link: React.ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/image' {
  import React from 'react';

  export interface ImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string;
    alt: string;
    width?: number | string;
    height?: number | string;
    fill?: boolean;
    quality?: number | string;
    priority?: boolean;
    loading?: 'eager' | 'lazy';
    unoptimized?: boolean;
  }

  const Image: React.ComponentType<ImageProps>;
  export default Image;
}
