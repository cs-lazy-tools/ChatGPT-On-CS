
## 本地调试说明
首先下载 https://wwp.lanzouo.com/ipTev1qulx1i 里面的文件并解压到你的项目目录 assets/backend 目录下

确定本地 Nodejs 环境没有问题后

然后运行以下命令，安装依赖

```bash
npm i -g pnpm
pnpm i
```

就可以运行以下命令，启动项目

下面是我的 vscode 配置文件，可以参考一下

```JSON
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Electron: Main",
      "type": "node",
      "request": "launch",
      "protocol": "inspector",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start"],
      "env": {
        "MAIN_ARGS": "--inspect=5858 --remote-debugging-port=9223"
      }
    },
    {
      "name": "Electron: Renderer",
      "type": "chrome",
      "request": "attach",
      "port": 9223,
      "webRoot": "${workspaceFolder}",
      "timeout": 15000
    }
  ],
  "compounds": [
    {
      "name": "Electron: All",
      "configurations": ["Electron: Main", "Electron: Renderer"]
    }
  ]
}
```

## 构建 Electron 的 Sqlite3
注意 Electron 有个 Sqlite3 的坑，需要重新编译，可以参考以下命令

```bash
pnpm --prefix=node_modules/sqlite3 run rebuild

https://registry.npmmirror.com       

# 使用 Visual Studio 社区中的 Desktop development with C++ 组件安装 C++ 工具集

nvm use 18

npm install --global windows-build-tools

pnpm config set msvs_version=2022
npm config set msvs_version 2022

# 删除node_modules目录和package-lock.json文件：

rm -rf node_modules
rm package-lock.json

# 重新编译sqlite3模块：

npm i -g node-gyp

# 项目根目录下执行
pnpm i -D node-addon-api@7.0.0

cd node_modules/sqlite3


node-gyp rebuild --verbose
# 或者执行
node-gyp rebuild --target=26.2.1 --arch=x64 --target_platform=win32 --dist-url=https://electronjs.org/headers --module_name=node_sqlite3 --module_path=../lib/binding/electron-v26.2.1-win32-x64

# 注意检查一下报错，可能需要在下面路径创建 node-addon-api（复制过去）

pnpm i -D electron-builder
pnpm run postinstall
```
