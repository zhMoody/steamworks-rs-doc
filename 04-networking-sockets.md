# 04 - P2P 网络连接（NetworkingSockets）

> steamworks-rs 源码: `networking_sockets.rs`

P2P 连接的核心接口。通过 `client.networking_sockets()` 获取。

---

## `NetworkingSockets`

```rust
pub struct NetworkingSockets {
    pub(crate) sockets: *mut sys::ISteamNetworkingSockets,
    pub(crate) inner: Arc<Inner>,
}
```

---

## 认证

### `init_authentication`

```rust
pub fn init_authentication(&self) -> Result<NetworkingAvailability, NetworkingAvailabilityError>
```

初始化 P2P 认证，获取证书准备安全通信。

| 返回值 | 说明 |
|--------|------|
| `Result<NetworkingAvailability, NetworkingAvailabilityError>` | 当前认证状态 |

### `get_authentication_status`

```rust
pub fn get_authentication_status(&self) -> Result<NetworkingAvailability, NetworkingAvailabilityError>
```

查询当前认证状态。

| 返回值 | 说明 |
|--------|------|
| `Result<NetworkingAvailability, NetworkingAvailabilityError>` | 认证状态 |

---

## P2P 监听（Host）

### `create_listen_socket_p2p`

```rust
pub fn create_listen_socket_p2p(
    &self,
    local_virtual_port: i32,
    options: impl IntoIterator<Item = NetworkingConfigEntry>,
) -> Result<ListenSocket, InvalidHandle>
```

创建 P2P 监听套接字，等待客户端通过 `connect_p2p` 连接。

| 参数 | 类型 | 说明 |
|------|------|------|
| `local_virtual_port` | `i32` | 虚拟端口（单一监听用 `0`） |
| `options` | `impl IntoIterator<Item = NetworkingConfigEntry>` | 连接配置（如超时） |

| 返回值 | 说明 |
|--------|------|
| `Result<ListenSocket, InvalidHandle>` | 监听套接字 |

**常见 options:**
```rust
vec![
    NetworkingConfigEntry::new_int32(NetworkingConfigValue::TimeoutInitial, 60000),
]
```

---

## P2P 连接（Client）

### `connect_p2p`

```rust
pub fn connect_p2p(
    &self,
    identity_remote: NetworkingIdentity,
    remote_virtual_port: i32,
    options: impl IntoIterator<Item = NetworkingConfigEntry>,
) -> Result<NetConnection, InvalidHandle>
```

通过 Steam 后端信令连接到对端 peer。

| 参数 | 类型 | 说明 |
|------|------|------|
| `identity_remote` | `NetworkingIdentity` | 对端网络身份 |
| `remote_virtual_port` | `i32` | 远端虚拟端口（通常 `0`） |
| `options` | `impl IntoIterator<Item = NetworkingConfigEntry>` | 连接配置 |

| 返回值 | 说明 |
|--------|------|
| `Result<NetConnection, InvalidHandle>` | 连接对象 |

**常见 options:**
```rust
vec![
    NetworkingConfigEntry::new_int32(NetworkingConfigValue::P2PTransportICEEnable, 0),
    NetworkingConfigEntry::new_int32(NetworkingConfigValue::TimeoutInitial, 120000),
    NetworkingConfigEntry::new_int32(NetworkingConfigValue::TimeoutConnected, 120000),
]
```

构建 `NetworkingIdentity`:
```rust
let net_identity = NetworkingIdentity::new_steam_id(host_steam_id);
```

---

## IP 连接

### `create_listen_socket_ip`

```rust
pub fn create_listen_socket_ip(
    &self,
    local_address: SocketAddr,
    options: impl IntoIterator<Item = NetworkingConfigEntry>,
) -> Result<ListenSocket, InvalidHandle>
```

通过普通 UDP (IPv4/IPv6) 创建监听服务器。

### `connect_by_ip_address`

```rust
pub fn connect_by_ip_address(
    &self,
    address: SocketAddr,
    options: impl IntoIterator<Item = NetworkingConfigEntry>,
) -> Result<NetConnection, InvalidHandle>
```

通过 UDP 地址连接到服务器。

---

## 专用服务器

