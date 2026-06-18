# 05 - 网络类型 & 配置

> steamworks-rs 源码: `networking_types.rs`

---

## `NetworkingConnectionState` — 连接状态

```rust
pub enum NetworkingConnectionState {
    None,                      // 无连接
    Connecting,                // 正在连接
    FindingRoute,              // 寻找路由（SDR 中继协商中）
    Connected,                 // 已连接
    ClosedByPeer,              // 对端关闭
    ProblemDetectedLocally,    // 本地检测到问题
}
```

状态流转：
```
None → Connecting → FindingRoute → Connected
                  → ClosedByPeer
                  → ProblemDetectedLocally
```

---

## `NetConnectionEnd` — 连接结束原因

```rust
pub enum NetConnectionEnd {
    Invalid,                       // 0: 无效/哨兵值

    // === 应用代码 (1000-1999) ===
    App(AppNetConnectionEnd),      // 1xxx: 应用正常/异常关闭

    // === 本地问题 (2000-2999) ===
    LocalOfflineMode,                   // 离线模式
    LocalManyRelayConnectivity,         // 无法连接多个中继
    LocalHostedServerPrimaryRelay,      // 专用服务器中继问题
    LocalNetworkConfig,                 // 无法获取网络配置
    LocalRights,                        // 无权限
    LocalP2PICENoPublicAddresses,       // ICE 无法确定公网地址（仅内部使用）

    // === 远端或中间问题 (4000+) ===
    RemoteTimeout,                      // 对端超时
    RemoteBadEncrypt,                   // 加密握手失败
    RemoteBadCert,                      // 证书问题
    RemoteBadProtocolVersion,           // 协议版本不兼容
    RemoteP2PICENoPublicAddresses,      // 对端 ICE 无法确定公网地址（仅内部使用）

    // === 混合/未知 ===
    MiscGeneric,                        // 一般失败
    MiscInternalError,                  // 内部错误（可能是 bug）
    MiscTimeout,                        // 超时
    MiscP2PRendezvous,                  // P2P rendezvous 失败
    MiscP2PNATFirewall,                 // NAT/防火墙阻断
    MiscPeerSentNoConnection,           // 对端回复无此连接记录
    MiscSteamConnectivity,              // Steam 连接问题
    MiscNoRelaySessionsToClient,        // 无法建立中继会话
    MiscMaxMessageSizeExceeded,         // 超过最大消息大小
    Other(i32),                         // 未知/自定义错误码
}
```

### `AppNetConnectionEnd`
```rust
pub struct AppNetConnectionEnd { code: i32 }
```

应用层自定义连接结束代码。

| 方法 | 签名 | 说明 |
|------|------|------|
| `code` | `fn code(&self) -> i32` | 获取原始错误码 |
| `generic_normal` | `fn generic_normal() -> Self` | 通用正常关闭（code=1000） |
| `normal` | `fn normal(code: i32) -> Self` | 自定义正常关闭（code 范围 1000-1999），越界 panic |
| `generic_exception` | `fn generic_exception() -> Self` | 通用异常关闭（code=4000） |
| `exception` | `fn exception(code: i32) -> Self` | 自定义异常关闭（code 范围 4000-4999），越界 panic |
| `is_normal` | `fn is_normal(&self) -> bool` | 是否为正常关闭（code 在 1000-1999） |
| `is_exception` | `fn is_exception(&self) -> bool` | 是否为异常关闭（code 在 4000-4999） |

正常关闭范围: `AppMin = 1000`, `AppGeneric = 1000`, `AppMax = 1999`
异常关闭范围: `AppExceptionMin = 4000`, `AppExceptionGeneric = 4000`, `AppExceptionMax = 4999`

---

## `NetworkingIdentity` — 网络身份

```rust
pub struct NetworkingIdentity {
    inner: sys::SteamNetworkingIdentity,
}
```

### 构造

| 方法 | 签名 | 说明 |
|------|------|------|
| `new` | `fn new() -> Self` | 创建空白身份 |
| `new_steam_id` | `fn new_steam_id(id: SteamId) -> Self` | 使用 Steam ID 创建 |
| `new_ip` | `fn new_ip(addr: SocketAddr) -> Self` | 使用 IP 地址创建 |

实现了 `From<SteamId>` 和 `Default` trait。

### 查询

| 方法 | 签名 | 说明 |
|------|------|------|
| `steam_id` | `fn steam_id(&self) -> Option<SteamId>` | 获取 Steam ID |
| `is_valid` | `fn is_valid(&self) -> bool` | 是否有效 |
| `is_invalid` | `fn is_invalid(&self) -> bool` | 是否无效 |
| `is_local_host` | `fn is_local_host(&self) -> bool` | 是否为本地主机 |
| `is_equal_to` | `fn is_equal_to(&self, other: &Self) -> bool` | 比较两个身份是否相等 |
| `debug_string` | `fn debug_string(&self) -> String` | 调试字符串（如 `"steamid:7656119..."` 或 `"ip:192.168..."`） |

