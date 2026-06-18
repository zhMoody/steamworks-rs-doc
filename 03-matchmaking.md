# 03 - 大厅（Matchmaking）

> steamworks-rs 源码: `matchmaking.rs`

---

## Matchmaking 接口

```rust
/// Access to the steam matchmaking interface
pub struct Matchmaking {
    pub(crate) mm: *mut sys::ISteamMatchmaking,
    pub(crate) inner: Arc<Inner>,
}
```

通过 `client.matchmaking()` 获取。

---

## `LobbyId`

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct LobbyId(pub(crate) u64)
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `from_raw` | `fn from_raw(id: u64) -> LobbyId` | 从 u64 创建 |
| `raw` | `fn raw(&self) -> u64` | 返回原始 u64 |

---

## `LobbyType` — 大厅可见性

```rust
pub enum LobbyType {
    Private,      // 仅邀请
    FriendsOnly,  // 好友可见
    Public,       // 公开
    Invisible,    // 不可见（但可被邀请）
}
```

---

## 大厅生命周期

### `create_lobby`

```rust
pub fn create_lobby<F>(
    &self,
    ty: LobbyType,
    max_members: u32,
    cb: F,
)
where
    F: FnOnce(SteamResult<LobbyId>) + 'static + Send
```

创建大厅。完成后回调 `cb`。

| 参数 | 类型 | 说明 |
|------|------|------|
| `ty` | `LobbyType` | 可见性 |
| `max_members` | `u32` | 最大成员数（≤250） |
| `cb` | `FnOnce(SteamResult<LobbyId>)` | 结果回调 |

触发 Callback: `LobbyEnter`, `LobbyCreated`

### `join_lobby`

```rust
pub fn join_lobby<F>(&self, lobby: LobbyId, cb: F)
where
    F: FnOnce(Result<LobbyId, ()>) + 'static + Send
```

加入大厅。

| 参数 | 类型 | 说明 |
|------|------|------|
| `lobby` | `LobbyId` | 大厅 ID |
| `cb` | `FnOnce(Result<LobbyId, ()>)` | 结果回调 |

### `leave_lobby`

```rust
pub fn leave_lobby(&self, lobby: LobbyId)
```

离开大厅。

### `request_lobby_data`

```rust
pub fn request_lobby_data(&self, lobby: LobbyId) -> bool
```

刷新不在其中的大厅的元数据。对于已加入的大厅不需要调用（数据总是最新的）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `lobby` | `LobbyId` | 目标大厅 |

触发 Callback: `LobbyDataUpdate`

---

## 大厅搜索

### `request_lobby_list`

```rust
pub fn request_lobby_list<F>(&self, cb: F)
where
    F: FnOnce(SteamResult<Vec<LobbyId>>) + 'static + Send
```

请求公开大厅列表。使用前先通过 `set_lobby_list_filter` 设置过滤条件。

| 参数 | 类型 | 说明 |
|------|------|------|
| `cb` | `FnOnce(SteamResult<Vec<LobbyId>>)` | 结果回调 |

### `set_lobby_list_filter`

```rust
pub fn set_lobby_list_filter(&self, filter: LobbyListFilter<'_>) -> &Self
```

设置大厅搜索过滤条件。返回 `&Self` 支持链式调用。

| 参数 | 类型 | 说明 |
|------|------|------|
| `filter` | `LobbyListFilter<'_>` | 过滤条件 |

### 各过滤方法（均返回 `&Self`）

| 方法 | 参数 | 说明 |
|------|------|------|
| `add_request_lobby_list_string_filter` | `StringFilter` | 字符串比较 |
| `add_request_lobby_list_numerical_filter` | `NumberFilter` | 数值比较 |
| `add_request_lobby_list_near_value_filter` | `NearFilter` | 按接近度排序 |
| `set_request_lobby_list_slots_available_filter` | `u8` | 可用空位 |
| `set_request_lobby_list_distance_filter` | `DistanceFilter` | 距离 |
| `set_request_lobby_list_result_count_filter` | `u64` | 最大结果数 |

---

## 大厅数据

### 大厅级数据

| 方法 | 签名 | 说明 |
|------|------|------|
| `lobby_data_count` | `fn lobby_data_count(&self, lobby: LobbyId) -> u32` | 数据键数量 |
| `lobby_data` | `fn lobby_data(&self, lobby: LobbyId, key: &str) -> Option<String>` | 按键读取 |
| `lobby_data_by_index` | `fn lobby_data_by_index(&self, lobby: LobbyId, idx: u32) -> Option<(String, String)>` | 按索引读取 |
| `set_lobby_data` | `fn set_lobby_data(&self, lobby: LobbyId, key: &str, value: &str) -> bool` | 设置数据 |
| `delete_lobby_data` | `fn delete_lobby_data(&self, lobby: LobbyId, key: &str) -> bool` | 删除数据 |

