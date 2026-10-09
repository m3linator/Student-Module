/**
 * @file doxygen-ts-filter.mjs
 * @brief Doxygen INPUT_FILTER that turns a TypeScript/TSX file into C++-like declarations.
 *
 * Doxygen cannot parse TypeScript. This filter uses the TypeScript compiler API to find the
 * top-level declarations (functions, components, constants, interfaces, type aliases) and prints
 * each one with its original Doxygen comment as a simplified C++ declaration. Doxygen then
 * documents those declarations as if the file were C++.
 *
 * Usage (called by Doxygen): `node scripts/doxygen-ts-filter.mjs <file>`
 */
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const file = process.argv[2];
const source = readFileSync(file, 'utf8');
const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const isTsx = file.endsWith('.tsx');
const out = [];

/**
 * @brief Returns the last `/** … *\/` comment directly before a node.
 * @param node Declaration node.
 * @returns Comment text or an empty string.
 */
function docComment(node) {
  const ranges = ts.getLeadingCommentRanges(source, node.getFullStart()) ?? [];
  const docs = ranges
    .map((range) => source.slice(range.pos, range.end))
    .filter((text) => text.startsWith('/**') && !text.includes('@file'));
  return docs.at(-1) ?? '';
}

/**
 * @brief Simplifies a TypeScript type to a single C++-friendly identifier.
 * @param typeNode Type node (may be undefined).
 * @param fallback Identifier used for complex or missing types.
 * @returns Identifier such as `string`, `TaskRow`, `Promise` or `auto`.
 */
function simpleType(typeNode, fallback = 'auto') {
  if (!typeNode) return fallback;
  if (ts.isTypeReferenceNode(typeNode)) return typeNode.typeName.getText(sf).replaceAll('.', '::');
  if (ts.isUnionTypeNode(typeNode)) {
    // `T | null | undefined` → T
    const rest = typeNode.types.filter(
      (t) =>
        t.kind !== ts.SyntaxKind.UndefinedKeyword &&
        !(ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword),
    );
    if (rest.length === 1) return simpleType(rest[0], fallback);
  }
  if (ts.isArrayTypeNode(typeNode)) return `std::vector<${simpleType(typeNode.elementType)}>`;
  const text = typeNode.getText(sf);
  return /^[A-Za-z_]\w*$/.test(text) ? text : fallback;
}

/**
 * @brief Converts a parameter list to C++ syntax.
 * @details Destructured parameters get the name used in the matching `@param` tag of the comment
 * (e.g. `props` for `@param props.children`), so Doxygen can link the documentation.
 * @param params TypeScript parameters.
 * @param doc Comment of the function (used to name destructured parameters).
 * @returns Comma-separated `Type name` pairs.
 */
function paramList(params, doc = '') {
  const docNames = [...new Set([...doc.matchAll(/@param\s+([\w$]+)/g)].map((match) => match[1]))];
  return params
    .map((param, index) => {
      const name = ts.isIdentifier(param.name) ? param.name.text : (docNames[index] ?? 'props');
      return `${simpleType(param.type)} ${name}`;
    })
    .join(', ');
}

/**
 * @brief Picks a return type: explicit annotation, JSX element for components, or `auto`.
 * @param name Function name.
 * @param typeNode Declared return type.
 * @returns Return type identifier.
 */
function returnType(name, typeNode) {
  if (typeNode) return simpleType(typeNode);
  return isTsx && /^[A-Z]/.test(name) ? 'JSX::Element' : 'auto';
}

/**
 * @brief Emits a struct for an interface or object type literal, keeping member comments.
 * @param name Struct name.
 * @param members Property signatures.
 * @param doc Leading comment of the type.
 */
function emitStruct(name, members, doc) {
  out.push(doc, `struct ${name} {`);
  for (const member of members) {
    if (!member.name) continue;
    const memberDoc = docComment(member);
    const type = ts.isMethodSignature(member)
      ? `auto ${member.name.getText(sf)}(${paramList(member.parameters)})`
      : `${simpleType(member.type)} ${member.name.getText(sf).replace(/\W/g, '_')}`;
    if (memberDoc) out.push(`  ${memberDoc}`);
    out.push(`  ${type};`);
  }
  out.push('};', '');
}

// File comment first (Doxygen only documents globals of documented files).
const fileDoc = (ts.getLeadingCommentRanges(source, 0) ?? [])
  .map((range) => source.slice(range.pos, range.end))
  .find((text) => text.includes('@file'));
out.push(fileDoc ?? `/** @file */`, '');

for (const statement of sf.statements) {
  const doc = docComment(statement);

  if (ts.isFunctionDeclaration(statement) && statement.name) {
    const name = statement.name.text;
    out.push(
      doc,
      `${returnType(name, statement.type)} ${name}(${paramList(statement.parameters, doc)});`,
      '',
    );
  } else if (ts.isVariableStatement(statement)) {
    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name)) continue;
      const name = decl.name.text;
      const init = decl.initializer;
      if (init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
        out.push(
          doc,
          `${returnType(name, init.type)} ${name}(${paramList(init.parameters, doc)});`,
          '',
        );
      } else if (doc) {
        out.push(doc, `const ${simpleType(decl.type)} ${name};`, '');
      }
    }
  } else if (ts.isInterfaceDeclaration(statement)) {
    emitStruct(statement.name.text, statement.members, doc);
  } else if (ts.isTypeAliasDeclaration(statement)) {
    if (ts.isTypeLiteralNode(statement.type))
      emitStruct(statement.name.text, statement.type.members, doc);
    else out.push(doc, `using ${statement.name.text} = ${simpleType(statement.type)};`, '');
  }
}

process.stdout.write(out.filter((line, i, all) => line !== '' || all[i - 1] !== '').join('\n'));
