# 产品演示视频 · 源片与托管说明

本目录存放 README「产品演示」六段介绍片的**源文件**（1280×720，共约 45MB）。

| 文件 | 对应片子 |
| --- | --- |
| `store-transfer.mp4` | 接店铺 · 客服转接 |
| `chat.mp4` | 聚合聊天 |
| `knowledge.mp4` | 知识库配置 |
| `scene-agent.mp4` | 场景 Agent 与 AI 行为策略 |
| `test-bench.mp4` | 场景训练台 |
| `data-center.mp4` | 数据中心 |

## ⚠️ README 里播放的不是这些文件

GitHub 的 Markdown 渲染器**只允许 `user-attachments` 域的 `<video>` 内联播放**。
仓库内相对路径、`raw.githubusercontent.com` 地址、release 附件地址，
三种写法都会被 sanitizer 整个剥掉——标签连同视频一起消失，页面上什么都不剩。
（用 GitHub 自己的 markdown API `POST /markdown` 逐种实测过。）

所以 README 引用的是 **user-attachments 附件地址**，本目录的文件是源片与兜底。

## ⚠️ 附件靠一条 PR 评论承载，删了就全失效

user-attachments 附件**必须随一条真正发布出去的内容才会变公开**：
只把文件拖进评论框而不提交，拿到的地址匿名访问是 404。

因此这六段片子发布在本仓库一条 PR 评论里，那条评论就是附件的宿主。
**删除那条评论，README 首页七个播放器会一起失效。**
本仓库 Issues 与 Discussions 均为关闭状态，PR 评论是唯一可用的公开发布面。

## 换片 / 修复流程

1. 把新片放进本目录并提交。
2. 开一个 PR，在该 PR 的评论框里逐个上传视频（**一次传一个**）。
3. **提交评论**——不提交则地址不公开。
4. 把评论里生成的 `https://github.com/user-attachments/assets/<id>` 逐条替换进 README。
5. 验证要**匿名做**：带登录态时 GitHub 会把 src 换成
   `private-user-images.githubusercontent.com/...?jwt=…` 的签名短效地址，看着像私有，是假象。
   真正的判据是匿名 `curl` canonical 地址拿到 200，以及匿名抓仓库首页数 `<video>` 个数。
