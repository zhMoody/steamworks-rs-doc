# steamworks-rs API 参考手册

> 基于 [zhMoody/steamworks-rs](https://github.com/zhMoody/steamworks-rs) fork 版本 (`raw-bindings` feature)
> SDK App ID: 480 (Spacewar)

---

## 目录

| 文件 | 内容 | 说明 |
|------|------|------|
| [01 - Client 初始化 & 基础类型](01-client-init.md) | `Client`, `SteamId`, `AppId`, `AccountType`, `Universe` | 入口点和基础数据结构 |
| [02 - 好友 & 用户身份](02-friends-user.md) | `Friends`, `Friend`, `User`, Rich Presence, 认证票据 | 好友管理、大厅邀请、用户认证 |
| [03 - 大厅 Matchmaking](03-matchmaking.md) | `Matchmaking`, `LobbyId`, `LobbyType`, 大厅搜索/过滤 | 创建/加入/搜索大厅、聊天、成员管理 |
| [04 - P2P 网络连接](04-networking-sockets.md) | `NetworkingSockets`, `NetConnection`, `ListenSocket` | **核心** - P2P 连接、收发消息、连接生命周期 |
| [05 - 网络类型 & 配置](05-networking-types.md) | `NetworkingConfigValue`, `NetConnectionEnd`, `NetworkingIdentity`, `SendFlags` | 所有配置项、连接状态、结束原因 |
| [06 - 网络工具 & 消息](06-networking-utils-messages.md) | `NetworkingUtils`, `NetworkingMessages`, 中继网络 | 全局配置、调试回调、中继状态 |
| [07 - 其他模块](07-other-modules.md) | `Apps`, `Utils`, `Input`, `Screenshots`, `RemoteStorage`, `RemotePlay`, `Timeline`, `Server`, `UGC` | 辅助功能接口 |

---

## 快速查找

### 我想...

| 场景 | 跳转 |
|------|------|
| **创建 P2P 连接** | [04-P2P 网络连接](04-networking-sockets.md) |
| **设置连接超时 / 禁用 ICE** | [05-网络类型 & 配置](05-networking-types.md) |
| **创建/加入 Steam 大厅** | [03-大厅 Matchmaking](03-matchmaking.md) |
| **查看连接失败原因** | [05 - `NetConnectionEnd`](05-networking-types.md#netconnectionend--连接结束原因) |
| **监控连接质量 (ping/丢包)** | [04 - `NetConnectionRealTimeInfo`](04-networking-sockets.md#netconnectionrealtimeinfo--实时状态) |
| **初始化认证流程** | [04 - `init_authentication`](04-networking-sockets.md#init_authentication) |
| **设置 Rich Presence** | [02 - Rich Presence](02-friends-user.md#rich-presence) |
| **监听大厅邀请** | [02 - Callback 事件](02-friends-user.md#callback-事件可注册监听) |
| **初始化 Steam 客户端** | [01 - Client](01-client-init.md#client) |
| **获取好友列表** | [02 - `get_friends`](02-friends-user.md#get_friends) |
| **中继网络诊断** | [06 - 中继网络](06-networking-utils-messages.md#中继网络) |
| **发送不可靠消息** | [05 - `SendFlags`](05-networking-types.md#sendflags--消息发送标志) |

---

## 典型 P2P 连接流程

```
1. Client::init_app(480)                    — 初始化 Steam 客户端
2. sockets.init_authentication()           — 初始化 P2P 认证
3. 等待 auth → Current                      — 认证就绪

Host 端:                                    Client 端:
4a. create_lobby(Public, 4)                 4b. join_lobby(lobby_id)
5a. create_listen_socket_p2p(0, opts)      5b. connect_p2p(host_steam_id, 0, opts)
6a. accept() + take_connection()           6b. 等待 Connected 状态
7. 双方 send_message / receive_messages     — 收发数据
```

---

## 底层 sys API

启用 `raw-bindings` feature 后，可通过 `steamworks::sys::*` 直接访问 C API：

```rust
steamworks::sys::SteamAPI_SteamNetworkingSockets_SteamAPI_v012()
steamworks::sys::SteamAPI_SteamNetworkingUtils_SteamAPI_v004()
steamworks::sys::SteamAPI_ISteamNetworkingUtils_InitRelayNetworkAccess(ptr)
steamworks::sys::SteamAPI_ISteamNetworkingUtils_SetConfigValue(ptr, ...)
steamworks::sys::SteamAPI_ISteamMatchmaking_InviteUserToLobby(ptr, lobby_id, friend_id)
```

---

## 相关资源

- [Steamworks 官方文档](https://partner.steamgames.com/doc/sdk/api)
- [Steamworks ISteamNetworkingSockets 参考](https://partner.steamgames.com/doc/api/ISteamNetworkingSockets)
- [Steamworks ISteamMatchmaking 参考](https://partner.steamgames.com/doc/api/ISteamMatchmaking)