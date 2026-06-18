# 02 - 好友 & 用户身份

> steamworks-rs 源码: `friends.rs`, `user.rs`

---

## Friends 接口

```rust
/// Access to the steam friends interface
pub struct Friends {
    pub(crate) friends: *mut sys::ISteamFriends,
    pub(crate) inner: Arc<Inner>,
}
```

通过 `client.friends()` 获取。

---

### 基础方法

#### `name`
```rust
pub fn name(&self) -> String
```
返回当前用户的显示名称。

#### `get_friends`
```rust
pub fn get_friends(&self, flags: FriendFlags) -> Vec<Friend>
```
根据标志位过滤好友列表。

| 参数 | 类型 | 说明 |
|------|------|------|
| `flags` | `FriendFlags` | 过滤标志，如 `FriendFlags::IMMEDIATE` |

| 返回值 | 说明 |
|--------|------|
| `Vec<Friend>` | 符合条件的好友列表 |

#### `get_coplay_friends`
```rust
pub fn get_coplay_friends(&self) -> Vec<Friend>
```
返回"最近一起玩过"的玩家列表。

#### `get_friend`
```rust
pub fn get_friend(&self, friend: SteamId) -> Friend
```
通过 Steam ID 获取单个好友。

| 参数 | 类型 | 说明 |
|------|------|------|
| `friend` | `SteamId` | 好友的 Steam ID |

| 返回值 | 说明 |
|--------|------|
| `Friend` | 好友对象（即使不是好友也返回对象，可通过 Friend 的方法判断状态） |

#### `request_user_information`
```rust
pub fn request_user_information(&self, user: SteamId, name_only: bool) -> bool
```
请求用户信息。异步操作，完成后触发 `PersonaStateChange` 回调。

| 参数 | 类型 | 说明 |
|------|------|------|
| `user` | `SteamId` | 目标用户 |
| `name_only` | `bool` | `true` 只请求姓名 |

| 返回值 | 说明 |
|--------|------|
| `bool` | 请求是否成功发送 |

---

### Rich Presence

#### `set_rich_presence`
```rust
pub fn set_rich_presence(&self, key: &str, value: Option<&str>) -> bool
```
设置当前用户的 Rich Presence。`value` 为 `None` 或空字符串则清除该 key。

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | `&str` | 键名（如 `"connect"`、`"status"`） |
| `value` | `Option<&str>` | 值，`None` 清除 |

#### `clear_rich_presence`
```rust
pub fn clear_rich_presence(&self)
```
清除当前用户的所有 Rich Presence。

---

### Overlay

#### `activate_game_overlay`
```rust
pub fn activate_game_overlay(&self, dialog: &str)
```
激活 Steam 游戏内覆盖层，打开指定对话框（如 `"Friends"`、`"Community"` 等）。

#### `activate_game_overlay_to_web_page`
```rust
pub fn activate_game_overlay_to_web_page(&self, url: &str)
```
在覆盖层中打开网页。

#### `activate_game_overlay_to_store`
```rust
pub fn activate_game_overlay_to_store(&self, app_id: AppId, overlay_to_store_flag: OverlayToStoreFlag)
```
在覆盖层中打开商店页面。

| 参数 | 类型 | 说明 |
|------|------|------|
| `app_id` | `AppId` | 商店页面 App ID |
| `overlay_to_store_flag` | `OverlayToStoreFlag` | `None` / `AddToCart` / `AddToCartAndShow` |

#### `activate_game_overlay_to_user`
```rust
pub fn activate_game_overlay_to_user(&self, dialog: &str, user: SteamId)
```
在覆盖层中打开指定用户对话框。

#### `activate_invite_dialog`
```rust
pub fn activate_invite_dialog(&self, lobby: LobbyId)
```
打开邀请对话框，邀请好友加入指定大厅。

| 参数 | 类型 | 说明 |
|------|------|------|
| `lobby` | `LobbyId` | 大厅 ID |

