// Generates src/generated/props.json from the component source with the TypeScript compiler:
// every exported `<Name>Props` interface becomes a table of props (type, default, required, description).
// Defaults are read from each component's destructured parameters, so the docs can't drift from the code.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(here, '../../../packages/react/src');
const entry = join(srcDir, 'index.ts');
const out = resolve(here, '../src/generated/props.json');

const program = ts.createProgram([entry], {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  skipLibCheck: true
});
const checker = program.getTypeChecker();
const ownFile = (f) => resolve(f).startsWith(srcDir);

const NATIVE = {
  ButtonHTMLAttributes: '<button>',
  InputHTMLAttributes: '<input>',
  TextareaHTMLAttributes: '<textarea>',
  SelectHTMLAttributes: '<select>',
  HTMLAttributes: 'HTML element',
  SVGProps: '<svg>'
};

/** Default values from `function X({ a = 1, b = 'x' })` or `forwardRef(function X({ ... }, ref))`. */
function defaultsFor(decl) {
  let fn = null;
  if (ts.isFunctionDeclaration(decl)) fn = decl;
  else if (ts.isVariableDeclaration(decl) && decl.initializer) {
    const visit = (n) => {
      if (fn) return;
      if (ts.isFunctionExpression(n) || ts.isArrowFunction(n)) fn = n;
      else ts.forEachChild(n, visit);
    };
    visit(decl.initializer);
  }
  const param = fn?.parameters[0];
  const result = {};
  if (param && ts.isObjectBindingPattern(param.name)) {
    for (const el of param.name.elements) {
      if (!el.initializer) continue;
      const key = (el.propertyName ?? el.name).getText();
      result[key] = el.initializer.getText();
    }
  }
  return result;
}

const typeText = (sym, prop) => {
  const decl = prop.valueDeclaration ?? prop.declarations?.[0];
  if (decl && (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type) {
    return decl.type.getText().replace(/\s+/g, ' ');
  }
  return checker.typeToString(checker.getTypeOfSymbolAtLocation(prop, sym.valueDeclaration ?? decl));
};

const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry));
const exports = checker.getExportsOfModule(moduleSymbol);
const byName = new Map(exports.map((s) => [s.getName(), s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s]));

const result = {};
for (const [name, sym] of byName) {
  if (!name.endsWith('Props')) continue;
  const component = name.slice(0, -'Props'.length);
  const decl = sym.declarations?.find((d) => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
  if (!decl) continue;

  const type = checker.getDeclaredTypeOfSymbol(sym);
  const props = checker
    .getPropertiesOfType(type)
    .filter((p) => (p.declarations ?? []).some((d) => ownFile(d.getSourceFile().fileName)))
    .map((p) => ({
      name: p.getName(),
      type: typeText(sym, p),
      required: !(p.flags & ts.SymbolFlags.Optional),
      description: ts.displayPartsToString(p.getDocumentationComment(checker)).replace(/\s+/g, ' ').trim()
    }));

  const compSym = byName.get(component);
  const compDecl = compSym?.valueDeclaration ?? compSym?.declarations?.[0];
  const defaults = compDecl ? defaultsFor(compDecl) : {};
  for (const p of props) if (defaults[p.name] !== undefined) p.default = defaults[p.name];

  const inherits = ts.isInterfaceDeclaration(decl)
    ? (decl.heritageClauses ?? [])
        .flatMap((h) => h.types.map((t) => t.expression.getText()))
        .map((n) => NATIVE[n.replace(/^(Omit<)?(React\.)?/, '')] ?? null)
        .filter(Boolean)
    : [];
  // `extends Omit<InputHTMLAttributes<...>, ...>` hides the base name inside type arguments
  if (ts.isInterfaceDeclaration(decl)) {
    for (const h of decl.heritageClauses ?? []) {
      for (const t of h.types) {
        const text = t.getText();
        for (const [k, v] of Object.entries(NATIVE)) if (text.includes(k) && !inherits.includes(v)) inherits.push(v);
      }
    }
  }

  // "HTML element" is the generic fallback; drop it when a specific element matched,
  // and add it when native props arrive through a local base interface (e.g. StackProps → BoxProps).
  let inherited = [...new Set(inherits)];
  if (inherited.length > 1) inherited = inherited.filter((x) => x !== 'HTML element');
  const hasNative = checker.getPropertiesOfType(type).some((p) => (p.declarations ?? []).some((d) => !ownFile(d.getSourceFile().fileName)));
  if (!inherited.length && hasNative) inherited = ['HTML element'];

  // Required first, then in declaration order.
  props.sort((a, b) => Number(b.required) - Number(a.required));
  result[component] = { props, inherits: inherited };
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(`props: ${Object.keys(result).length} components → ${out.replace(resolve(here, '..') + '/', '')}`);
