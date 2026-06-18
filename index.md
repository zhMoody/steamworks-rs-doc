---
layout: home

hero:
  name: steamworks-rs
  text: API 参考手册
  tagline: 基于 zhMoody/steamworks-rs fork 版本 (raw-bindings feature)
  actions:
    - theme: brand
      text: 开始阅读
      link: ./01-client-init
    - theme: alt
      text: GitHub
      link: https://github.com/zhMoody/steamworks-rs

features:
  - icon: 🔌
    title: P2P 网络
    details: 完整的 P2P 连接 API，包括 connect_p2p、create_listen_socket_p2p、NAT 穿透、中继传输等。
  - icon: 🏠
    title: Steam 大厅
    details: 创建/加入/搜索大厅、成员管理、大厅聊天、Rich Presence 集成。
  - icon: 👤
    title: 好友 & 用户
    details: 好友列表、身份认证票据、在线状态、Steam 覆盖层集成。
  - icon: ⚙️
    title: 完整配置项
    details: 所有 NetworkingConfigValue 详解，超时、缓冲、ICE、加密等调优参数。
---