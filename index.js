'use strict';

const { join } = require('path');
const fs = require('fs');
const dedent = require('dedent');

const entries = require('object.entries');
const requireAll = require('require-all');

// <3 for Object.entries
if (!Object.entries) {
  entries.shim();
}

// Key used to determine if a module should be indexed or not
const INDEX_KEY = '__index';
const AUTOMATIC_INDEX_FILE = 'automatic.index';

module.exports = { create };

function create(directory) {

  const modules = requireAll(directory);

  // Delete private modules from the object
  for (const moduleName in modules) {
    if (moduleName[0] === '_') {
      delete modules[moduleName];
    }
  }

  if (!modules[AUTOMATIC_INDEX_FILE]) {
    return;
  }

  const modulesDescriptor = modules[AUTOMATIC_INDEX_FILE];
  
  if (!modulesDescriptor[INDEX_KEY]) {
    return;
  }

  const automaticIndexFile = generateModules(modules);
  const automaticIndexFilepath = join(directory, 'automatic.index.js');

  // Writes the generated file to the directory
  fs.writeFileSync(automaticIndexFilepath, automaticIndexFile);

  for (const moduleName in modules) {

    if (isPrivate(moduleName)) {
      continue;
    }

    if (moduleName === 'index' || moduleName === 'automatic.index') {
      continue;
    }

    const subModule = modules[moduleName];

    if (typeof subModule['automatic.index'] !== 'undefined') {

      create(join(directory, moduleName));

    }

  }

}

function generateModules(modules) {

  const moduleNameMap = Object.entries(modules)
    .filter(([key, value]) => !isPrivate(key))
    .map(([key, value]) => {
      return [snakeToCamelCase(key), key];
    })
    .reduce(toObject, {});

  // Add the __index back in
  moduleNameMap[INDEX_KEY] = true;

  const now = new Date().toISOString();
  const indent = '    ';
  const automaticIndexFile = dedent`
    'use strict';

    // Generated @ ${now}

    module.exports = {
      ${Object.entries(moduleNameMap)
        .filter(([exportName, importName]) => {
          return (importName !== 'index') && (importName !== 'automatic.index');
        })
        .map(([exportName, importName]) => {

          if (exportName === INDEX_KEY) {
            return `__index: true`
          }

          return `${exportName}: require('./${importName}')`;
        })
        .join(`,\n${indent}  `)
      }
    };

  `;

  return automaticIndexFile;

}

function isPrivate(moduleName) {
  if (moduleName && moduleName.length > 0) {
    return moduleName[0] === '_';
  }
}

function snakeToCamelCase(input) {
  return input.replace(/(\-\w)/g, function (m) {
    return m[1].toUpperCase();
  });
}

function toObject(object, [key, value]) {
  object[key] = value;
  return object
}
