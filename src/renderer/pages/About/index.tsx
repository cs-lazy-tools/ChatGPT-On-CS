import React from 'react';
import PageContainer from '../../components/PageContainer';
import Markdown from '../../components/Markdown';

const AboutPage: React.FC = () => {
  return (
    <PageContainer>
      <Markdown
        content={`
本项目是基于大模型的智能对话客服工具，支持哔哩哔哩、抖音企业号、抖音、抖店、微博聊天、小红书专业号运营、小红书、知乎等平台接入，可选择 GPT3.5/GPT4.0，能处理文本、语音和图片，通过插件访问操作系统和互联网等外部资源，支持基于自有知识库定制企业 AI 应用。

## 使用说明
项目文档: [懒人百宝箱使用说明](https://gitee.com/alsritter/ChatGPT-On-CS)

## 演示视频
[哔哩哔哩](https://www.bilibili.com/video/BV1qz421Q73S)

## 项目地址

* [GitHub](https://github.com/lrhh123/ChatGPT-On-CS)
* [Gitee](https://gitee.com/alsritter/ChatGPT-On-CS) (国内用户推荐)
      `}
      />
    </PageContainer>
  );
};

export default AboutPage;
