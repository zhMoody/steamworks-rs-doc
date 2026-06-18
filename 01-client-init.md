# 01 - Client 初始化 & 基础类型

> steamworks-rs (zhMoody fork, `raw-bindings` feature)
> 源码: `lib.rs`

---

## 函数

### `restart_app_if_necessary`

```rust
pub fn restart_app_if_necessary(app_id: AppId) -> bool
```

如果应用不是通过 Steam 启动的，返回 `true` 并尝试通过 Steam 重新启动。应用应尽快退出。如果通过 Steam 启动或存在 `steam_appid.txt`，返回 `false`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `app_id` | `AppId` | 应用 ID |

| 返回值 | 说明 |
|--------|------|
| `bool` | `true` = 需要重启，`false` = 启动方式正确 |

---

## Client

```rust
pub struct Client { inner: Arc<Inner> }
```

Steam 客户端入口，提供所有 Steamworks API 接口的访问器。

### `Client::init`

```rust
pub fn init() -> Result<Client, SteamAPIInitError>
```

通过 `SteamAPI_InitFlat`（SDK 1.59+）初始化，自动检测 App ID。

| 返回值 | 说明 |
|--------|------|
| `Result<Client, SteamAPIInitError>` | 成功返回 Client 实例 |

失败原因：
- Steam 客户端未运行
- 无法确定 App ID（需 `steam_appid.txt` 或通过 Steam 启动）
- Steam 客户端用户/权限不匹配
- 用户没有该游戏的许可
- App ID 未完全配置

### `Client::init_app`

```rust
pub fn init_app<ID: Into<AppId>>(app_id: ID) -> Result<Client, SteamAPIInitError>
```

指定 App ID 初始化（例如 `Client::init_app(480)` 用于 Spacewar）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `app_id` | `impl Into<AppId>` | 如 `480u32` |

| 返回值 | 说明 |
|--------|------|
| `Result<Client, SteamAPIInitError>` | 成功返回 Client 实例 |

### `Client::run_callbacks`

```rust
pub fn run_callbacks(&self)
```

在当前线程上运行所有待处理的回调。应频繁调用（如每帧一次）以降低事件延迟。

### `Client::process_callbacks`

```rust
pub fn process_callbacks(&self, callback_handler: impl FnMut(CallbackResult))
```

与 `run_callbacks` 相同，但为每个回调调用 `callback_handler`。适用于回调处理器不能是 `Send` + `'static` 的场景。

| 参数 | 类型 | 说明 |
|------|------|------|
| `callback_handler` | `impl FnMut(CallbackResult)` | 每个回调都会被传入此闭包 |

### `Client::register_callback`

```rust
pub fn register_callback<C, F>(&self, f: F) -> CallbackHandle
where
    C: Callback,
    F: FnMut(C) + 'static + Send
```

注册回调函数，当事件到达时在 `run_callbacks` / `process_callbacks` 所在线程执行。

| 参数 | 类型 | 说明 |
|------|------|------|
| `f` | `FnMut(C) + 'static + Send` | 回调闭包 |

| 返回值 | 说明 |
|--------|------|
| `CallbackHandle` | 回调句柄（超出作用域时自动取消注册） |

### Client 接口访问器

| 方法 | 返回类型 | 说明 |
|------|----------|------|
| `client.utils()` | `Utils` | Steam 工具接口 |
| `client.matchmaking()` | `Matchmaking` | 匹配/大厅接口 |
| `client.matchmaking_servers()` | `MatchmakingServers` | 服务器浏览器接口 |
| `client.networking()` | `Networking` | 网络接口 |
| `client.networking_sockets()` | `NetworkingSockets` | **核心** - P2P 连接接口 |
| `client.networking_messages()` | `NetworkingMessages` | 网络消息接口 |
| `client.networking_utils()` | `NetworkingUtils` | 网络工具接口 |
| `client.apps()` | `Apps` | 应用信息接口 |
| `client.friends()` | `Friends` | 好友接口 |
| `client.input()` | `Input` | 输入设备接口 |
| `client.user()` | `User` | 用户身份接口 |
| `client.user_stats()` | `UserStats` | 用户统计/成就接口 |
| `client.remote_play()` | `RemotePlay` | 远程畅玩接口 |
| `client.remote_storage()` | `RemoteStorage` | 云存档接口 |
| `client.screenshots()` | `Screenshots` | 截图接口 |
| `client.ugc()` | `UGC` | 创意工坊接口 |
| `client.timeline()` | `Timeline` | 时间线接口 |

---

## 基础类型

### `SteamId`

```rust
#[derive(Clone, Copy, Debug, Ord, PartialOrd, Eq, PartialEq, Hash)]
pub struct SteamId(pub(crate) u64)
```

用户的 Steam ID。

| 方法 | 签名 | 说明 |
|------|------|------|
| `from_raw` | `fn from_raw(id: u64) -> SteamId` | 从原始 u64 创建 |
| `raw` | `fn raw(&self) -> u64` | 返回原始 u64 值 |
| `is_invalid` | `fn is_invalid(&self) -> bool` | 是否为无效 Steam ID |
| `account_id` | `fn account_id(&self) -> AccountId` | 获取账户 ID |
| `universe` | `fn universe(&self) -> Universe` | 获取所属 Universe |
| `account_type` | `fn account_type(&self) -> AccountType` | 获取账户类型 |
| `steamid32` | `fn steamid32(&self) -> String` | 格式化为 `STEAM_0:X:XXXXXX` 字符串 |

### `AccountId`

