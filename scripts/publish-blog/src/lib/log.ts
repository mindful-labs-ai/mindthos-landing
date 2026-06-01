const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function ts() {
  return new Date().toISOString().slice(11, 19);
}

export const log = {
  info: (msg: string) =>
    console.log(`${C.dim}[${ts()}]${C.reset} ${C.blue}info${C.reset}  ${msg}`),
  ok: (msg: string) =>
    console.log(`${C.dim}[${ts()}]${C.reset} ${C.green}ok${C.reset}    ${msg}`),
  warn: (msg: string) =>
    console.warn(`${C.dim}[${ts()}]${C.reset} ${C.yellow}warn${C.reset}  ${msg}`),
  error: (msg: string) =>
    console.error(`${C.dim}[${ts()}]${C.reset} ${C.red}err${C.reset}   ${msg}`),
  step: (msg: string) => console.log(`\n${C.cyan}━ ${msg}${C.reset}`),
};
