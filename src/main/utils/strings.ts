/**
 * 范围匹配
 * @param ptt 范围查询关键词 e.g. 'hello [and] world'
 * @param msg 消息
 * @param fuzzy 是否模糊匹配
 * @param has_regular 是否使用正则表达式
 * @returns
 */
export function rangeMatch(
  ptt: string,
  msg: string,
  fuzzy: boolean,
  has_regular: boolean,
): boolean {
  if (ptt.includes('[and]')) {
    const keywords = ptt.split('[and]');
    return keywords.every((keyword, index) => {
      if (index === 0) {
        return matchKeyword(keyword.trim(), msg, fuzzy, has_regular);
      }
      const prevKeyword = keywords[index - 1].trim();
      const prevIndex = msg.indexOf(prevKeyword);
      if (prevIndex === -1) {
        return false;
      }
      return matchKeyword(
        keyword.trim(),
        msg.slice(prevIndex + prevKeyword.length),
        fuzzy,
        has_regular,
      );
    });
  }
  return matchKeyword(ptt, msg, fuzzy, has_regular);
}

/**
 * 匹配关键词
 * @param ptt 匹配模式
 * @param msg 消息
 * @param fuzzy 是否模糊匹配
 * @param has_regular 是否使用正则表达式
 * @returns
 */
export function matchKeyword(
  ptt: string,
  msg: string,
  fuzzy: boolean,
  has_regular: boolean,
): boolean {
  try {
    const pattern = ptt.trim();
    if (has_regular) {
      const regex = new RegExp(pattern);
      return regex.test(msg);
    }

    if (fuzzy) {
      return msg.includes(pattern);
    }

    return msg.trim() === pattern;
  } catch (e) {
    console.error(e);
    return false;
  }
}

/**
 * 范围匹配
 * @param ptt 范围查询关键词 e.g. 'hello [and] world'
 * @param msg 消息
 * @param fuzzy 是否模糊匹配
 * @param has_regular 是否使用正则表达式
 * @returns 匹配到的开始和结束位置数组
 */
export function rangeMatchPosition(
  ptt: string,
  msg: string,
  fuzzy: boolean,
  has_regular: boolean,
): Array<[number, number]> {
  const matchPositions: Array<[number, number]> = [];

  if (ptt.includes('[and]')) {
    const keywords = ptt.split('[and]');
    let searchStart = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const keyword of keywords) {
      const trimmedKeyword = keyword.trim();
      const matchPosition = matchKeywordPosition(
        trimmedKeyword,
        msg,
        fuzzy,
        has_regular,
        searchStart,
      );
      if (matchPosition) {
        matchPositions.push(matchPosition);
        // eslint-disable-next-line prefer-destructuring
        searchStart = matchPosition[1];
      } else {
        return [];
      }
    }
  } else {
    const matchPosition = matchKeywordPosition(ptt, msg, fuzzy, has_regular, 0);
    if (matchPosition) {
      matchPositions.push(matchPosition);
    }
  }

  return matchPositions;
}

/**
 * 匹配关键词并返回位置
 * @param ptt 匹配模式
 * @param msg 消息
 * @param fuzzy 是否模糊匹配
 * @param has_regular 是否使用正则表达式
 * @param searchStart 搜索的起始位置
 * @returns 匹配到的开始和结束位置
 */
function matchKeywordPosition(
  ptt: string,
  msg: string,
  fuzzy: boolean,
  has_regular: boolean,
  searchStart: number,
): [number, number] | null {
  const pattern = ptt.trim();

  if (has_regular) {
    const regex = new RegExp(pattern);
    const match = regex.exec(msg.slice(searchStart));
    if (match) {
      return [
        searchStart + match.index,
        searchStart + match.index + match[0].length,
      ];
    }
    return null;
  }

  if (fuzzy) {
    const index = msg.indexOf(pattern, searchStart);
    if (index !== -1) {
      return [index, index + pattern.length];
    }
    return null;
  }

  const index = msg.indexOf(pattern, searchStart);
  if (index !== -1 && index + pattern.length === msg.length) {
    return [index, index + pattern.length];
  }

  return null;
}

/**
 * 替换匹配的关键词
 * @param ptt 匹配模式
 * @param msg 消息
 * @param replace 替换字符串
 * @param fuzzy 是否模糊匹配
 * @param has_regular 是否使用正则表达式
 * @returns
 */
export function replaceKeyword(
  ptt: string,
  msg: string,
  replace: string,
  fuzzy: boolean,
  has_regular: boolean,
): string {
  const matchPositions = rangeMatchPosition(ptt, msg, fuzzy, has_regular);
  if (matchPositions.length === 0) {
    return msg;
  }

  let result = '';
  let lastIndex = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const [start, end] of matchPositions) {
    result += msg.slice(lastIndex, start) + replace;
    lastIndex = end;
  }

  result += msg.slice(lastIndex);
  return result;
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
