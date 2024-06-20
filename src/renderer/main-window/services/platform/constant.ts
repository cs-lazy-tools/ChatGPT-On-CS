export enum PlatformTypeEnum {
  HOT = 'HOT',
  E_COMMERCE = 'E_COMMERCE',
  ME_MEDIA = 'ME_MEDIA',
  RECRUIT = 'RECRUIT',
  OTHER = 'OTHER',
  LAW = 'LAW',
}

export const PlatformTypeMap = {
  [PlatformTypeEnum.HOT]: '热门',
  [PlatformTypeEnum.E_COMMERCE]: '电商',
  [PlatformTypeEnum.RECRUIT]: '招聘',
  [PlatformTypeEnum.LAW]: '法律咨询',
  [PlatformTypeEnum.ME_MEDIA]: '自媒体',
  [PlatformTypeEnum.OTHER]: '其他',
};