```rust
#[derive(Clone, Copy, Debug, Ord, PartialOrd, Eq, PartialEq, Hash)]
pub struct AccountId(pub(crate) u32)
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `from_raw` | `fn from_raw(id: u32) -> AccountId` | 从原始 u32 创建 |
| `raw` | `fn raw(&self) -> u32` | 返回原始 u32 值 |

### `AppId`

```rust
pub struct AppId(pub u32)
```

Steam 应用 ID。实现 `From<u32>`，可直接用 `480u32`。

### `GameId`

```rust
pub struct GameId(pub(crate) u64)
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `from_raw` | `fn from_raw(id: u64) -> GameId` | 从原始 u64 创建 |
| `raw` | `fn raw(&self) -> u64` | 返回原始 u64 值 |
| `app_id` | `fn app_id(&self) -> AppId` | 获取其中的 App ID |

### `Universe`

```rust
#[repr(u32)]
pub enum Universe {
    Invalid = 0,
    Public = 1,
    Beta = 2,
    Internal = 3,
    Dev = 4,
}
```

Steam Universe（每个 Universe 是一个独立的 Steam 实例）。

### `AccountType`

```rust
#[repr(u32)]
pub enum AccountType {
    Invalid = 0,
    Individual = 1,    // 个人用户
    Multiseat = 2,     // 网吧多座
    GameServer = 3,    // 游戏服务器
    AnonGameServer = 4,// 匿名游戏服务器
    Pending = 5,       // 待定
    ContentServer = 6, // 内容服务器
    Clan = 7,          // 组
    Chat = 8,          // 聊天
    ConsoleUser = 9,   // 主机用户
    AnonUser = 10,     // 匿名用户
}
```

---

## 错误类型

### `SteamError`

通用的 Steam 错误类型。

### `SteamResult`

```rust
pub type SteamResult<T = ()> = Result<T, SteamError>
```

### `SteamAPIInitError`

初始化错误，包含错误信息和 Steam 返回的消息。

---

## 条件导出（raw-bindings feature）

启用 `raw-bindings` feature 后，`steamworks_sys` crate 被重新导出为 `steamworks::sys`：

```rust
pub use steamworks_sys as sys;
```

可直接通过 `steamworks::sys::*` 访问底层 C API。`steamworks_sys` 是 `steamworks-rs` 的 `steamworks-sys` 子 crate，包含 Steam SDK 原始 C API 的 Rust bindings（通过 `bindgen` 自动生成，约 28000+ 行）。

### 常用 sys 类型

这些类型在 safe wrapper 中直接使用，当 safe API 不够时需要直接使用 sys：

| sys 类型 | 原始类型 | 说明 |
|----------|----------|------|
| `sys::HSteamNetConnection` | `u32` | 网络连接句柄 |
| `sys::HSteamListenSocket` | `u32` | 网络监听套接字句柄 |
| `sys::HSteamNetPollGroup` | `u32` | 轮询组句柄 |
| `sys::SteamAPICall_t` | `u64` | Steam API 异步调用句柄 |
| `sys::HAuthTicket` | `u32` | 认证票据句柄 |
| `sys::ScreenshotHandle` | `u32` | 截图句柄（直接 pub use 导出） |
| `sys::InputHandle_t` | `u64` | 输入设备句柄 |
| `sys::InputActionSetHandle_t` | `u64` | 动作集句柄 |
| `sys::InputDigitalActionHandle_t` | `u64` | 数字动作句柄 |
| `sys::InputAnalogActionHandle_t` | `u64` | 模拟动作句柄 |
| `sys::InputDigitalActionData_t` | struct | 数字动作数据（从 sys 直接使用） |
| `sys::InputAnalogActionData_t` | struct | 模拟动作数据（从 sys 直接使用） |
| `sys::InputMotionData_t` | struct | 陀螺仪数据（从 sys 直接使用） |
| `sys::EInputActionOrigin` | enum | 输入来源枚举 |

### 常用 sys 常量

| 常量 | 说明 |
|------|------|
| `sys::STEAM_INPUT_MAX_COUNT` | 最大输入设备数（16） |
| `sys::STEAM_INPUT_MAX_ORIGINS` | 最大输入来源数 |
| `sys::k_HSteamListenSocket_Invalid` | 无效监听套接字 |
| `sys::k_HSteamNetConnection_Invalid` | 无效连接句柄 |
| `sys::k_HSteamNetPollGroup_Invalid` | 无效轮询组 |
| `sys::INVALID_SCREENSHOT_HANDLE` | 无效截图句柄 |
| `sys::STEAMGAMESERVER_QUERY_PORT_SHARED` | 服务器查询端口共享标志 |
| `sys::k_nMaxLobbyKeyLength` | 大厅 key 最大长度（255） |
| `sys::k_cubChatMetadataMax` | 大厅聊天元数据最大值 |

### 常用 sys 配置值

当 safe wrapper 的 `NetworkingConfigValue` 不够用时，可以直接使用 sys 中的 `ESteamNetworkingConfigValue` 枚举：

```rust
use steamworks::sys::ESteamNetworkingConfigValue;
// 例如：
let config = NetworkingConfigEntry::new_int32(
    // 可直接用 sys 枚举值代替 NetworkingConfigValue
    ...
);
```

### sys 接口函数

safe wrapper 已封装了所有常用函数，但在某些高级场景可直接调用底层函数：

```rust
// 获取特定版本接口（通常不需要，safe wrapper 已处理）
steamworks::sys::SteamAPI_SteamNetworkingSockets_SteamAPI_v012()
steamworks::sys::SteamAPI_SteamNetworkingUtils_SteamAPI_v004()

// 手动调用底层 C API（示例）
steamworks::sys::SteamAPI_ISteamNetworkingSockets_AcceptConnection(sockets, connection_handle);
```