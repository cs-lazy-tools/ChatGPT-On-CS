const fs = require('fs');
const path = require('path');

module.exports = async function (params) {
  // Assuming 'locales' directory is directly inside the app output directory
  const localesDir = path.join(params.appOutDir, 'locales');

  try {
    const files = await fs.promises.readdir(localesDir);
    for (const file of files) {
      if (!file.endsWith('zh-CN.pak')) {
        await fs.promises.unlink(path.join(localesDir, file));
      }
    }
  } catch (err) {
    console.error('Error removing locales:', err);
  }
};
