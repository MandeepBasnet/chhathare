// eslint-config-next 16 ships native flat config, so these are spread directly.
// Routing them through FlatCompat (the eslintrc bridge needed by v14/early-v15)
// hands a flat config to the legacy validator, which JSON.stringifies it and
// dies on the plugins' circular self-references — ESLint then failed to run at all.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  // public/ is static assets, including the vendored pdf.js worker build —
  // linting a minified third-party bundle produced ~1600 meaningless reports
  // that buried the handful of real ones.
  { ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"] },
];

export default eslintConfig;
