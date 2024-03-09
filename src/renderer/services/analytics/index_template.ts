import agconnect from '@agconnect/api';
import '@agconnect/instance';
import '@hw-hmscore/analytics-web';

const agConnectConfig = {
  // TODO: 请替换为您的应用 ID
  // 这里使用的是华为的服务用于打点
};

// 初始化分析实例
agconnect.instance().configInstance(agConnectConfig);
const analytics = agconnect.analytics();

export default analytics;
