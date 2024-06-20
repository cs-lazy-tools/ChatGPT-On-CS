import axios from 'axios';

export const isVersionGreater = (
  onlineVersion: string,
  currentVersion: string,
) => {
  // 更新正则表达式，更好地分离数字和后缀部分
  const versionRegex = /(\d+\.\d+\.\d+)(-?[^.]*)(\.\d+)?/;
  const [, onlineMain, onlinePre, onlinePreNum] =
    onlineVersion.match(versionRegex) || [];
  const [, currentMain, currentPre, currentPreNum] =
    currentVersion.match(versionRegex) || [];

  // 比较主版本号
  const onlineParts = onlineMain.split('.').map(Number);
  const currentParts = currentMain.split('.').map(Number);

  for (let i = 0; i < Math.max(onlineParts.length, currentParts.length); i++) {
    const onlinePart = onlineParts[i] || 0;
    const currentPart = currentParts[i] || 0;
    if (onlinePart > currentPart) {
      return true;
    }
    if (onlinePart < currentPart) {
      return false;
    }
  }

  // 如果主版本号相同，先比较后缀是否存在（如果存在数字后缀的话）
  if (onlinePre || currentPre) {
    if (!onlinePre && currentPre) return true; // online 没有后缀，current 有后缀，online 更大
    if (onlinePre && !currentPre) return false; // online 有后缀，current 没有后缀，online 更小
    if (onlinePre !== currentPre) {
      return onlinePre > currentPre; // 直接字符串比较后缀
    }
    // 如果后缀相同，比较数字后缀
    const onlinePreNumValue = onlinePreNum
      ? parseInt(onlinePreNum.substring(1), 10)
      : 0;
    const currentPreNumValue = currentPreNum
      ? parseInt(currentPreNum.substring(1), 10)
      : 0;
    return onlinePreNumValue > currentPreNumValue;
  }

  return false; // 如果主版本号和后缀完全相同，返回 false
};

export const getVersionInfo = async (currentVersion: string) => {
  let updates: { version: string; url: string; description: string }[] = [];
  try {
    const response = await axios.get<
      Array<{ version: string; url: string; description: string }>
    >('https://update.wizgadg.top/check-update/chatgpt-on-cs');

    const { data } = response;
    // 过滤出所有比当前版本新的版本
    updates = data.filter((versionInfo) =>
      isVersionGreater(versionInfo.version, currentVersion),
    );
  } catch (error) {
    console.error(error);
  }

  return updates;
};