### `create_hosted_dedicated_server_listen_socket`

```rust
pub fn create_hosted_dedicated_server_listen_socket(
    &self,
    local_virtual_port: u32,
    options: impl IntoIterator<Item = NetworkingConfigEntry>,
) -> Result<ListenSocket, InvalidHandle>
```

创建专用服务器监听套接字（使用票据认证）。

---

## 连接查询

### `get_connection_info`

```rust
pub fn get_connection_info(
    &self,
    connection: &NetConnection,
) -> Result<NetConnectionInfo, bool>
```

获取连接基本信息（状态、对端身份、结束原因）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `connection` | `&NetConnection` | 连接对象 |

| 返回值 | 说明 |
|--------|------|
| `Result<NetConnectionInfo, bool>` | `Ok` = 连接信息 |

### `get_realtime_connection_status`

```rust
pub fn get_realtime_connection_status(
    &self,
    connection: &NetConnection,
    lanes: i32,
) -> Result<(NetConnectionRealTimeInfo, Vec<NetConnectionRealTimeLaneStatus>), SteamError>
```

获取连接实时状态（ping、丢包率、带宽等）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `connection` | `&NetConnection` | 连接对象 |
| `lanes` | `i32` | lane 数量（不需要 lane 数据则传 `0`） |

| 返回值 | 说明 |
|--------|------|
| `Result<(NetConnectionRealTimeInfo, Vec<...>), SteamError>` | 实时状态 + lane 数据 |

---

## Poll Group

### `create_poll_group`

```rust
pub fn create_poll_group(&self) -> NetPollGroup
```

创建轮询组。可用于批量接收多个连接的消息。

---

## `NetPollGroup` — 轮询组

```rust
pub struct NetPollGroup { /* private fields */ }
```

由 `create_poll_group` 创建。Drop 时自动销毁。

### `receive_messages`

```rust
pub fn receive_messages(&mut self, batch_size: usize) -> Vec<NetworkingMessage>
```

从轮询组中所有连接接收消息，最多 `batch_size` 条。

| 参数 | 类型 | 说明 |
|------|------|------|
| `batch_size` | `usize` | 每批最大消息数 |

| 返回值 | 说明 |
|--------|------|
| `Vec<NetworkingMessage>` | 收到的消息列表 |

---

## 批量发送

### `send_messages`

```rust
pub fn send_messages(
    &self,
    messages: impl IntoIterator<Item = NetworkingMessage>,
) -> Vec<SteamResult<MessageNumber>>
```

批量发送消息到多个连接。

| 参数 | 类型 | 说明 |
|------|------|------|
| `messages` | `impl IntoIterator<Item = NetworkingMessage>` | 消息列表（消息需通过 `set_connection` 指定目标连接） |

| 返回值 | 说明 |
|--------|------|
| `Vec<SteamResult<MessageNumber>>` | 每条消息的发送结果 |

---

## Lanes

### `configure_connection_lanes`

```rust
pub fn configure_connection_lanes(
    &self,
    connection: &NetConnection,
    num_lanes: i32,
    lane_priorities: &[i32],
    lane_weights: &[u16],
) -> Result<(), SteamError>
```

配置多 lane 消息流，控制 lane 之间的队头阻塞。

- **Priority**：数字越大优先级越高，低优先级 lane 只在高优先级 lane 为空时处理
- **Weight**：同优先级 lane 之间的带宽分配比例

---

## `ListenSocket` — 监听套接字

```rust
pub struct ListenSocket {
    inner: Arc<InnerSocket>,
    _callback_handle: Arc<CallbackHandle>,
    receiver: Receiver<ListenSocketEvent>,
}
```

由 `create_listen_socket_p2p` / `create_listen_socket_ip` 创建。

### 获取事件

| 方法 | 签名 | 说明 |
|------|------|------|
| `try_receive_event` | `fn try_receive_event(&self) -> Option<ListenSocketEvent>` | 非阻塞获取事件 |
| `receive_event` | `fn receive_event(&self) -> ListenSocketEvent` | 阻塞获取事件 |
| `events` | `fn events(&self) -> impl Iterator<Item = ListenSocketEvent>` | 阻塞迭代器 |

### `send_messages`

