import axios from 'axios';

// 一个辅助函数，用于比较两个版本号，考虑非数字部分
function isVersionGreater(onlineVersion: string, currentVersion: string) {
  // 正则表达式用于分离数字部分和后缀
  const versionRegex = /(\d+\.\d+\.\d+)(.*)/;
  const [, onlineMain, onlineSuffix] = onlineVersion.match(versionRegex) || [];
  const [, currentMain, currentSuffix] =
    currentVersion.match(versionRegex) || [];

  // 先比较主版本号
  const onlineParts = onlineMain.split('.').map(Number);
  const currentParts = currentMain.split('.').map(Number);

  // eslint-disable-next-line no-plusplus
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

  // 如果主版本号相同，比较后缀，视 "beta" 等作为较小
  if (onlineSuffix && currentSuffix) {
    return onlineSuffix > currentSuffix;
  }
  if (onlineSuffix) {
    return false; // online 有后缀但 current 无后缀，online 为较小版本
  }
  if (currentSuffix) {
    return true; // current 有后缀但 online 无后缀，online 为较大版本
  }

  return false;
}

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
