# 08 - 旧版 Networking API (已弃用)

> steamworks-rs 源码: `networking.rs`
>
> **注意**: 此模块已被 `NetworkingSockets` (04) 取代，但当前仍可用。

---

## 概述

旧版 `ISteamNetworking` 接口。通过 `client.networking()` 获取。

```rust
pub struct Networking {
    pub(crate) net: *mut sys::ISteamNetworking,
    pub(crate) _inner: Arc<Inner>,
}
```

---

## `SendType` — 发送方式

```rust
pub enum SendType {
    Unreliable,            // 不可靠，最大 1200 字节
    UnreliableNoDelay,     // 不可靠且不缓冲（连接建立前的包会被丢弃）
    Reliable,              // 可靠，最大 1MB
    ReliableWithBuffering, // 可靠 + Nagle 算法
}
```

---

## `P2PSessionError` — P2P 会话错误

```rust
#[repr(u8)]
pub enum P2PSessionError {
    None = 0,              // 无错误
    NotRunningApp = 1,     // [已弃用] 远端在玩另一个游戏
    NoRightsToApp = 2,     // 本地用户没有此 App 的许可
    NotLoggedIn = 3,       // [已弃用] 远端不在线
    Timeout = 4,           // 远端未响应（可能因防火墙阻断，需开放 UDP 3478, 4379, 4380）
    Unknown(u8),           // 未知错误码
}
```

---

## `P2PSessionState` — P2P 会话状态

```rust
pub struct P2PSessionState {
    pub connection_active: bool,      // 是否有活跃连接
    pub connecting: bool,             // 是否正在建立连接
    pub error: P2PSessionError,       // 最后错误
    pub using_relay: bool,            // 是否通过 Steam 中继
    pub bytes_queued_for_send: i32,   // 排队待发送字节数
    pub packets_queued_for_send: i32, // 排队待发送包数
    pub remote_ip: Option<Ipv4Addr>,  // 远端 IP（可能是中继服务器）
    pub remote_port: Option<u16>,     // 远端端口
}
```

---

## Networking 方法

### `accept_p2p_session`

```rust
pub fn accept_p2p_session(&self, user: SteamId) -> bool
```

接受来自指定用户的 P2P 包。仅应在收到 `P2PSessionRequest` 回调后调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `user` | `SteamId` | 请求连接的用户 |

### `close_p2p_session`

```rust
pub fn close_p2p_session(&self, user: SteamId) -> bool
```

关闭与指定用户的 P2P 连接。

### `get_p2p_session_state`

```rust
pub fn get_p2p_session_state(&self, user: SteamId) -> Option<P2PSessionState>
```

获取与指定用户的连接状态。无连接则返回 `None`。

### `send_p2p_packet`

```rust
pub fn send_p2p_packet(&self, remote: SteamId, send_type: SendType, data: &[u8]) -> bool
```

发送包到指定用户。连接不存在则自动建立。使用默认通道 0。

| 参数 | 类型 | 说明 |
|------|------|------|
| `remote` | `SteamId` | 目标用户 |
| `send_type` | `SendType` | 发送方式 |
| `data` | `&[u8]` | 数据 |

### `send_p2p_packet_on_channel`

```rust
pub fn send_p2p_packet_on_channel(
    &self,
    remote: SteamId,
    send_type: SendType,
    data: &[u8],
    channel: i32,
) -> bool
```

同上，指定通道号。不同通道消息不保证顺序。

### `is_p2p_packet_available`

```rust
pub fn is_p2p_packet_available(&self) -> Option<usize>
```

检查是否有排队的可读包。返回包大小（默认通道 0）。

### `is_p2p_packet_available_on_channel`

```rust
pub fn is_p2p_packet_available_on_channel(&self, channel: i32) -> Option<usize>
```

同上，指定通道。

### `read_p2p_packet`

```rust
pub fn read_p2p_packet(&self, buf: &mut [u8]) -> Option<(SteamId, usize)>
```

读取排队的包。返回 `(发送者 SteamId, 实际大小)`。使用默认通道 0。

### `read_p2p_packet_from_channel`

```rust
pub fn read_p2p_packet_from_channel(
    &self,
    buf: &mut [u8],
    channel: i32,
) -> Option<(SteamId, usize)>
```

同上，指定通道。

---

## Callback 事件

### `P2PSessionRequest`

```rust
pub struct P2PSessionRequest {
    pub remote: SteamId,  // 请求 P2P 会话的用户
}
```

收到 P2P 请求时触发。应调用 `accept_p2p_session` 响应。

### `P2PSessionConnectFail`

```rust
pub struct P2PSessionConnectFail {
    pub remote: SteamId,        // 连接失败的用户
    pub error: P2PSessionError, // 失败原因
}
```

P2P 会话连接失败时触发。

---

## 使用示例

```rust
let networking = client.networking();

// 监听 P2P 请求
client.register_callback(|req: P2PSessionRequest| {
    networking.accept_p2p_session(req.remote);
});

// 监听失败
client.register_callback(|fail: P2PSessionConnectFail| {
    println!("P2P 连接失败: {:?} - {:?}", fail.remote, fail.error);
});

// 发送
networking.send_p2p_packet(target_steam_id, SendType::Reliable, &data);

// 接收
if let Some(size) = networking.is_p2p_packet_available() {
    let mut buf = vec![0u8; size];
    if let Some((sender, actual_size)) = networking.read_p2p_packet(&mut buf) {
        println!("收到来自 {} 的 {} 字节", sender.raw(), actual_size);
    }
}

// 查状态
if let Some(state) = networking.get_p2p_session_state(target_steam_id) {
    println!("活跃={}, 中继={}", state.connection_active, state.using_relay);
}
```