```rust
pub fn send_messages(
    &self,
    messages: impl IntoIterator<Item = NetworkingMessage>,
) -> Vec<SteamResult<MessageNumber>>
```

批量发送消息（从监听端）。每条消息需通过 `NetworkingMessage::set_connection` 指定目标连接。

| 参数 | 类型 | 说明 |
|------|------|------|
| `messages` | `impl IntoIterator<Item = NetworkingMessage>` | 消息列表 |

| 返回值 | 说明 |
|--------|------|
| `Vec<SteamResult<MessageNumber>>` | 每条消息的发送结果 |

---

## `ListenSocketEvent` — 监听事件

```rust
pub enum ListenSocketEvent {
    Connecting(ConnectionRequest),   // 有客户端请求连接
    Connected(ConnectedEvent),       // 握手完成，连接建立
    Disconnected(DisconnectedEvent), // 连接断开
}
```

### `ConnectionRequest` — 连接请求

```rust
pub struct ConnectionRequest {
    remote: NetworkingIdentity,
    user_data: i64,
    connection: NetConnection,
}
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `remote` | `fn remote(&self) -> NetworkingIdentity` | 对端身份 |
| `user_data` | `fn user_data(&self) -> i64` | 用户数据 |
| `accept` | `fn accept(self) -> SteamResult` | **接受连接** |
| `reject` | `fn reject(self, end_reason: NetConnectionEnd, debug_string: Option<&str>) -> bool` | 拒绝连接 |

**必须对 ConnectionRequest 立即响应**，否则对端会超时（1-2 秒内）。

### `ConnectedEvent` — 连接已建立

```rust
pub struct ConnectedEvent {
    remote: NetworkingIdentity,
    user_data: i64,
    connection: NetConnection,
}
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `remote` | `fn remote(&self) -> NetworkingIdentity` | 对端身份 |
| `user_data` | `fn user_data(&self) -> i64` | 用户数据 |
| `connection` | `fn connection(&self) -> &NetConnection` | 借用连接 |
| `take_connection` | `fn take_connection(self) -> NetConnection` | **转移连接所有权** |

### `DisconnectedEvent` — 连接断开

