import { Config } from '../entities/config';

export class ConfigController {
  async getConfig(): Promise<Config> {
    try {
      const config = await Config.findByPk(1);
      if (!config) {
        throw new Error('Config not found');
      }

      return config;
    } catch (error) {
      const newConfig = await Config.create({
        extract_phone: true,
        extract_product: true,
        save_path: '',
        reply_speed: 0,
        reply_random_speed: 0,
        default_reply: '',
        wait_humans_time: 60,
        context_count: 1,
        gpt_base_url: 'https://api.openai.com/v1',
        gpt_key: 'your-key',
        gpt_model: 'gpt-3.5-turbo',
        gpt_temperature: 0.7,
        gpt_top_p: 0.9,
        stream: true,
        use_lazy: false,
        lazy_key: 'your-key',
      });
      return newConfig;
    }
  }

  async updateConfig(id: number, configData: Partial<Config>): Promise<Config> {
    const config = await Config.findByPk(id);
    if (!config) {
      throw new Error('Config not found');
    }

    const data = await config.update(configData);
    return data;
  }
}