#### `activate_invite_dialog_connect_string`
```rust
pub fn activate_invite_dialog_connect_string(&self, connect: &str)
```
打开邀请对话框，发送 Rich Presence connect 字符串给好友。

---

## Friend 对象

```rust
pub struct Friend {
    id: SteamId,
    friends: *mut sys::ISteamFriends,
    _inner: Arc<Inner>,
}
```

### 方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `id` | `fn id(&self) -> SteamId` | Steam ID |
| `name` | `fn name(&self) -> String` | 显示名称 |
| `nick_name` | `fn nick_name(&self) -> Option<String>` | 当前用户给此人设置的昵称 |
| `state` | `fn state(&self) -> FriendState` | 在线状态 |
| `game_played` | `fn game_played(&self) -> Option<FriendGame>` | 正在玩的游戏信息 |
| `coplay_game_played` | `fn coplay_game_played(&self) -> AppId` | 最近一起玩过的游戏 App ID |
| `coplay_time` | `fn coplay_time(&self) -> i32` | 最近一起玩的时间戳 |
| `small_avatar` | `fn small_avatar(&self) -> Option<Vec<u8>>` | 32x32 RGBA 头像 |
| `medium_avatar` | `fn medium_avatar(&self) -> Option<Vec<u8>>` | 64x64 RGBA 头像 |
| `large_avatar` | `fn large_avatar(&self) -> Option<Vec<u8>>` | 184x184 RGBA 头像 |
| `has_friend` | `fn has_friend(&self, flags: FriendFlags) -> bool` | 检查是否满足指定标志 |
| `invite_user_to_game` | `fn invite_user_to_game(&self, connect_string: &str)` | 邀请用户加入游戏 |
| `set_played_with` | `fn set_played_with(&self)` | 标记为"一起玩过的玩家" |
| `rich_presence` | `fn rich_presence(&self, key: &str) -> Option<String>` | 获取好友的 Rich Presence 值 |

---

## `FriendState` — 在线状态

```rust
pub enum FriendState {
    Offline,         // 离线
    Online,          // 在线
    Invisible,       // 隐身
    Busy,            // 忙碌
    Away,            // 离开
    Snooze,          // 休眠
    LookingToTrade,  // 想交易
    LookingToPlay,   // 想玩
}
```

---

## `FriendFlags` — 好友过滤标志

```rust
pub struct FriendFlags: u16 {
    const NONE                  = 0x0000;
    const BLOCKED               = 0x0001;  // 已屏蔽
    const FRIENDSHIP_REQUESTED  = 0x0002;  // 已发送好友请求
    const IMMEDIATE             = 0x0004;  // 立即/常规好友
    const CLAN_MEMBER           = 0x0008;  // 同组成员
    const ON_GAME_SERVER        = 0x0010;  // 同一游戏服务器
    const REQUESTING_FRIENDSHIP = 0x0080;  // 对方请求加好友
    const REQUESTING_INFO       = 0x0100;  // 正在请求信息
    const IGNORED               = 0x0200;  // 已忽略
    const IGNORED_FRIEND        = 0x0400;  // 已忽略（仍是好友）
    const CHAT_MEMBER           = 0x1000;  // 同一聊天
    const ALL                   = 0xFFFF;  // 所有
}
```

位标志，可组合：`FriendFlags::IMMEDIATE | FriendFlags::CLAN_MEMBER`

---

## `FriendGame` — 好友游戏信息

```rust
pub struct FriendGame {
    pub game: GameId,          // 游戏 ID
    pub game_address: Ipv4Addr,// 服务器 IPv4 地址
    pub game_port: u16,        // 服务器端口
    pub query_port: u16,       // 查询端口
    pub lobby: LobbyId,        // 所在大厅 ID（可选）
}
```

---

## `PersonaChange` — 状态变更标志