```rust
pub struct DisconnectedEvent {
    remote: NetworkingIdentity,
    user_data: i64,
    end_reason: NetConnectionEnd,
}
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `remote` | `fn remote(&self) -> NetworkingIdentity` | 对端身份 |
| `user_data` | `fn user_data(&self) -> i64` | 用户数据 |
| `end_reason` | `fn end_reason(&self) -> NetConnectionEnd` | 断开原因 |

---

## `NetConnection` — 连接对象

```rust
pub struct NetConnection {
    pub(crate) handle: sys::HSteamNetConnection,
    // ... private fields
}
```

### 连接信息

| 方法 | 签名 | 说明 |
|------|------|------|
| `info` | `fn info(&self) -> Result<NetConnectionInfo, InvalidHandle>` | 连接信息（状态、对端、结束原因） |
| `connection_name` | `fn connection_name(&self) -> Result<(), InvalidHandle>` | 获取连接名称（**未实现**） |
| `connection_user_data` | `fn connection_user_data(&self) -> Result<i64, InvalidHandle>` | 获取用户数据（-1 = 无效句柄） |
| `set_connection_user_data` | `fn set_connection_user_data(&self, user_data: i64) -> Result<(), InvalidHandle>` | 设置用户数据 |
| `set_connection_name` | `fn set_connection_name(&self, name: &str)` | 设置调试用连接名 |

### 发送

```rust
pub fn send_message(
    &self,
    data: &[u8],
    send_flags: SendFlags,
) -> SteamResult<MessageNumber>
```

发送消息。

| 参数 | 类型 | 说明 |
|------|------|------|
| `data` | `&[u8]` | 消息内容 |
| `send_flags` | `SendFlags` | 发送标志 |

| 返回值 | 说明 |
|--------|------|
| `SteamResult<MessageNumber>` | `Ok(n)` = 成功发送，消息编号 n；`Err` = 失败原因 |

可能的错误：
- `InvalidParam` — 句柄无效或消息太大
- `InvalidState` — 连接状态无效
- `NoConnection` — 连接已结束
- `Ignored` — `NO_DELAY` 模式下，当前无法发送而被丢弃
- `LimitExceeded` — 发送缓冲区满

### `flush_messages`

```rust
pub fn flush_messages(&self) -> SteamResult
```

立即发送 Nagle 缓冲区的待发送消息。

### 接收

#### `receive_messages`

```rust
pub fn receive_messages(
    &mut self,
    batch_size: usize,
) -> Result<Vec<NetworkingMessage>, InvalidHandle>
```

接收消息，最多 `batch_size` 条。

| 参数 | 类型 | 说明 |
|------|------|------|
| `batch_size` | `usize` | 每批最大消息数 |

| 返回值 | 说明 |
|--------|------|
| `Result<Vec<NetworkingMessage>, InvalidHandle>` | 消息列表 |

#### `receive_messages_with`

```rust
pub fn receive_messages_with(&mut self, f: impl FnMut(NetworkingMessage))
```

无分配接收——对每条消息调用闭包。会自动处理所有可用消息。

#### `receive_messages_into`

```rust
pub fn receive_messages_into(
    &mut self,
    dest: &mut Vec<NetworkingMessage>,
    batch_size: usize,
) -> Result<(), InvalidHandle>
```

接收消息到已有 Vec 中。

### 关闭

```rust
pub fn close(
    mut self,
    reason: NetConnectionEnd,
    debug_string: Option<&str>,
    enable_linger: bool,
) -> bool
```

断开连接。消耗 `self`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `reason` | `NetConnectionEnd` | 关闭原因（应用代码 1000-1999，系统代码 2000+） |
| `debug_string` | `Option<&str>` | 调试字符串（发送给对端） |
| `enable_linger` | `bool` | 是否尝试刷新剩余数据 |

### Poll Group

| 方法 | 签名 | 说明 |
|------|------|------|
| `set_poll_group` | `fn set_poll_group(&self, poll_group: &NetPollGroup)` | 将连接加入轮询组 |
| `clear_poll_group` | `fn clear_poll_group(&self) -> Result<(), InvalidHandle>` | 从轮询组移除 |

### 事件接收（独立连接）

以下方法仅适用于通过 `connect_p2p` / `connect_by_ip_address` 创建的独立连接（不通过 ListenSocket 管理）。

| 方法 | 签名 | 说明 |
|------|------|------|
| `try_receive_event` | `fn try_receive_event(&self) -> Option<NetConnectionEvent>` | 非阻塞获取连接状态事件 |
| `try_events` | `fn try_events(&self) -> Option<impl Iterator<Item = NetConnectionEvent>>` | 非阻塞迭代器获取所有待处理事件 |

### 回调

| 方法 | 签名 | 说明 |
|------|------|------|
| `run_callbacks` | `fn run_callbacks(&self)` | 运行此连接相关的网络回调 |

---

## `NetConnectionInfo` — 连接信息详情

```rust
pub struct NetConnectionInfo {
    pub(crate) inner: sys::SteamNetConnectionInfo_t,
}
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `identity_remote` | `fn identity_remote(&self) -> Option<NetworkingIdentity>` | 对端网络身份 |
| `user_data` | `fn user_data(&self) -> i64` | 用户数据 |
| `listen_socket` | `fn listen_socket(&self) -> Option<HSteamNetConnection>` | 监听套接字句柄 |
| `state` | `fn state(&self) -> Result<NetworkingConnectionState, InvalidConnectionState>` | 连接状态 |
| `end_reason` | `fn end_reason(&self) -> Option<NetConnectionEnd>` | 结束原因（连接中断时） |

---

## `NetConnectionRealTimeInfo` — 实时状态