### 成员级数据

| 方法 | 签名 | 说明 |
|------|------|------|
| `set_lobby_member_data` | `fn set_lobby_member_data(&self, lobby: LobbyId, key: &str, value: &str)` | 为本地用户设置数据 |
| `get_lobby_member_data` | `fn get_lobby_member_data(&self, lobby: LobbyId, user: SteamId, key: &str) -> Option<String>` | 获取指定成员的数据 |

---

## 大厅信息

| 方法 | 签名 | 说明 |
|------|------|------|
| `lobby_owner` | `fn lobby_owner(&self, lobby: LobbyId) -> SteamId` | 大厅房主 |
| `lobby_member_count` | `fn lobby_member_count(&self, lobby: LobbyId) -> usize` | 成员数（不需在大厅内） |
| `lobby_member_limit` | `fn lobby_member_limit(&self, lobby: LobbyId) -> Option<usize>` | 成员上限 |
| `lobby_members` | `fn lobby_members(&self, lobby: LobbyId) -> Vec<SteamId>` | 成员列表 |
| `set_lobby_joinable` | `fn set_lobby_joinable(&self, lobby: LobbyId, joinable: bool) -> bool` | 是否允许加入 |
| `set_lobby_game_server` | `fn set_lobby_game_server(&self, lobby: LobbyId, server_addr: SocketAddrV4, server_steam_id: Option<SteamId>) -> ()` | 设置关联游戏服务器 |
| `get_lobby_game_server` | `fn get_lobby_game_server(&self, lobby: LobbyId) -> Option<(SocketAddrV4, Option<SteamId>)>` | 获取关联游戏服务器 |

---

## 大厅聊天

### `send_lobby_chat_message`

```rust
pub fn send_lobby_chat_message(
    &self,
    lobby: LobbyId,
    msg: &[u8],
) -> Result<(), SteamError>
```

广播聊天消息给大厅所有成员（文本或二进制，最大 4KB）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `lobby` | `LobbyId` | 大厅 ID |
| `msg` | `&[u8]` | 消息内容（最大 4KB） |

### `get_lobby_chat_entry`

```rust
pub fn get_lobby_chat_entry<'a>(
    &self,
    lobby: LobbyId,
    chat_id: i32,
    buffer: &'a mut [u8],
) -> &'a [u8]
```

读取聊天消息（收到 `LobbyChatMsg` 回调后调用）。

| 参数 | 类型 | 说明 |
|------|------|------|
| `lobby` | `LobbyId` | 大厅 ID |
| `chat_id` | `i32` | 聊天条目索引（来自回调） |
| `buffer` | `&'a mut [u8]` | 缓冲区（最大 4KB） |

| 返回值 | 说明 |
|--------|------|
| `&'a [u8]` | 实际消息数据的切片 |

---

## 过滤类型

### `LobbyListFilter<'a>`

```rust
pub struct LobbyListFilter<'a> {
    pub string: Option<StringFilters<'a>>,    // 字符串过滤
    pub number: Option<NumberFilters<'a>>,    // 数值过滤
    pub near_value: Option<NearFilters<'a>>,  // 接近度排序
    pub open_slots: Option<u8>,               // 空位
    pub distance: Option<DistanceFilter>,      // 距离
    pub count: Option<u64>,                   // 结果数上限
}
```

### 类型别名
```rust
pub type StringFilters<'a> = Vec<StringFilter<'a>>;
pub type NumberFilters<'a> = Vec<NumberFilter<'a>>;
pub type NearFilters<'a> = Vec<NearFilter<'a>>;
```

### `StringFilter<'a>`

```rust
pub struct StringFilter<'a>(
    pub LobbyKey<'a>,      // 键
    pub &'a str,           // 值
    pub StringFilterKind,  // 比较方式
)
```

### `NumberFilter<'a>`

```rust
pub struct NumberFilter<'a>(
    pub LobbyKey<'a>,       // 键
    pub i32,                // 值
    pub ComparisonFilter,   // 比较方式
)
```

### `NearFilter<'a>`

```rust
pub struct NearFilter<'a>(
    pub LobbyKey<'a>,  // 键
    pub i32,           // 参考值（按接近度排序，不实际过滤）
)
```

### `LobbyKey<'a>`

