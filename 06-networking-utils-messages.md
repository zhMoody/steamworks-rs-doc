# 06 - 网络工具 & 消息

> steamworks-rs 源码: `networking_utils.rs`, `networking_messages.rs`

---

## `NetworkingUtils`

通过 `client.networking_utils()` 获取。

```rust
pub struct NetworkingUtils { /* private fields */ }
```

---

### `allocate_message`

```rust
pub fn allocate_message(&self, buffer_size: usize) -> NetworkingMessage
```

分配消息对象用于零拷贝发送。`buffer_size` 为 0 则不分配缓冲区。

| 参数 | 类型 | 说明 |
|------|------|------|
| `buffer_size` | `usize` | 缓冲区大小（0 = 不分配） |

---

### `init_relay_network_access`

```rust
pub fn init_relay_network_access(&self)
```

初始化 SDR 中继网络访问。失败后可调用此方法重试。

---

### `relay_network_status`

```rust
pub fn relay_network_status(&self) -> NetworkingAvailabilityResult
```

获取中继网络摘要状态。`Current` 表示就绪。

---

### `detailed_relay_network_status`

```rust
pub fn detailed_relay_network_status(&self) -> RelayNetworkStatus
```

获取中继网络详细状态。

---

### `relay_network_status_callback`

```rust
pub fn relay_network_status_callback(
    &self,
    callback: impl FnMut(RelayNetworkStatus) + Send + 'static,
)
```

注册中继网络状态变化回调。

---

## `RelayNetworkStatus`

```rust
pub struct RelayNetworkStatus { /* private fields */ }
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `availability` | `fn availability(&self) -> NetworkingAvailabilityResult` | 摘要状态 |
| `is_ping_measurement_in_progress` | `fn is_ping_measurement_in_progress(&self) -> bool` | 是否正在测延迟 |
| `network_config` | `fn network_config(&self) -> NetworkingAvailabilityResult` | 网络配置状态 |
| `any_relay` | `fn any_relay(&self) -> NetworkingAvailabilityResult` | 与任何中继通信的能力 |
| `debugging_message` | `fn debugging_message(&self) -> &str` | 英文诊断消息 |

---

## `NetworkingMessages`

无连接式消息接口（类似 UDP），通过 `client.networking_messages()` 获取。

```rust
pub struct NetworkingMessages { /* private fields */ }
```

---

### `send_message_to_user`

```rust
pub fn send_message_to_user(
    &self,
    user: NetworkingIdentity,
    send_type: SendFlags,
    data: &[u8],
    channel: u32,
) -> SteamResult
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `user` | `NetworkingIdentity` | 目标用户身份 |
| `send_type` | `SendFlags` | 发送标志 |
| `data` | `&[u8]` | 消息数据 |
| `channel` | `u32` | 通道号（0 = 默认） |

### `receive_messages_on_channel`

```rust
pub fn receive_messages_on_channel(
    &self,
    channel: u32,
    batch_size: usize,
) -> Vec<NetworkingMessage>
```

### `session_request_callback`

```rust
pub fn session_request_callback(
    &self,
    callback: impl FnMut(SessionRequest) + Send + 'static,
)
```

注册会话请求回调。对端请求连接时触发。重复调用替换之前回调。

### `session_failed_callback`

```rust
pub fn session_failed_callback(
    &self,
    callback: impl FnMut(NetConnectionInfo) + Send + 'static,
)
```

注册会话失败回调。

### `get_session_connection_info`

```rust
pub fn get_session_connection_info(
    &self,
    identity_remote: &NetworkingIdentity,
) -> (NetworkingConnectionState, Option<NetConnectionInfo>, Option<NetConnectionRealTimeInfo>)
```

获取会话连接状态。

---

## `SessionRequest` — 会话请求

超出作用域未处理则**自动拒绝**连接。

```rust
pub struct SessionRequest { /* private fields */ }
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `remote` | `fn remote(&self) -> &NetworkingIdentity` | 远端身份 |
| `accept` | `fn accept(mut self) -> bool` | 接受连接 |
| `reject` | `fn reject(mut self)` | 拒绝连接 |

---

## 使用示例

```rust
let messages = client.networking_messages();

messages.session_request_callback(|request| {
    println!("连接请求: {:?}", request.remote());
    request.accept();
});

messages.session_failed_callback(|info| {
    println!("会话失败: {:?}", info.end_reason());
});

messages.send_message_to_user(target, SendFlags::RELIABLE, &data, 0);

client.run_callbacks();
let received = messages.receive_messages_on_channel(0, 10);
```