```rust
pub struct PersonaChange: i32 {
    const NAME           = 0x0001;  // 姓名变更
    const STATUS         = 0x0002;  // 状态变更
    const COME_ONLINE    = 0x0004;  // 上线
    const GONE_OFFLINE   = 0x0008;  // 下线
    const GAME_PLAYED    = 0x0010;  // 开始玩游戏
    const GAME_SERVER    = 0x0020;  // 游戏服务器变更
    const AVATAR         = 0x0040;  // 头像变更
    const JOINED_SOURCE  = 0x0080;
    const LEFT_SOURCE    = 0x0100;
    const RELATIONSHIP_CHANGE = 0x0200;
    const NAME_FIRST_SET = 0x0400;
    const FACEBOOK_INFO  = 0x0800;  // Facebook 信息变更
    const NICKNAME       = 0x1000;  // 昵称变更
    const STEAM_LEVEL    = 0x2000;  // Steam 等级变更
}
```

---

## Overlay 相关枚举

### `OverlayToStoreFlag`
```rust
pub enum OverlayToStoreFlag {
    None = 0,
    AddToCart = 1,
    AddToCartAndShow = 2,
}
```

---

## Callback 事件（可注册监听）

### `PersonaStateChange`
```rust
pub struct PersonaStateChange {
    pub steam_id: SteamId,
    pub flags: PersonaChange,
}
```
好友状态变更时触发。

### `GameOverlayActivated`
```rust
pub struct GameOverlayActivated {
    pub active: bool,
}
```
覆盖层激活/取消时触发。

### `GameLobbyJoinRequested`
```rust
pub struct GameLobbyJoinRequested {
    pub lobby_steam_id: LobbyId,
    pub friend_steam_id: SteamId,
}
```
Steam 好友通过大厅邀请加入时触发（弹出对话框方式）。

### `GameRichPresenceJoinRequested`
```rust
pub struct GameRichPresenceJoinRequested {
    pub friend_steam_id: SteamId,  // 邀请者 SteamId，非好友则为 invalid
    pub connect: String,           // connect 字符串（自定义数据）
}
```
好友通过 Rich Presence "加入游戏" 时触发。

---

## User 接口

```rust
/// Access to the steam user interface
pub struct User {
    pub(crate) user: *mut sys::ISteamUser,
    pub(crate) _inner: Arc<Inner>,
}
```

通过 `client.user()` 获取。

### 基础方法

| 方法 | 签名 | 说明 |
|------|------|------|
| `steam_id` | `fn steam_id(&self) -> SteamId` | 当前用户 Steam ID |
| `level` | `fn level(&self) -> u32` | Steam 等级 |
| `logged_on` | `fn logged_on(&self) -> bool` | Steam 客户端是否已连接到 Steam 服务器 |

---

### 认证票据

#### `authentication_session_ticket`
```rust
pub fn authentication_session_ticket(
    &self,
    network_identity: NetworkingIdentity,
) -> (AuthTicket, Vec<u8>)
```
生成 P2P 认证票据。返回票据句柄和票据数据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `network_identity` | `NetworkingIdentity` | 对端网络身份 |

| 返回值 | 说明 |
|--------|------|
| `(AuthTicket, Vec<u8>)` | `(票据句柄, 票据字节数据)` |

#### `authentication_session_ticket_with_steam_id`
```rust
pub fn authentication_session_ticket_with_steam_id(
    &self,
    steam_id: SteamId,
) -> (AuthTicket, Vec<u8>)
```
同上，直接用 Steam ID 指定对端。

#### `cancel_authentication_ticket`
```rust
pub fn cancel_authentication_ticket(&self, ticket: AuthTicket)
```
取消认证票据。联机结束时调用。

#### `begin_authentication_session`
```rust
pub fn begin_authentication_session(
    &self,
    user: SteamId,
    ticket: &[u8],
) -> Result<(), AuthSessionError>
```
验证对端发来的票据。

| 参数 | 类型 | 说明 |
|------|------|------|
| `user` | `SteamId` | 对端 Steam ID |
| `ticket` | `&[u8]` | 对端发来的票据数据 |

| 返回值 | 说明 |
|--------|------|
| `Result<(), AuthSessionError>` | 验证结果 |

