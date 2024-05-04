import { PlatformConfig } from '../entities/platformConfig';

export class PlatformConfigController {
  async updateByPlatformId(
    platformId: string,
    settings: any,
  ): Promise<PlatformConfig> {
    const platformConfig = await PlatformConfig.findOne({
      where: { platform_id: platformId },
    });

    const active = settings && settings.active ? settings.active : false;

    if (platformConfig) {
      // @ts-ignore
      return this.update(platformConfig.id, { settings, active });
    }

    return this.create({
      platform_id: platformId,
      settings,
      active,
    });
  }

  async getByPlatformId(platformId: string) {
    let data = await PlatformConfig.findOne({
      where: { platform_id: platformId },
    });

    if (!data) {
      // 创建一个对象
      data = await PlatformConfig.create({
        platform_id: platformId,
        active: false,
        settings: {},
      });
    }

    return data;
  }

  async create(platformConfigData: any): Promise<PlatformConfig> {
    const platformConfig = await PlatformConfig.create(platformConfigData);
    return platformConfig;
  }

  async update(id: number, platformConfigData: Partial<PlatformConfig>) {
    const platformConfig = await PlatformConfig.findOne({
      where: { id },
    });
    if (!platformConfig) {
      return;
    }

    await platformConfig.update(platformConfigData);
  }

  async delete(id: number): Promise<void> {
    const platformConfig = await PlatformConfig.findOne({
      where: { id },
    });
    if (!platformConfig) {
      return;
    }
    await platformConfig.destroy();
  }
}