### 修改

| 方法 | 签名 | 说明 |
|------|------|------|
| `set_steam_id` | `fn set_steam_id(&mut self, id: SteamId)` | 设为 Steam ID |
| `set_ip_addr` | `fn set_ip_addr(&mut self, addr: SocketAddr)` | 设为 IP 地址 |
| `set_local_host` | `fn set_local_host(&mut self)` | 设为本地主机 |
| `clear` | `fn clear(&mut self)` | 清空 |

实现了 `PartialEq` 和 `Eq`，可直接用 `==` 比较两个 `NetworkingIdentity`。

---

## `NetworkingConfigEntry` — 配置项

```rust
pub struct NetworkingConfigEntry {
    inner: sys::SteamNetworkingConfigValue_t,
}

impl NetworkingConfigEntry {
    pub fn new_int32(value_type: NetworkingConfigValue, value: i32) -> Self;
    pub fn new_int64(value_type: NetworkingConfigValue, value: i64) -> Self;
    pub fn new_float(value_type: NetworkingConfigValue, value: f32) -> Self;
    pub fn new_string(value_type: NetworkingConfigValue, value: &str) -> Self;
}
```

每个构造函数的 `value_type` 必须与参数类型匹配，`debug_assert` 会在类型不匹配时 panic。

---

## `NetworkingConfigValue` — 所有配置项

### 模拟/调试
| 枚举值 | 类型 | 说明 |
|--------|------|------|
| `FakePacketLossSend` | float (0-100) | 随机丢弃 N% 出站包 |
| `FakePacketLossRecv` | float (0-100) | 随机丢弃 N% 入站包 |
| `FakePacketLagSend` | int32 | 出站延迟 N ms |
| `FakePacketLagRecv` | int32 | 入站延迟 N ms |
| `FakePacketReorderSend` | float (0-100) | 包重排序百分比 |
| `FakePacketReorderRecv` | float (0-100) | 包重排序百分比 |
| `FakePacketReorderTime` | int32 | 重排序额外延迟 ms |
| `FakePacketDupSend` | float (0-100) | 复制包百分比 |
| `FakePacketDupRecv` | float (0-100) | 复制包百分比 |
| `FakePacketDupTimeMax` | int32 | 复制包最大延迟 ms |

### 超时
| 枚举值 | 类型 | 说明 |
|--------|------|------|
| `TimeoutInitial` | int32 | 初始连接超时 (ms) |
| `TimeoutConnected` | int32 | 已连接后超时 (ms) |

### 缓冲 & 速率
| 枚举值 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SendBufferSize` | int32 | 512KB | 发送缓冲区上限 (bytes) |
| `SendRateMin` | int32 | 0 (无限制) | 最小发送速率 (bytes/s) |
| `SendRateMax` | int32 | 0 (无限制) | 最大发送速率 (bytes/s) |

### Nagle
| 枚举值 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NagleTime` | int32 | 5000 | Nagle 合并延迟 (μs) — 连续小消息合并为单个包 |

### MTU
| 枚举值 | 类型 | 说明 |
|--------|------|------|
| `MTUPacketSize` | int32 | MTU 包大小限制 |
| `MTUDataSize` | int32 | 不分片的最大消息大小 (只读) |

### 安全 & 认证
| 枚举值 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `IPAllowWithoutAuth` | int32 | 0 | 允许未认证的 IP 连接 |
| `Unencrypted` | int32 | 0 (必须加密) | 0=必须加密, 1=允许明文, 2=偏好明文, 3=强制明文 |

### P2P 专用
| 枚举值 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `P2PSTUNServerList` | string | — | STUN 服务器列表（逗号分隔），空字符串禁用 NAT 打洞 |
| `P2PTransportICEEnable` | int32 | 1 | 是否启用 ICE (NAT 打洞)，0=禁用 |
| `P2PTransportICEPenalty` | int32 | — | ICE 传输路由评分惩罚值 |
| `P2PTransportSDRPenalty` | int32 | — | SDR 中继传输路由评分惩罚值 |
| `SymmetricConnect` | int32 | 0 | 对称连接模式（双方可同时发起连接自动协商） |
| `LocalVirtualPort` | int32 | — | 本地虚拟端口号 |