#### `end_authentication_session`
```rust
pub fn end_authentication_session(&self, user: SteamId)
```
结束认证会话。

#### `authentication_session_ticket_for_webapi`
```rust
pub fn authentication_session_ticket_for_webapi(&self, identity: &str) -> AuthTicket
```
生成 Web API 认证票据。需等待 `TicketForWebApiResponse` 回调。

#### `user_has_license_for_app`
```rust
pub fn user_has_license_for_app(&self, user: SteamId, app_id: AppId) -> UserHasLicense
```
检查用户是否拥有指定 App 的许可。

---

### `UserHasLicense` 结果

```rust
pub enum UserHasLicense {
    HasLicense,        // 有许可
    DoesNotHaveLicense,// 无许可
    NoAuth,            // 未认证
}
```

---

### Auth 错误类型

#### `AuthSessionError`
```rust
pub enum AuthSessionError {
    InvalidTicket,        // 无效票据
    DuplicateRequest,     // 重复请求
    InvalidVersion,       // 接口版本不兼容
    GameMismatch,         // 游戏不匹配
    ExpiredTicket,        // 票据过期
}
```

#### `AuthSessionValidateError`
```rust
pub enum AuthSessionValidateError {
    UserNotConnectedToSteam,            // 用户未连接 Steam
    NoLicenseOrExpired,                 // 许可过期
    VACBanned,                          // VAC 封禁
    LoggedInElseWhere,                  // 在其他地方登录
    VACCheckTimedOut,                   // VAC 检测超时
    AuthTicketCancelled,                // 票据已取消
    AuthTicketInvalidAlreadyUsed,       // 票据已使用
    AuthTicketInvalid,                  // 票据无效
    PublisherIssuedBan,                 // 被发行商封禁
    AuthTicketNetworkIdentityFailure,   // 网络身份不匹配
}
```

---

### Auth 相关 Callback

#### `AuthSessionTicketResponse`
```rust
pub struct AuthSessionTicketResponse {
    pub ticket: AuthTicket,
    pub result: SteamResult,
}
```
票据生成结果。

#### `TicketForWebApiResponse`
```rust
pub struct TicketForWebApiResponse {
    pub ticket_handle: AuthTicket,
    pub result: SteamResult,
    pub ticket_len: i32,
    pub ticket: Vec<u8>,
}
```
Web API 票据生成结果。

#### `ValidateAuthTicketResponse`
```rust
pub struct ValidateAuthTicketResponse {
    pub steam_id: SteamId,
    pub response: Result<(), AuthSessionValidateError>,
    pub owner_steam_id: SteamId,  // 游戏拥有者 Steam ID（可能是借用的游戏）
}
```
票据验证结果。

---

### 连接状态 Callback

```rust
pub struct SteamServersConnected;       // 已连接到 Steam
pub struct SteamServersDisconnected {   // 断开连接
    pub reason: SteamResult,
}
pub struct SteamServerConnectFailure {  // 连接失败
    pub reason: SteamResult,
    pub still_retrying: bool,
}
```

### `MicroTxnAuthorizationResponse`
```rust
pub struct MicroTxnAuthorizationResponse {
    pub app_id: AppId,
    pub order_id: u64,
    pub authorized: bool,
}
```
微交易授权响应。

---

## 常用场景

### 获取好友列表
```rust
let friends = client.friends().get_friends(FriendFlags::IMMEDIATE);
for friend in &friends {
    println!("{} - {:?}", friend.name(), friend.state());
}
```

### 设置 Rich Presence
```rust
client.friends().set_rich_presence("connect", Some("+connect_lobby_12345"));
client.friends().set_rich_presence("status", Some("In Lobby"));
```

### 监听大厅邀请
```rust
client.register_callback(|invite: GameLobbyJoinRequested| {
    println!("收到邀请: 大厅={}", invite.lobby_steam_id.raw());
});
```

### 监听 Rich Presence 加入
```rust
client.register_callback(|join: GameRichPresenceJoinRequested| {
    println!("好友加入: connect_str={}", join.connect);
});
```