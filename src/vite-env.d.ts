/// <reference types="vite/client" />

// Allow importing from paths starting with @/
declare module '@/*' {
  const value: any;
  export default value;
}