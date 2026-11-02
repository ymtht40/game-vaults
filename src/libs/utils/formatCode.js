// NOTE: module id: 737322
export function formatCode(code, lang = 'js') {
  if (!code || typeof code !== 'string') return code;
  const lowerLang = String(lang).toLowerCase();
  
  let result;
  if (lowerLang === 'html') {
    result = code.replace(/<!--[\s\S]*?-->/g, '');
  } else if (lowerLang === 'css' || lowerLang === 'scss') {
    result = stripComments(code, false);
  } else if (lowerLang === 'vue' || lowerLang === 'svelte') {
    result = stripComments(code.replace(/<!--[\s\S]*?-->/g, ''), true);
  } else {
    result = stripComments(code, true);
  }
  
  return result
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s*\n+/, '');
}

function stripComments(code, stripDoubleSlash) {
  let result = '';
  let i = 0;
  const len = code.length;
  let inString = null;
  
  while (i < len) {
    const char = code[i];
    const nextChar = code[i + 1];
    
    if (inString) {
      result += char;
      if (char === '\\') {
        result += nextChar ?? '';
        i += 2;
        continue;
      }
      if (char === inString) {
        inString = null;
      }
      i++;
      continue;
    }
    
    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      result += char;
      i++;
      continue;
    }
    
    if (char === '/' && nextChar === '*') {
      i += 2;
      while (i < len && (code[i] !== '*' || code[i + 1] !== '/')) {
        i++;
      }
      i += 2;
      continue;
    }
    
    if (stripDoubleSlash && char === '/' && nextChar === '/') {
      let backIndex = result.length - 1;
      while (backIndex >= 0 && (result[backIndex] === ' ' || result[backIndex] === '\t')) {
        backIndex--;
      }
      if (backIndex >= 0 && result[backIndex] === ':') {
        result += char;
        i++;
        continue;
      }
      while (i < len && code[i] !== '\n') {
        i++;
      }
      continue;
    }
    
    result += char;
    i++;
  }
  return result;
}

export function getLanguage(platform, mode) {
  const lowerMode = String(mode || '').toLowerCase();
  if (lowerMode === 'css') return 'css';
  if (lowerMode === 'html') return 'html';
  if (platform === 'vue') return 'vue';
  return 'js';
}