```rust
pub struct NetConnectionRealTimeInfo {
    pub(crate) inner: sys::SteamNetConnectionRealTimeStatus_t,
}
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `connection_state` | `fn connection_state(&self) -> Result<NetworkingConnectionState, _>` | 连接状态 |
| `ping` | `fn ping(&self) -> i32` | 延迟 (ms) |
| `connection_quality_local` | `fn connection_quality_local(&self) -> f32` | 本地测量质量 (0~1) |
| `connection_quality_remote` | `fn connection_quality_remote(&self) -> f32` | 对端测量质量 (0~1) |
| `out_packets_per_sec` | `fn out_packets_per_sec(&self) -> f32` | 出站包/秒 |
| `out_bytes_per_sec` | `fn out_bytes_per_sec(&self) -> f32` | 出站字节/秒 |
| `in_packets_per_sec` | `fn in_packets_per_sec(&self) -> f32` | 入站包/秒 |
| `in_bytes_per_sec` | `fn in_bytes_per_sec(&self) -> f32` | 入站字节/秒 |
| `send_rate_bytes_per_sec` | `fn send_rate_bytes_per_sec(&self) -> i32` | 估计可用发送速率 |
| `pending_unreliable` | `fn pending_unreliable(&self) -> i32` | 待发送不可靠数据（bytes） |
| `pending_reliable` | `fn pending_reliable(&self) -> i32` | 待发送可靠数据（含重传，bytes） |
| `sent_unacked_reliable` | `fn sent_unacked_reliable(&self) -> i32` | 已发送未确认的可靠数据（bytes） |
| `queued_send_bytes` | `fn queued_send_bytes(&self) -> i64` | 估计排队时间（微秒） |

---

## `NetConnectionEvent` — 连接状态变更事件

```rust
pub struct NetConnectionEvent {
    pub new_state: NetworkingConnectionState,
    pub old_state: NetworkingConnectionState,
}
```

---

## `NetConnectionStatusChanged` Callback

```rust
pub struct NetConnectionStatusChanged {
    pub connection_info: NetConnectionInfo,
    pub old_state: NetworkingConnectionState,
}
```

连接状态变更时触发。可注册此回调监听连接生命周期：
```rust
client.register_callback(|event: NetConnectionStatusChanged| {
    // event.connection_info.state()
    // event.connection_info.identity_remote()
    // event.connection_info.end_reason()
});
```

---

## 完整 Host/Client 流程

### Host（监听端）
```rust
let sockets = client.networking_sockets();

// 1. 初始化认证
sockets.init_authentication();
// 等待 auth 就绪...

// 2. 创建大厅
client.matchmaking().create_lobby(LobbyType::Public, 4, |result| { ... });

// 3. 创建 P2P 监听
let options = vec![
    NetworkingConfigEntry::new_int32(NetworkingConfigValue::TimeoutInitial, 60000),
];
let listen_socket = sockets.create_listen_socket_p2p(0, options).unwrap();

// 4. 轮询事件
loop {
    while let Some(event) = listen_socket.try_receive_event() {
        match event {
            ListenSocketEvent::Connecting(req) => {
                req.accept();
            }
            ListenSocketEvent::Connected(connected) => {
                let conn = connected.take_connection();
                // 保存 conn，开始 send_message / receive_messages
            }
            ListenSocketEvent::Disconnected(disconnected) => {
                // 清理连接
            }
        }
    }
}
```

### Client（连接端）
```rust
let sockets = client.networking_sockets();

// 1. 初始化认证
sockets.init_authentication();
// 等待 auth 就绪...

// 2. 加入大厅
client.matchmaking().join_lobby(lobby_id, |result| { ... });

// 3. 连接主机
let identity = NetworkingIdentity::new_steam_id(host_steam_id);
let options = vec![
    NetworkingConfigEntry::new_int32(NetworkingConfigValue::P2PTransportICEEnable, 0),
    NetworkingConfigEntry::new_int32(NetworkingConfigValue::TimeoutInitial, 120000),
];
let conn = sockets.connect_p2p(identity, 0, options).unwrap();

// 4. 等待连接建立
for _ in 0..600 {
    if let Ok(info) = conn.info() {
        match info.state() {
            Ok(NetworkingConnectionState::Connected) => break,
            Ok(NetworkingConnectionState::ClosedByPeer)
            | Ok(NetworkingConnectionState::ProblemDetectedLocally) => {
                // 连接失败: info.end_reason()
                break;
            }
            _ => {}
        }
    }
    std::thread::sleep(Duration::from_millis(100));
}

// 5. 收发消息（与 Host 对称）
conn.send_message(data, SendFlags::RELIABLE);
let messages = conn.receive_messages(100);
```