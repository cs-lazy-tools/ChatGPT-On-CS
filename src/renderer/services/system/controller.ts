import axios from 'axios';

export const getVersionInfo = async (currentVersion: string) => {
  let result = null;
  try {
    const data = await axios.get<{
      version: string;
      url: string;
      description: string;
    }>('https://update.wizgadg.top/check-update/chatgpt-on-cs');

    result = data.data;
    // 检查版本是否需要更新
    if (result.version === currentVersion) {
      result = null;
    }
  } catch (error) {
    console.error(error);
  }

  return result;
};
