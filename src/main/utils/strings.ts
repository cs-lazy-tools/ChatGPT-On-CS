/**
 * 范围匹配
 * @param ptt 范围查询关键词 e.g. 'hello [and] world'
 * @param msg 消息
 * @returns
 */
export function rangeMatch(ptt: string, msg: string): boolean {
  if (ptt.includes('[and]')) {
    const keywords = ptt.split('[and]');
    return keywords.every((keyword) => matchKeyword(keyword.trim(), msg));
  }
  return matchKeyword(ptt, msg);
}

/**
 * 匹配关键词
 * @param ptt 匹配模式
 * @param msg 消息
 * @returns
 */
export function matchKeyword(ptt: string, msg: string): boolean {
  let pattern = ptt.trim();

  // 如果模式只是一个星号，它应该匹配任何消息。
  if (pattern === '*') {
    return true;
  }

  // 合并连续的 '*' 字符为一个 '*'
  pattern = pattern.replace(/\*+/g, '*');

  // 如果模式不包含 '*'，则直接比较是否相等
  if (!pattern.includes('*')) {
    return pattern === msg;
  }

  const parts = pattern.split('*');
  let lastIndex = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const part of parts) {
    // 跳过空字符串（它们来自模式开始、结束或连续 '*'）
    if (part === '') continue;

    const index = msg.indexOf(part, lastIndex);
    // 如果找不到部分或部分不是按顺序出现，则匹配失败
    if (index === -1 || index < lastIndex) {
      return false;
    }
    lastIndex = index + part.length;
  }

  // 确保消息的剩余部分可以被模式尾部的 '*' 匹配
  return parts[parts.length - 1] === '' || lastIndex <= msg.length;
}

/**
 * 替换文本中的 token
 * @param text 原始文本
 * @param replacements 替换文本
 * @returns
 */
export function tokenReplace(
  text: string,
  replacements: Record<string, string>,
): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return replacements[key] || match;
  });
}

/**
 * 替换特殊 token
 * @param text 原始文本
 * @returns
 */
export function specialTokenReplace(text: string): string {
  // eslint-disable-next-line no-useless-escape
  return text.replace(/\[\~\]/g, () => {
    const randomChoices = [
      ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      '🌸',
      '😊',
      '🌷',
      '🌹',
      '💖',
      '🪷',
      '💐',
      '🌺',
      '🌼',
      '🌻',
    ];
    return randomChoices[Math.floor(Math.random() * randomChoices.length)];
  });
}
