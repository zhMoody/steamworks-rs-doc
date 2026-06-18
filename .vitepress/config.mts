import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'steamworks-rs API 参考',
  description: 'steamworks-rs fork 版本完整 API 参考手册',
  lang: 'zh-CN',
  themeConfig: {
    nav: [
      { text: 'GitHub', link: 'https://github.com/zhMoody/steamworks-rs' },
    ],
    search: {
      provider: 'local',
    },
    sidebar: [
      {
        text: '概述',
        items: [
          { text: '首页', link: '/' },
          { text: 'README', link: '/README' },
        ],
      },
      {
        text: 'API 参考',
        items: [
          { text: '01 - Client 初始化', link: '/01-client-init' },
          { text: '02 - 好友 & 用户身份', link: '/02-friends-user' },
          { text: '03 - 大厅 Matchmaking', link: '/03-matchmaking' },
          { text: '04 - P2P 网络连接', link: '/04-networking-sockets' },
          { text: '05 - 网络类型 & 配置', link: '/05-networking-types' },
          { text: '06 - 网络工具 & 消息', link: '/06-networking-utils-messages' },
          { text: '07 - 其他模块', link: '/07-other-modules' },
          { text: '08 - 旧版 Networking', link: '/08-legacy-networking' },
          { text: '09 - 成就 & 统计 & 排行榜', link: '/09-user-stats' },
          { text: '10 - 错误类型 & 回调系统', link: '/10-error-callback' },
        ],
      },
    ],
  },
})