```rust
pub struct LobbyKey<'a>(pub(crate) &'a str);

impl<'a> LobbyKey<'a> {
    pub fn try_new(key: &'a str) -> Result<Self, LobbyKeyTooLongError>;
    pub fn new(key: &'a str) -> Self;  // panic if > 255 chars
}
```

键名最大 255 字符。

### `StringFilterKind` — 字符串比较方式

```rust
pub enum StringFilterKind {
    EqualToOrLessThan,  // <=
    LessThan,           // <
    Equal,              // ==
    GreaterThan,        // >
    EqualToOrGreaterThan,// >=
    NotEqual,           // !=
}
```

### `ComparisonFilter` — 数值比较方式

```rust
pub enum ComparisonFilter {
    Equal,
    NotEqual,
    GreaterThan,
    GreaterThanEqualTo,
    LessThan,
    LessThanEqualTo,
}
```

### `DistanceFilter` — 距离过滤

```rust
pub enum DistanceFilter {
    Close,      // 近
    Default,    // 默认
    Far,        // 远
    Worldwide,  // 全球
}
```

---

## Callback 事件

### `LobbyCreated`
```rust
pub struct LobbyCreated {
    pub result: SteamResult,  // OK / Error
    pub lobby: LobbyId,        // 创建成功后的大厅 ID（失败为 0）
}
```

### `LobbyEnter`
```rust
pub struct LobbyEnter {
    pub lobby: LobbyId,
    pub chat_permissions: u32,    // 未使用，始终为 0
    pub blocked: bool,            // true = 仅受邀用户可加入
    pub chat_room_enter_response: ChatRoomEnterResponse,
}
```

### `LobbyDataUpdate`
```rust
pub struct LobbyDataUpdate {
    pub lobby: LobbyId,       // 大厅 ID
    pub member: SteamId,      // 变更的成员 ID（=lobby ID 则是大厅本身数据变更）
    pub success: bool,
}
```

### `LobbyChatUpdate`
```rust
pub struct LobbyChatUpdate {
    pub lobby: LobbyId,
    pub user_changed: SteamId,           // 状态变更的用户
    pub making_change: SteamId,          // 发起者（如踢人的管理员）
    pub member_state_change: ChatMemberStateChange,
}
```

### `LobbyChatMsg`
```rust
pub struct LobbyChatMsg {
    pub lobby: LobbyId,
    pub user: SteamId,                  // 发送者
    pub chat_entry_type: ChatEntryType,  // 消息类型
    pub chat_id: i32,                   // 聊天索引（用于 GetLobbyChatEntry）
}
```

### `ChatMemberStateChange` — 成员状态变更

```rust
pub enum ChatMemberStateChange {
    Entered,        // 加入
    Left,           // 离开
    Disconnected,   // 断开连接（非主动离开）
    Kicked,         // 被踢
    Banned,         // 被踢并封禁
}
```

### `ChatEntryType` — 聊天消息类型

```rust
pub enum ChatEntryType {
    Invalid, ChatMsg, Typing, InviteGame, Emote,
    LeftConversation, Entered, WasKicked, WasBanned,
    Disconnected, HistoricalChat, LinkBlocked,
}
```

### `ChatRoomEnterResponse` — 加入结果

```rust
pub enum ChatRoomEnterResponse {
    Success, DoesntExist, NotAllowed, Full, Error, Banned,
    Limited, ClanDisabled, CommunityBan, MemberBlockedYou,
    YouBlockedMember, RatelimitExceeded,
}
```

---

## 常用场景

### 创建大厅
```rust
client.matchmaking().create_lobby(LobbyType::Public, 4, |result| {
    if let Ok(lobby_id) = result {
        println!("大厅创建成功: {}", lobby_id.raw());
    }
});
```

### 搜索并加入大厅
```rust
let mm = client.matchmaking();
mm.set_lobby_list_filter(LobbyListFilter {
    distance: Some(DistanceFilter::Worldwide),
    open_slots: Some(1),
    ..Default::default()
});
mm.request_lobby_list(|lobbies| {
    if let Ok(list) = lobbies {
        if let Some(&lobby) = list.first() {
            mm.join_lobby(lobby, |result| {
                println!("加入结果: {:?}", result);
            });
        }
    }
});
```

### 监听大厅成员变更
```rust
client.register_callback(|update: LobbyChatUpdate| {
    match update.member_state_change {
        ChatMemberStateChange::Entered => println!("有人加入了"),
        ChatMemberStateChange::Left => println!("有人离开了"),
        _ => {}
    }
});
```