### SDR 中继
| 枚举值 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `SDRClientConsecutitivePingTimeoutsFailInitial` | int32 | — | 初始连续 ping 超时次数阈值，超过则标记端口不可用 |
| `SDRClientConsecutitivePingTimeoutsFail` | int32 | — | 已通信后连续 ping 超时次数阈值 |
| `SDRClientMinPingsBeforePingAccurate` | int32 | — | 延迟估算准确前需要发送的最小 ping 数 |
| `SDRClientSingleSocket` | int32 | — | 所有 SDR 流量共用同一本地端口 |
| `SDRClientForceRelayCluster` | string | — | 强制使用指定中继集群（如 `"iad"`） |
| `SDRClientDebugTicketAddress` | string | — | 调试用，生成自签名票据的 gameserver 地址 |
| `SDRClientForceProxyAddr` | string | — | 调试用，覆盖中继列表（逗号分隔） |
| `SDRClientFakeClusterPing` | string | — | 调试用，伪造集群 ping 值（如 `"sto=32,iad=100"`） |

### 日志级别
| 枚举值 | 类型 | 说明 |
|--------|------|------|
| `LogLevelAckRTT` | int32 | ACK/RTT 计算日志 |
| `LogLevelPacketDecode` | int32 | SNP 包收发日志 |
| `LogLevelMessage` | int32 | 消息收发日志 |
| `LogLevelPacketGaps` | int32 | 丢包日志 |
| `LogLevelP2PRendezvous` | int32 | P2P rendezvous 消息日志 |
| `LogLevelSDRRelayPings` | int32 | 中继 ping 日志 |

### 回调注册（全局配置项）
| 枚举值 | 类型 | 说明 |
|--------|------|------|
| `CallbackConnectionStatusChanged` | Callback | 连接状态变更回调 |
| `CallbackAuthStatusChanged` | Callback | 认证状态变更回调 |
| `CallbackRelayNetworkStatusChanged` | Callback | 中继网络状态变更回调 |
| `CallbackMessagesSessionRequest` | Callback | Messages 会话请求回调 |
| `CallbackMessagesSessionFailed` | Callback | Messages 会话失败回调 |
| `CallbackCreateConnectionSignaling` | Callback | 创建连接信令对象回调 |

### 开发
| 枚举值 | 类型 | 说明 |
|--------|------|------|
| `EnumerateDevVars` | int32 | 是否枚举开发变量（`GetFirstConfigValue` 中） |

---

## `NetworkingConfigDataType` — 配置数据类型

```rust
pub enum NetworkingConfigDataType {
    Int32 = 1,
    Int64 = 2,
    Float = 3,
    String = 4,
    Callback = 5,
}
```

---

## `SendFlags` — 消息发送标志

```rust
pub struct SendFlags: i32 {
    // 使用 bitflags 模式，可组合
}
```

| 常量 | 值 | 说明 |
|------|-----|------|
| `UNRELIABLE` | sys 常量 | 不可靠传输（可丢失/乱序/重复） |
| `NO_NAGLE` | sys 常量 | 禁用 Nagle（立即发送） |
| `NO_DELAY` | sys 常量 | 同 `NO_NAGLE` |
| `UNRELIABLE_NO_NAGLE` | sys 常量 | 不可靠 + 禁用 Nagle |
| `UNRELIABLE_NO_DELAY` | sys 常量 | 不可靠 + 无延迟 |
| `RELIABLE` | sys 常量 | 可靠有序传输 |
| `RELIABLE_NO_NAGLE` | sys 常量 | 可靠但不合并（`RELIABLE \| NO_NAGLE`） |
| `USE_CURRENT_THREAD` | sys 常量 | 在当前线程上同步回调（不通过回调队列） |
| `AUTO_RESTART_BROKEN_SESSION` | sys 常量 | 会话中断时自动重连 |

常用：
```rust
use steamworks::networking_types::SendFlags;
conn.send_message(data, SendFlags::RELIABLE);
conn.send_message(data, SendFlags::UNRELIABLE);
```

---

## `NetworkingAvailability` — P2P 认证状态

```rust
pub enum NetworkingAvailability {
    NeverTried,  // 从未尝试
    Waiting,     // 等待依赖资源（如登录 Steam 获取证书）
    Attempting,  // 正在尝试获取证书
    Current,     // ✅ 就绪，可以使用 P2P
}
```

应用应等待 `Current` 状态后再使用 P2P 功能。

## `NetworkingAvailabilityError` — 认证错误

```rust
pub enum NetworkingAvailabilityError {
    Unknown,      // 内部占位/未初始化
    CannotTry,    // 依赖资源缺失，无法尝试（如无网络、无网络配置）
    Failed,       // 多次尝试失败
    Previously,   // 之前成功但现在失效
    Retrying,     // 失败后重试中
}
```

## `NetworkingAvailabilityResult`

```rust
pub type NetworkingAvailabilityResult = Result<NetworkingAvailability, NetworkingAvailabilityError>;
```

---

## `NetworkingMessage` — 网络消息

```rust
pub struct NetworkingMessage {
    message: *mut SteamNetworkingMessage_t,
    _inner: Arc<Inner>,
}
```

