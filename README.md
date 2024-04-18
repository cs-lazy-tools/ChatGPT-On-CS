

## 目录结构设计
```
my-app/
├── node_modules/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.js
│   │   │   ├── Sidebar.js
│   │   │   └── Footer.js
│   │   ├── ui/
│   │   └── common/
│   ├── pages/
│   │   ├── HomePage.js
│   │   ├── SettingsPage.js
│   │   └── AboutPage.js
│   ├── utils/ (或者 helpers/)
│   ├── hooks/
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   ├── constants/
│   ├── context/
│   ├── services/ (或者 api/)
│   └── App.js
├── .gitignore
├── package.json
└── README.md
```

- `components/`: 存放可复用的组件，如按钮、输入框等。
  - `layout/`: 用于布局相关的组件，如导航栏、侧边栏、页脚等。
  - `ui/`: UI 组件，可能包括主题特定的组件。
  - `common/`: 其他通用组件。
- `pages/`: 存放应用的页面组件，通常这些组件会对应不同的路由。
- `utils/` 或 `helpers/`: 存放工具函数或者帮助函数。
- `hooks/`: 存放自定义钩子。
- `assets/`: 存放静态资源，如图片、CSS 文件等。
- `constants/`: 存放常量定义。
- `context/`: 存放 React 的 Context 文件，用于状态管理。
- `services/` 或 `api/`: 存放与后端交互的服务或 API 调用。


## webpack 配置说明
在 Electron-React-Boilerplate 项目中，Webpack配置被细分以适应不同的用途和环境。这些配置包括基础配置、针对ESLint的配置、主进程和渲染进程的开发与生产配置，以及预加载（preload）脚本和动态链接库（DLL）的特定配置。为了使`.env`文件中的环境变量在你的应用中可用，主要关注点应是主进程和渲染进程的配置文件。下面是每个文件的简要说明，以及你可能需要修改的文件：

- **webpack.config.base.ts**: 基础配置，被其他所有配置文件共享。如果你想要全局应用一些配置（如解析规则、插件等），这是一个好地方。
- **webpack.config.eslint.ts**: 专门为ESLint设置的Webpack配置。通常，不需要在这里添加`.env`文件支持。
- **webpack.config.main.prod.ts**: 主进程的生产环境配置。如果你需要在生产环境的主进程中使用环境变量，应修改此文件。
- **webpack.config.preload.dev.ts**: 开发环境的预加载脚本配置。这个配置用于预加载脚本，除非你特别需要在预加载脚本中使用环境变量，否则无需修改。
- **webpack.config.renderer.dev.dll.ts**: 用于渲染进程开发环境的DLL配置。这主要用于性能优化，不是加载`.env`的目标。
- **webpack.config.renderer.dev.ts**: 渲染进程的开发环境配置。如果你需要在开发环境的渲染进程中使用环境变量，应修改此文件。
- **webpack.config.renderer.prod.ts**: 渲染进程的生产环境配置。如果你需要在生产环境的渲染进程中使用环境变量，应修改此文件。
- **webpack.paths.ts**: 定义Webpack使用的各种路径。通常，不需要为了`.env`支持而修改此文件。

### 如何确定修改哪个？
直接看 package.json 中的 scripts，找到对应的配置文件，然后修改即可。

```json
"scripts": {
  // ...
  "start": "ts-node ./.erb/scripts/check-port-in-use.js && pnpm run start:renderer",
  "start:main": "cross-env NODE_ENV=development electronmon -r ts-node/register/transpile-only .",
  "start:preload": "cross-env NODE_ENV=development TS_NODE_TRANSPILE_ONLY=true webpack --config ./.erb/configs/webpack.config.preload.dev.ts",
  "start:renderer": "cross-env NODE_ENV=development TS_NODE_TRANSPILE_ONLY=true webpack serve --config ./.erb/configs/webpack.config.renderer.dev.ts",
  "test": "jest"
},
```
