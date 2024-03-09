import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function readVersionFromCmd(cmd: string, pattern: RegExp) {
  try {
    const { stdout } = await execAsync(cmd, { shell: 'powershell.exe' });
    const match = stdout.match(pattern);
    return match ? match[0] : null;
  } catch (error) {
    // 如果命令执行失败，这里会捕获到异常，但我们选择忽略它，因为可能是因为浏览器不存在
    return null;
  }
}

export async function getBrowserVersionFromOS(): Promise<string | null> {
  const commands = [
    `(Get-Item -Path "$env:PROGRAMFILES\\Google\\Chrome\\Application\\chrome.exe").VersionInfo.FileVersion`,
    `(Get-Item -Path "'$env:PROGRAMFILES (x86)'\\Google\\Chrome\\Application\\chrome.exe").VersionInfo.FileVersion`,
    `(Get-Item -Path "$env:LOCALAPPDATA\\Google\\Chrome\\Application\\chrome.exe").VersionInfo.FileVersion`,
    `(Get-ItemProperty -Path Registry::"HKCU\\SOFTWARE\\Google\\Chrome\\BLBeacon").version`,
    `(Get-ItemProperty -Path Registry::"HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Google Chrome").version`,
  ];
  const pattern = /\d+\.\d+\.\d+/;

  const firstHitTemplate = `$tmp = {expression}; if ($tmp) {echo $tmp; Exit;};`;
  const script = `$ErrorActionPreference='silentlycontinue'; ${commands
    .map((e) => firstHitTemplate.replace('{expression}', e))
    .join(' ')}`;

  const version = await readVersionFromCmd(`${script}`, pattern);
  return version; // 如果所有命令都失败了，返回 null
}