#### 读取消息

| 方法 | 签名 | 说明 |
|------|------|------|
| `data` | `fn data(&self) -> &[u8]` | 消息内容 |
| `size` | `fn size(&self) -> usize` | 消息大小（同 `data().len()`） |
| `message_number` | `fn message_number(&self) -> MessageNumber` | 消息编号 |
| `identity_peer` | `fn identity_peer(&self) -> NetworkingIdentity` | 对端网络身份（发送者/接收者） |
| `connection_user_data` | `fn connection_user_data(&self) -> i64` | 连接用户数据 |
| `send_flags` | `fn send_flags(&self) -> SendFlags` | 发送标志（接收时仅 `RELIABLE` 有效） |
| `channel` | `fn channel(&self) -> i32` | Lane/通道号 |
| `user_data` | `fn user_data(&self) -> i64` | 用户自定义数据 |

#### 设置消息（用于 `send_messages` 发送）

| 方法 | 签名 | 说明 |
|------|------|------|
| `set_connection` | `fn set_connection(&mut self, conn: &NetConnection)` | 设置目标连接 |
| `set_identity_peer` | `fn set_identity_peer(&mut self, identity: NetworkingIdentity)` | 设置对端身份（用于 Messages 接口） |
| `set_channel` | `fn set_channel(&mut self, channel: i32)` | 设置 lane/channel |
| `set_send_flags` | `fn set_send_flags(&mut self, flags: SendFlags)` | 设置发送标志 |
| `set_user_data` | `fn set_user_data(&mut self, user_data: i64)` | 设置用户自定义数据 |
| `set_data` | `fn set_data(&mut self, data: Vec<u8>) -> Result<(), MessageError>` | 设置消息数据（所有权转移） |
| `copy_data_into_buffer` | `fn copy_data_into_buffer(&mut self, data: &[u8]) -> Result<(), MessageError>` | 将数据复制到已分配的缓冲区 |

### `MessageError`

```rust
pub enum MessageError {
    NullBuffer,        // 缓冲区未分配 (m_pData 为 null)
    BufferTooSmall,    // 已分配缓冲区太小
    BufferAlreadySet,  // 缓冲区已设置，不能重复设
}

---

## `MessageNumber`

```rust
pub struct MessageNumber(pub(crate) u64);
```

消息的唯一编号。第一条消息编号为 1。

实现了 `From<MessageNumber> for u64`，可直接转换为 `u64`。

---

## `NetConnectionRealTimeLaneStatus`

```rust
pub struct NetConnectionRealTimeLaneStatus {
    pub(crate) inner: sys::SteamNetConnectionRealTimeLaneStatus_t,
}
```

Lane 级别的实时状态数据。通过 `get_realtime_connection_status` 获取。

| 方法 | 签名 | 说明 |
|------|------|------|
| `pending_unreliable` | `fn pending_unreliable(&self) -> i32` | 此 lane 待发送不可靠数据（bytes） |
| `pending_reliable` | `fn pending_reliable(&self) -> i32` | 此 lane 待发送可靠数据（含重传，bytes） |
| `sent_unacked_reliable` | `fn sent_unacked_reliable(&self) -> i32` | 此 lane 已发送未确认的可靠数据（bytes） |
| `queued_send_bytes` | `fn queued_send_bytes(&self) -> i64` | 此 lane 估计排队时间（微秒） |

---

## `InvalidHandle` / `InvalidConnectionState` / `InvalidEnumValue`

```rust
pub struct InvalidHandle;          // 无效句柄错误
pub struct InvalidConnectionState; // 无效连接状态
pub struct InvalidEnumValue;       // 整数值无法转换为枚举
```

---

## 典型配置组合

### Host 监听配置
```rust
vec![
    NetworkingConfigEntry::new_int32(
        NetworkingConfigValue::TimeoutInitial, 60000
    ),
]
```

### Client 连接配置
```rust
vec![
    NetworkingConfigEntry::new_int32(
        NetworkingConfigValue::P2PTransportICEEnable, 0   // 禁用 ICE
    ),
    NetworkingConfigEntry::new_int32(
        NetworkingConfigValue::TimeoutInitial, 120000     // 初始超时 2 分钟
    ),
    NetworkingConfigEntry::new_int32(
        NetworkingConfigValue::TimeoutConnected, 120000    // 已连接超时 2 分钟
    ),
]
```

### 调试配置
```rust
vec![
    NetworkingConfigEntry::new_float(
        NetworkingConfigValue::FakePacketLossSend, 5.0     // 模拟 5% 丢包
    ),
    NetworkingConfigEntry::new_int32(
        NetworkingConfigValue::FakePacketLagSend, 100      // 模拟 100ms 延迟
    ),
]
```