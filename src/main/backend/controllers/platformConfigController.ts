import { PlatformConfig } from '../entities/platformConfig';

export class PlatformConfigController {
  async updateByPlatformId(
    platformId: string,
    platformConfigData: Partial<PlatformConfig>,
  ): Promise<PlatformConfig> {
    const platformConfig = await PlatformConfig.findOne({
      where: { platform_id: platformId },
    });

    if (platformConfig) {
      // @ts-ignore
      return this.update(platformConfig.id, platformConfigData);
    }
    return this.create({
      platform_id: platformId,
      ...platformConfigData,
    });
  }

  async getByPlatformId(platformId: string) {
    const data = await PlatformConfig.findOne({
      where: { platform_id: platformId },
    });

    if (!data) {
      throw new Error('PlatformConfig not found');
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
    // @ts-ignore
    const data = Object.assign(platformConfig, platformConfigData);
    return data;
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

  async list(page: { page: number; pageSize: number }): Promise<{
    total: number;
    data: PlatformConfig[];
  }> {
    const data = await PlatformConfig.findAll({
      limit: page.pageSize,
      offset: (page.page - 1) * page.pageSize,
    });

    const total = await PlatformConfig.count();

    return { total, data };
  }
}
