class WildcardEngine {
  static match(pattern: string, value: string): boolean {
    const patternParts = pattern.split('*');
    if (patternParts.length === 0) return true;
    if (patternParts.length === 1) return pattern === value;
    let lastIndex = 0;
    for (const part of patternParts) {
      if (part === '') continue;
      const index = value.indexOf(part, lastIndex);
      if (index === -1) return false;
      lastIndex = index + part.length;
    }
    return true;
  }
}

export default WildcardEngine;