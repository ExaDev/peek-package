/// <reference types="vite/client" />

// Build-time constants injected by Vite
declare const __APP_VERSION__: string;

// CSS Modules type declarations
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
