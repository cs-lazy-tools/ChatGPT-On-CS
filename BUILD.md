
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