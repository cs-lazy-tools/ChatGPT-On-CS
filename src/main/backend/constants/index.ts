export const ALL_PLATFORMS = [
  {
    id: 'bilibili',
    name: 'bilibili',
  },
  {
    id: 'douyin',
    name: '抖音',
  },
  {
    id: 'douyin_mp',
    name: '抖音企业号',
  },
  {
    id: 'win_jinmai',
    name: '京卖',
  },
  {
    id: 'jinritemai',
    name: '抖店',
  },
  {
    id: 'win_qianniu',
    name: '千牛',
  },
  {
    id: 'win_wechat',
    name: '微信',
  },
  {
    id: 'win_wecom',
    name: '企微(Bate版)',
  },
  {
    id: 'weibo',
    name: '微博私信',
  },
  {
    id: 'xiaohongshu',
    name: '小红书评论',
  },
  {
    id: 'xiaohongshu_pro',
    name: '小红书私信',
  },
  {
    id: 'zhihu',
    name: '知乎',
  },
];

// 固定会传递的上下文参数
export const CTX_APP_NAME = 'app_name';
export const CTX_APP_ID = 'app_id';
export const CTX_INSTANCE_ID = 'instance_id';

export const CTX_USERNAME = 'username'; // 当前操作的用户名
export const CTX_PLATFORM = 'platform'; // 当前所在平台
export const CTX_HAS_NEW_MESSAGE = 'has_new_message'; // 是否有新消息
export const CTX_HAS_GROUP_MESSAGE = 'has_group_message'; // 是否有群消息

// 电商平台
export const CTX_CURRENT_GOODS = 'CTX_CURRENT_GOODS'; // 当前商品
export const CTX_CURRENT_GOODS_ID = 'CTX_CURRENT_GOODS_ID'; // 当前商品 ID
export const CTX_MEMBER_TAG = 'CTX_MEMBER_TAG'; // 会员标签
export const CTX_FAN_TAG = 'CTX_FAN_TAG'; // 粉丝标签
export const CTX_NEW_CUSTOMER_TAG = 'CTX_NEW_CUSTOMER_TAG'; // 新客标签
