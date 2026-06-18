# 07 - 其他模块

> steamworks-rs 源码: `app.rs`, `utils.rs`, `input.rs`, `screenshots.rs`, `remote_storage.rs`, `remote_play.rs`,
`timeline.rs`, `server.rs`, `matchmaking_servers.rs`

---

## Apps

```rust
pub struct Apps { /* private fields */ }
```

通过 `client.apps()` 获取。

| 方法                                | 签名                                                             | 说明                      |
|-----------------------------------|----------------------------------------------------------------|-------------------------|
| `is_subscribed`                   | `fn is_subscribed(&self) -> bool`                              | 是否拥有当前游戏                |
| `is_subscribed_from_free_weekend` | `fn is_subscribed_from_free_weekend(&self) -> bool`            | 是否通过免费周末订阅              |
| `is_low_violence`                 | `fn is_low_violence(&self) -> bool`                            | 低暴力版本                   |
| `is_cybercafe`                    | `fn is_cybercafe(&self) -> bool`                               | 网吧授权                    |
| `is_vac_banned`                   | `fn is_vac_banned(&self) -> bool`                              | VAC 封禁                  |
| `current_game_language`           | `fn current_game_language(&self) -> String`                    | 游戏语言                    |
| `available_game_languages`        | `fn available_game_languages(&self) -> String`                 | 可用语言                    |
| `app_owner`                       | `fn app_owner(&self) -> SteamId`                               | 拥有者                     |
| `app_install_dir`                 | `fn app_install_dir(&self, app_id: AppId) -> String`           | 安装目录                    |
| `is_app_installed`                | `fn is_app_installed(&self, app_id: AppId) -> bool`            | 是否安装                    |
| `app_build_id`                    | `fn app_build_id(&self) -> i32`                                | 构建 ID                   |
| `is_subscribed_app`               | `fn is_subscribed_app(&self, app_id: AppId) -> bool`           | 拥有指定 App                |
| `is_dlc_installed`                | `fn is_dlc_installed(&self, app_id: AppId) -> bool`            | DLC 安装                  |
| `dlc_installed_time`              | `fn dlc_installed_time(&self, app_id: AppId) -> u32`           | DLC 时间                  |
| `dlc_for_current_game`            | `fn dlc_for_current_game(&self) -> Vec<AppId>`                 | 所有 DLC                  |
| `dlc_download_progress`           | `fn dlc_download_progress(&self, app_id: AppId) -> (u64, u64)` | 下载进度                    |
| `current_beta_name`               | `fn current_beta_name(&self) -> Option<String>`                | Beta 分支                 |
| `launch_command_line`             | `fn launch_command_line(&self) -> String`                      | 启动命令行（通过 Steam URL 启动时） |
| `launch_query_param`              | `fn launch_query_param(&self, key: &str) -> String`            | 启动参数                    |
| `is_timed_trial`                  | `fn is_timed_trial(&self) -> (bool, u32)`                      | 限时试玩                    |

### Callbacks

```rust
pub struct NewUrlLaunchParameters;  // 通过 Steam URL 带参数启动时触发
```

---

## Utils

```rust
pub struct Utils { /* private fields */ }
```

通过 `client.utils()` 获取。

### 方法

| 方法                                  | 签名                                                                                         | 说明           |
|-------------------------------------|--------------------------------------------------------------------------------------------|--------------|
| `app_id`                            | `fn app_id(&self) -> AppId`                                                                | 应用 ID        |
| `ip_country`                        | `fn ip_country(&self) -> String`                                                           | IP 国家        |
| `is_overlay_enabled`                | `fn is_overlay_enabled(&self) -> bool`                                                     | 覆盖层启用        |
| `ui_language`                       | `fn ui_language(&self) -> String`                                                          | Steam 客户端语言  |
| `get_server_real_time`              | `fn get_server_real_time(&self) -> u32`                                                    | 服务器 Unix 时间戳 |
| `is_steam_in_big_picture_mode`      | `fn is_steam_in_big_picture_mode(&self) -> bool`                                           | 大屏幕模式        |
| `is_steam_running_on_steam_deck`    | `fn is_steam_running_on_steam_deck(&self) -> bool`                                         | Steam Deck   |
| `set_overlay_notification_position` | `fn set_overlay_notification_position(&self, position: NotificationPosition)`              | 通知位置         |
| `set_warning_callback`              | `fn set_warning_callback<F>(&self, cb: F) where F: Fn(i32, &CStr) + Send + Sync + 'static` | 警告回调         |

```rust
pub enum NotificationPosition { TopLeft, TopRight, BottomLeft, BottomRight }
```

### 手柄文本输入

```rust
pub enum GamepadTextInputMode { Normal, Password }
pub enum GamepadTextInputLineMode { SingleLine, MultipleLines }
pub enum FloatingGamepadTextInputMode { SingleLine, MultipleLines, Email, Numeric }

pub struct GamepadTextInputDismissed {
    pub submitted_text_len: Option<u32>,
}
pub struct FloatingGamepadTextInputDismissed;
```

| 方法                                 | 签名                                                                                                                                                                                                                                                                           |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `show_gamepad_text_input`          | `fn show_gamepad_text_input<F>(&self, input_mode: GamepadTextInputMode, input_line_mode: GamepadTextInputLineMode, description: &str, max_characters: u32, existing_text: Option<&str>, dismissed_cb: F) -> bool where F: FnMut(GamepadTextInputDismissed) + 'static + Send` |
| `show_floating_gamepad_text_input` | `fn show_floating_gamepad_text_input<F>(&self, keyboard_mode: FloatingGamepadTextInputMode, x: i32, y: i32, width: i32, height: i32, dismissed_cb: F) -> bool where F: FnMut() + 'static + Send`                                                                             |
| `get_entered_gamepad_text_input`   | `fn get_entered_gamepad_text_input(&self, dismissed_data: &GamepadTextInputDismissed) -> Option<String>`                                                                                                                                                                     |

---

## Input

> **注意**: 所有 handle/data 类型均直接使用 `steamworks_sys` 原始类型（`InputHandle_t`, `InputDigitalActionData_t` 等）。

```rust
pub struct Input { /* private fields */ }
pub enum InputType {
    Unknown, SteamController, XBox360Controller, XBoxOneController,
    GenericGamepad, PS4Controller, AppleMFiController, AndroidController,
    SwitchJoyConPair, SwitchJoyConSingle, SwitchProController, MobileTouch,
    PS3Controller, PS5Controller, SteamDeckController,
}
```

通过 `client.input()` 获取。

| 方法                                    | 签名                                                                                                                                                                                           | 说明                 |
|---------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------|
| `init`                                | `fn init(&self, explicitly_call_run_frame: bool) -> bool`                                                                                                                                    | 初始化                |
| `shutdown`                            | `fn shutdown(&self)`                                                                                                                                                                         | 关闭                 |
| `run_frame`                           | `fn run_frame(&self)`                                                                                                                                                                        | 每帧同步               |
| `get_connected_controllers`           | `fn get_connected_controllers(&self) -> Vec<InputHandle_t>`                                                                                                                                  | 已连接控制器             |
| `get_connected_controllers_slice`     | `fn get_connected_controllers_slice(&self, controllers: impl AsMut<[InputHandle_t]>) -> usize`                                                                                               | 无分配版本              |
| `set_input_action_manifest_file_path` | `fn set_input_action_manifest_file_path(&self, path: &str) -> bool`                                                                                                                          | 加载 Action Manifest |
| `get_input_type_for_handle`           | `fn get_input_type_for_handle(&self, input_handle: InputHandle_t) -> InputType`                                                                                                              | 控制器类型              |
| `get_action_set_handle`               | `fn get_action_set_handle(&self, action_set_name: &str) -> InputActionSetHandle_t`                                                                                                           | 动作集句柄              |
| `activate_action_set_handle`          | `fn activate_action_set_handle(&self, input_handle: InputHandle_t, action_set_handle: InputActionSetHandle_t)`                                                                               | 激活动作集              |
| `get_digital_action_handle`           | `fn get_digital_action_handle(&self, action_name: &str) -> InputDigitalActionHandle_t`                                                                                                       | 数字动作句柄             |
| `get_analog_action_handle`            | `fn get_analog_action_handle(&self, action_name: &str) -> InputAnalogActionHandle_t`                                                                                                         | 模拟动作句柄             |
| `get_digital_action_data`             | `fn get_digital_action_data(&self, input_handle: InputHandle_t, action_handle: InputDigitalActionHandle_t) -> InputDigitalActionData_t`                                                      | 数字动作数据             |
| `get_analog_action_data`              | `fn get_analog_action_data(&self, input_handle: InputHandle_t, action_handle: InputAnalogActionHandle_t) -> InputAnalogActionData_t`                                                         | 模拟动作数据             |
| `get_digital_action_origins`          | `fn get_digital_action_origins(&self, input_handle: InputHandle_t, action_set_handle: InputActionSetHandle_t, digital_action_handle: InputDigitalActionHandle_t) -> Vec<EInputActionOrigin>` | 数字动作来源             |
| `get_analog_action_origins`           | `fn get_analog_action_origins(&self, input_handle: InputHandle_t, action_set_handle: InputActionSetHandle_t, analog_action_handle: InputAnalogActionHandle_t) -> Vec<EInputActionOrigin>`    | 模拟动作来源             |
| `get_motion_data`                     | `fn get_motion_data(&self, input_handle: InputHandle_t) -> InputMotionData_t`                                                                                                                | 陀螺仪                |
| `get_glyph_for_action_origin`         | `fn get_glyph_for_action_origin(&self, action_origin: EInputActionOrigin) -> String`                                                                                                         | 图标路径               |
| `get_string_for_action_origin`        | `fn get_string_for_action_origin(&self, action_origin: EInputActionOrigin) -> String`                                                                                                        | 按键名称               |
| `show_binding_panel`                  | `fn show_binding_panel(&self, input_handle: InputHandle_t) -> bool`                                                                                                                          | 按键绑定               |

---

## Remote Storage（云存档）

```rust
pub struct RemoteStorage { /* private fields */ }
```

通过 `client.remote_storage()` 获取。

### 方法

| 方法                             | 签名                                                   | 说明        |
|--------------------------------|------------------------------------------------------|-----------|
| `set_cloud_enabled_for_app`    | `fn set_cloud_enabled_for_app(&self, enabled: bool)` | 开关云存档     |
| `is_cloud_enabled_for_app`     | `fn is_cloud_enabled_for_app(&self) -> bool`         | App 云存档启用 |
| `is_cloud_enabled_for_account` | `fn is_cloud_enabled_for_account(&self) -> bool`     | 账户云存档启用   |
| `files`                        | `fn files(&self) -> Vec<SteamFileInfo>`              | 文件列表      |
| `file`                         | `fn file(&self, name: &str) -> SteamFile`            | 文件句柄      |

### `SteamFile` — 文件句柄

| 方法                   | 签名                                                                           | 说明                     |
|----------------------|------------------------------------------------------------------------------|------------------------|
| `delete`             | `fn delete(&self) -> bool`                                                   | 删除本地+远程                |
| `forget`             | `fn forget(&self) -> bool`                                                   | 仅删除远程                  |
| `exists`             | `fn exists(&self) -> bool`                                                   | 是否存在                   |
| `is_persisted`       | `fn is_persisted(&self) -> bool`                                             | 已持久化                   |
| `timestamp`          | `fn timestamp(&self) -> i64`                                                 | 时间戳                    |
| `set_sync_platforms` | `fn set_sync_platforms(&self, platforms: RemoteStoragePlatforms)`            | 同步平台                   |
| `get_sync_platforms` | `fn get_sync_platforms(&self) -> RemoteStoragePlatforms`                     | 获取平台                   |
| `write`              | `fn write(self) -> SteamFileWriter`                                          | 写 (`impl Write`)       |
| `read`               | `fn read(self) -> SteamFileReader`                                           | 读 (`impl Read + Seek`) |
| `share`              | `fn share(&self, cb: impl FnOnce(Result<u64, SteamError>) + 'static + Send)` | 分享                     |

### `RemoteStoragePlatforms` (bitflags)

```rust
pub struct RemoteStoragePlatforms: u32 {
    const WINDOWS, MACOS, PS3, LINUX, SWITCH, ANDROID, IOS;
}
```

### `SteamFileInfo`

```rust
pub struct SteamFileInfo { pub name: String, pub size: u64 }
```

### `PublishedFileVisibility`

```rust
pub enum PublishedFileVisibility {
    Public,       // 公开
    FriendsOnly,  // 仅好友
    Private,      // 私有
    Unlisted,     // 不列出
}
```

### 使用示例

```rust
let rs = client.remote_storage();

// 写
let mut w = rs.file("save.dat").write();
w.write_all(b"hello").unwrap();  // drop 时自动关闭

// 读
let mut data = String::new();
rs.file("save.dat").read().read_to_string(&mut data).unwrap();

// 列表
for f in rs.files() {
    println!("{}: {} bytes", f.name, f.size);
}
```

---

## Screenshots

```rust
pub struct Screenshots { /* private fields */ }
pub use sys::ScreenshotHandle; // u32
```

通过 `client.screenshots()` 获取。

| 方法                          | 签名                                                                                                                                                                        | 说明    |
|-----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| `hook_screenshots`          | `fn hook_screenshots(&self, hook: bool)`                                                                                                                                  | 接管截图键 |
| `is_screenshots_hooked`     | `fn is_screenshots_hooked(&self) -> bool`                                                                                                                                 | 是否已接管 |
| `trigger_screenshot`        | `fn trigger_screenshot(&self)`                                                                                                                                            | 触发截图  |
| `add_screenshot_to_library` | `fn add_screenshot_to_library(&self, filename: &Path, thumbnail_filename: Option<&Path>, width: i32, height: i32) -> Result<ScreenshotHandle, ScreenshotLibraryAddError>` | 添加截图  |

### 类型

```rust
pub enum ScreenshotLibraryAddError { SavingFailed, InvalidPath }
pub struct ScreenshotRequested;
pub struct ScreenshotReady {
    pub local_handle: Result<ScreenshotHandle, ScreenshotReadyError>,
}
pub enum ScreenshotReadyError { Fail, IoFailure }
```

---

## Remote Play

```rust
pub struct RemotePlay { /* private fields */ }
```

通过 `client.remote_play()` 获取。

### `RemotePlay` 方法

| 方法         | 签名                                                                     | 说明          |
|------------|------------------------------------------------------------------------|-------------|
| `sessions` | `fn sessions(&self) -> Vec<RemotePlaySession>`                         | 所有活跃会话列表    |
| `session`  | `fn session(&self, session: RemotePlaySessionId) -> RemotePlaySession` | 从 ID 获取会话对象 |

### `RemotePlaySessionId`

```rust
pub struct RemotePlaySessionId(pub(crate) u32);
```

| 方法         | 签名                                            | 说明       |
|------------|-----------------------------------------------|----------|
| `from_raw` | `fn from_raw(id: u32) -> RemotePlaySessionId` | 从 u32 创建 |
| `raw`      | `fn raw(&self) -> u32`                        | 返回 u32   |

### `RemotePlaySession`

```rust
pub struct RemotePlaySession { /* private fields */ }
```

| 方法                   | 签名                                                              | 说明            |
|----------------------|-----------------------------------------------------------------|---------------|
| `user`               | `fn user(&self) -> SteamId`                                     | 会话关联用户        |
| `client_name`        | `fn client_name(&self) -> Option<String>`                       | 客户端设备名        |
| `client_form_factor` | `fn client_form_factor(&self) -> Option<SteamDeviceFormFactor>` | 设备形态          |
| `client_resolution`  | `fn client_resolution(&self) -> Option<(u32, u32)>`             | 客户端分辨率 (宽, 高) |
| `invite`             | `fn invite(&self, friend: SteamId) -> bool`                     | 邀请好友加入        |

### `SteamDeviceFormFactor`

```rust
pub enum SteamDeviceFormFactor {
    Phone, Tablet, Computer, TV,
}
```

### Callbacks

```rust
pub struct RemotePlayConnected { pub session: RemotePlaySessionId }
pub struct RemotePlayDisconnected { pub session: RemotePlaySessionId }
```

---

## Timeline

```rust
pub struct Timeline { /* disabled: bool 字段表示不可用 */ }
```

通过 `client.timeline()` 获取。Steam 客户端 API 版本不够时会自动禁用。

### 方法

| 方法                                 | 签名                                                                                                                                                                                 | 说明               |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------|
| `set_timeline_state_description`   | `fn set_timeline_state_description(&self, description: &str, duration: Duration)`                                                                                                  | 设置当前状态描述         |
| `clear_timeline_state_description` | `fn clear_timeline_state_description(&self, duration: Duration)`                                                                                                                   | 清除状态描述           |
| `add_timeline_event`               | `fn add_timeline_event(&self, icon: &str, title: &str, description: &str, priority: u32, start_offset_seconds: f32, duration: Duration, clip_priority: TimelineEventClipPriority)` | 添加时间线事件          |
| `set_timeline_game_mode`           | `fn set_timeline_game_mode(&self, mode: TimelineGameMode)`                                                                                                                         | 设置游戏模式（改变时间线条颜色） |

### `add_timeline_event` 参数

| 参数                     | 类型                          | 说明          |
|------------------------|-----------------------------|-------------|
| `icon`                 | `&str`                      | 图标名称        |
| `title`                | `&str`                      | 事件标题        |
| `description`          | `&str`                      | 事件描述        |
| `priority`             | `u32`                       | 优先级（越小越先显示） |
| `start_offset_seconds` | `f32`                       | 起始偏移（秒）     |
| `duration`             | `Duration`                  | 事件持续时间      |
| `clip_priority`        | `TimelineEventClipPriority` | 剪辑优先级       |

### 枚举

```rust
pub enum TimelineGameMode {
    Playing,        // 游戏中
    Staging,        // 多人游戏大厅
    Menus,          // 主菜单/暂停菜单
    LoadingScreen,  // 加载画面
}

pub enum TimelineEventClipPriority {
    None,      // 不适合做剪辑片段
    Standard,  // 用户可能想剪辑
    Featured,  // 推荐剪辑
}
```

---

## Server

```rust
pub struct Server { /* private fields */ }
pub enum ServerMode { NoAuthentication, Authentication, AuthenticationAndSecure }
pub const QUERY_PORT_SHARED: u16;
```

通过 `Server::init(ip, game_port, query_port, server_mode, version)` 创建。返回 `(Server, Client)` 元组。

```rust
pub fn init(
    ip: Ipv4Addr,
    game_port: u16,
    query_port: u16,
    server_mode: ServerMode,
    version: &str,
) -> Result<(Server, Client), SteamAPIInitError>
```

| 参数            | 类型           | 说明                          |
|---------------|--------------|-----------------------------|
| `ip`          | `Ipv4Addr`   | 服务器 IPv4 地址                 |
| `game_port`   | `u16`        | 游戏端口                        |
| `query_port`  | `u16`        | 查询端口（或 `QUERY_PORT_SHARED`） |
| `server_mode` | `ServerMode` | 认证模式                        |
| `version`     | `&str`       | 版本字符串（如 `"0.0.1"`）          |

### Server 基础方法

| 方法                  | 签名                                                                 | 说明           |
|---------------------|--------------------------------------------------------------------|--------------|
| `steam_id`          | `fn steam_id(&self) -> SteamId`                                    | 服务器 Steam ID |
| `run_callbacks`     | `fn run_callbacks(&self)`                                          | 运行待处理回调      |
| `process_callbacks` | `fn process_callbacks(&self, handler: impl FnMut(CallbackResult))` | 运行回调并传入每个回调  |
| `register_callback` | `fn register_callback<C, F>(&self, f: F) -> CallbackHandle`        | 注册回调         |

### Server 接口访问器

| 方法                      | 返回类型                 |
|-------------------------|----------------------|
| `ugc()`                 | `UGC`                |
| `utils()`               | `Utils`              |
| `networking()`          | `Networking`         |
| `networking_messages()` | `NetworkingMessages` |
| `networking_sockets()`  | `NetworkingSockets`  |

### 认证票据

与 `User` 接口相同的方法签名：

| 方法                                                       | 说明            |
|----------------------------------------------------------|---------------|
| `authentication_session_ticket(&self, identity)`         | 生成 P2P 认证票据   |
| `authentication_session_ticket_with_steam_id(&self, id)` | 同上，用 Steam ID |
| `cancel_authentication_ticket(&self, ticket)`            | 取消票据          |
| `begin_authentication_session(&self, user, ticket)`      | 验证票据          |
| `end_authentication_session(&self, user)`                | 结束认证会话        |

### 服务器配置

| 方法                       | 签名                                                  | 说明                         |
|--------------------------|-----------------------------------------------------|----------------------------|
| `set_product`            | `fn set_product(&self, product: &str)`              | 设置产品标识（推荐用 App ID 字符串）     |
| `set_game_description`   | `fn set_game_description(&self, desc: &str)`        | 设置游戏描述（推荐用完整游戏名）           |
| `set_game_data`          | `fn set_game_data(&self, data: &str)`               | 设置游戏数据（逗号/分号分隔，用于服务器浏览器过滤） |
| `set_mod_dir`            | `fn set_mod_dir(&self, mod_dir: &str)`              | 设置 Mod 目录                  |
| `set_map_name`           | `fn set_map_name(&self, map_name: &str)`            | 设置地图名称                     |
| `set_server_name`        | `fn set_server_name(&self, server_name: &str)`      | 设置服务器名称                    |
| `set_max_players`        | `fn set_max_players(&self, count: i32)`             | 设置最大玩家数                    |
| `set_game_tags`          | `fn set_game_tags(&self, tags: &str)`               | 设置游戏标签（≤127 字符，非空）         |
| `set_key_value`          | `fn set_key_value(&self, key: &str, value: &str)`   | 添加/更新规则键值对                 |
| `clear_all_key_values`   | `fn clear_all_key_values(&self)`                    | 清除所有规则键值对                  |
| `set_password_protected` | `fn set_password_protected(&self, protected: bool)` | 是否密码保护                     |
| `set_bot_player_count`   | `fn set_bot_player_count(&self, count: i32)`        | 机器人数量                      |
| `set_dedicated_server`   | `fn set_dedicated_server(&self, dedicated: bool)`   | 是否专用服务器                    |

### 登录与心跳

| 方法                            | 签名                                                    | 说明                       |
|-------------------------------|-------------------------------------------------------|--------------------------|
| `log_on_anonymous`            | `fn log_on_anonymous(&self)`                          | 匿名登录                     |
| `log_on`                      | `fn log_on(&self, token: &str)`                       | 通过 GSLT token 登录         |
| `enable_heartbeats`           | `fn enable_heartbeats(&self, active: bool)`           | 启用心跳（向 master server 上报） |
| `set_advertise_server_active` | `fn set_advertise_server_active(&self, active: bool)` | 同 `enable_heartbeats`    |

### 共享端口查询（QUERY_PORT_SHARED）

当 `query_port` 传入 `QUERY_PORT_SHARED` 时，使用以下方法自行处理查询包：

| 方法                         | 签名                                                                                        | 说明                      |
|----------------------------|-------------------------------------------------------------------------------------------|-------------------------|
| `handle_incoming_packet`   | `fn handle_incoming_packet(&self, data: &[u8], addr: SocketAddrV4) -> bool`               | 处理以 `0xFFFFFFFF` 开头的入站包 |
| `get_next_outgoing_packet` | `fn get_next_outgoing_packet(&self, buffer: &mut [u8], cb: impl Fn(SocketAddrV4, &[u8]))` | 处理出站包（buffer 至少 16KB）   |

### Callbacks

```rust
pub struct GSClientApprove {
    pub user: SteamId,      // 请求 P2P 会话的用户
    pub owner: SteamId,     // 游戏拥有者（家庭共享时可能与 user 不同）
}
pub struct GSClientDeny {
    pub user: SteamId,
    pub deny_reason: DenyReason,
    pub optional_text: String,
}
pub struct GSClientKick {
    pub user: SteamId,
    pub deny_reason: DenyReason,
}
pub struct GSClientGroupStatus {
    pub user: SteamId,
    pub group: SteamId,
    pub member: bool,
    pub officer: bool,
}

pub enum DenyReason {
    Invalid, InvalidVersion, Generic, NotLoggedOn, NoLicense, Cheater,
    LoggedInElseWhere, UnknownText, IncompatibleAnticheat, MemoryCorruption,
    IncompatibleSoftware, SteamConnectionLost, SteamConnectionError,
    SteamResponseTimedOut, SteamValidationStalled, SteamOwnerLeftGuestUser,
}
```

---

## MatchmakingServers

```rust
pub struct MatchmakingServers { /* private fields */ }
```

通过 `client.matchmaking_servers()` 获取。

### 服务器列表查询

所有列表查询方法使用回调模式，返回 `Arc<Mutex<ServerListRequest>>`。使用完毕后必须调用 `ServerListRequest::release()` 释放。

| 方法                      | 签名                                                                                                                                                                      |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `internet_server_list`  | `fn internet_server_list(&self, app_id: impl Into<AppId>, filters: &HashMap<&str, &str>, callbacks: ServerListCallbacks) -> Result<Arc<Mutex<ServerListRequest>>, ()>`  |
| `lan_server_list`       | `fn lan_server_list(&self, app_id: impl Into<AppId>, callbacks: ServerListCallbacks) -> Arc<Mutex<ServerListRequest>>`                                                  |
| `friends_server_list`   | `fn friends_server_list(&self, app_id: impl Into<AppId>, filters: &HashMap<&str, &str>, callbacks: ServerListCallbacks) -> Result<Arc<Mutex<ServerListRequest>>, ()>`   |
| `favorites_server_list` | `fn favorites_server_list(&self, app_id: impl Into<AppId>, filters: &HashMap<&str, &str>, callbacks: ServerListCallbacks) -> Result<Arc<Mutex<ServerListRequest>>, ()>` |
| `history_server_list`   | `fn history_server_list(&self, app_id: impl Into<AppId>, filters: &HashMap<&str, &str>, callbacks: ServerListCallbacks) -> Result<Arc<Mutex<ServerListRequest>>, ()>`   |

`filters` 的 key/value
参考 [Steam 匹配键值对文档](https://partner.steamgames.com/doc/api/ISteamMatchmakingServers#MatchMakingKeyValuePair_t)。

### 单个服务器查询

| 方法               | 签名                                                                                     | 说明       |
|------------------|----------------------------------------------------------------------------------------|----------|
| `ping_server`    | `fn ping_server(&self, ip: Ipv4Addr, port: u16, callbacks: PingCallbacks)`             | Ping 服务器 |
| `player_details` | `fn player_details(&self, ip: Ipv4Addr, port: u16, callbacks: PlayerDetailsCallbacks)` | 查询玩家详情   |
| `server_rules`   | `fn server_rules(&self, ip: Ipv4Addr, port: u16, callbacks: ServerRulesCallbacks)`     | 查询服务器规则  |

### Callbacks 类型

```rust
// 服务器列表回调
pub struct ServerListCallbacks {
    pub responded: Rc<Box<dyn Fn(Arc<Mutex<ServerListRequest>>, i32)>>,     // 服务器响应
    pub failed: Rc<Box<dyn Fn(Arc<Mutex<ServerListRequest>>, i32)>>,        // 服务器无响应
    pub refresh_complete: Rc<Box<dyn Fn(Arc<Mutex<ServerListRequest>>, ServerResponse)>>, // 刷新完成
}

// Ping 回调
pub struct PingCallbacks {
    pub responded: Rc<Box<dyn Fn(GameServerItem)>>,
    pub failed: Rc<Box<dyn Fn()>>,
}

// 玩家详情回调
pub struct PlayerDetailsCallbacks {
    pub add_player: Rc<Box<dyn Fn(&CStr, i32, f32)>>,  // (name, score, time_played)
    pub failed: Rc<Box<dyn Fn()>>,
    pub refresh_complete: Rc<Box<dyn Fn()>>,
}

// 服务器规则回调
pub struct ServerRulesCallbacks {
    pub add_rule: Rc<Box<dyn Fn(&CStr, &CStr)>>,  // (rule, value)
    pub failed: Rc<Box<dyn Fn()>>,
    pub refresh_complete: Rc<Box<dyn Fn()>>,
}

pub enum ServerResponse {
    ServerResponded = 0,
    ServerFailedToRespond = 1,
    NoServersListedOnMasterServer = 2,
}
```

### `ServerListRequest`

```rust
pub struct ServerListRequest { /* private fields */ }
```

| 方法                   | 签名                                                                        | 说明           |
|----------------------|---------------------------------------------------------------------------|--------------|
| `release`            | `fn release(&mut self) -> Result<(), ReleaseError>`                       | 释放请求，取消待处理查询 |
| `get_server_count`   | `fn get_server_count(&self) -> Result<i32, ()>`                           | 服务器数量        |
| `get_server_details` | `fn get_server_details(&self, server: i32) -> Result<GameServerItem, ()>` | 获取服务器详情      |
| `refresh_query`      | `fn refresh_query(&self) -> Result<(), ()>`                               | 刷新查询         |
| `refresh_server`     | `fn refresh_server(&self, server: i32) -> Result<(), ()>`                 | 刷新单个服务器      |
| `is_refreshing`      | `fn is_refreshing(&self) -> Result<bool, ()>`                             | 是否正在刷新       |

### `GameServerItem`

```rust
pub struct GameServerItem {
    pub appid: AppId,
    pub players: i32,
    pub do_not_refresh: bool,
    pub successful_response: bool,
    pub have_password: bool,
    pub secure: bool,
    pub bot_players: i32,
    pub ping: Duration,
    pub max_players: i32,
    pub server_version: i32,
    pub steamid: SteamId,
    pub last_time_played: Duration,
    pub addr: Ipv4Addr,
    pub query_port: u16,
    pub connection_port: u16,
    pub game_description: String,
    pub server_name: String,
    pub game_dir: String,
    pub map: String,
    pub tags: String,
}
```

---

## UGC (创意工坊)

通过 `client.ugc()` 获取。（GameServer 端通过 `server.ugc()` 获取，需先调用 `UGC::init_for_game_server`）

```rust
pub struct UGC { /* private fields */ }
```

### 物品生命周期

| 方法                  | 签名                                                                                                                                 | 说明                           |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `create_item`       | `fn create_item<F>(&self, app_id: AppId, file_type: FileType, cb: F) where F: FnOnce(Result<(PublishedFileId, bool), SteamError>)` | 创建新工坊物品                      |
| `start_item_update` | `fn start_item_update(&self, app_id: AppId, file_id: PublishedFileId) -> UpdateHandle`                                             | 开始更新物品，返回 `UpdateHandle` 构建器 |
| `subscribe_item`    | `fn subscribe_item<F>(&self, published_file_id: PublishedFileId, cb: F) where F: FnOnce(Result<(), SteamError>)`                   | 订阅物品                         |
| `unsubscribe_item`  | `fn unsubscribe_item<F>(&self, published_file_id: PublishedFileId, cb: F) where F: FnOnce(Result<(), SteamError>)`                 | 取消订阅                         |
| `delete_item`       | `fn delete_item<F>(&self, published_file_id: PublishedFileId, cb: F) where F: FnOnce(Result<(), SteamError>)`                      | 删除物品                         |
| `suspend_downloads` | `fn suspend_downloads(&self, suspend: bool)`                                                                                       | 暂停/恢复所有 UGC 下载               |

### 物品查询

| 方法                   | 签名                                                                                                                                                                                 | 说明                |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------|
| `subscribed_items`   | `fn subscribed_items(&self, include_locally_disabled: bool) -> Vec<PublishedFileId>`                                                                                               | 当前订阅列表            |
| `item_state`         | `fn item_state(&self, item: PublishedFileId) -> ItemState`                                                                                                                         | 物品状态（bitflags）    |
| `item_download_info` | `fn item_download_info(&self, item: PublishedFileId) -> Option<(u64, u64)>`                                                                                                        | 下载进度 `(已下载, 总大小)` |
| `item_install_info`  | `fn item_install_info(&self, item: PublishedFileId) -> Option<InstallInfo>`                                                                                                        | 安装信息（路径、大小等）      |
| `download_item`      | `fn download_item(&self, item: PublishedFileId, high_priority: bool) -> bool`                                                                                                      | 开始/优先下载           |
| `query_all`          | `fn query_all(&self, query_type: UGCQueryType, item_type: UGCType, appids: AppIDs, page: u32) -> Result<QueryHandle, CreateQueryError>`                                            | 查询所有物品            |
| `query_user`         | `fn query_user(&self, account: AccountId, list_type: UserList, item_type: UGCType, sort_order: UserListOrder, appids: AppIDs, page: u32) -> Result<QueryHandle, CreateQueryError>` | 按用户查询             |
| `query_items`        | `fn query_items(&self, items: Vec<PublishedFileId>) -> Result<QueryHandle, CreateQueryError>`                                                                                      | 按 ID 列表查询         |
| `query_item`         | `fn query_item(&self, item: PublishedFileId) -> Result<QueryHandle, CreateQueryError>`                                                                                             | 按单个 ID 查询         |

### `UpdateHandle` — 物品更新构建器

链式调用设置更新字段，最后调用 `submit` 提交：

| 方法                          | 签名                                                                            | 说明       |
|-----------------------------|-------------------------------------------------------------------------------|----------|
| `title`                     | `fn title(self, title: &str) -> Self`                                         | 设置标题     |
| `description`               | `fn description(self, description: &str) -> Self`                             | 设置描述     |
| `language`                  | `fn language(self, language: &str) -> Self`                                   | 设置语言     |
| `preview_path`              | `fn preview_path(self, path: &Path) -> Self`                                  | 设置预览图路径  |
| `content_path`              | `fn content_path(self, path: &Path) -> Self`                                  | 设置内容路径   |
| `metadata`                  | `fn metadata(self, metadata: &str) -> Self`                                   | 设置元数据    |
| `visibility`                | `fn visibility(self, visibility: PublishedFileVisibility) -> Self`            | 设置可见性    |
| `tags`                      | `fn tags<S: AsRef<str>>(self, tags: Vec<S>, allow_admin_tags: bool) -> Self`  | 设置标签     |
| `add_key_value_tag`         | `fn add_key_value_tag(self, key: &str, value: &str) -> Self`                  | 添加键值标签   |
| `remove_key_value_tag`      | `fn remove_key_value_tag(self, key: &str) -> Self`                            | 移除键值标签   |
| `add_content_descriptor`    | `fn add_content_descriptor(self, desc_id: UGCContentDescriptorID) -> Self`    | 添加内容描述符  |
| `remove_content_descriptor` | `fn remove_content_descriptor(self, desc_id: UGCContentDescriptorID) -> Self` | 移除内容描述符  |
| `remove_all_key_value_tags` | `fn remove_all_key_value_tags(self) -> Self`                                  | 清除所有键值标签 |
| `submit`                    | `fn submit<F>(self, change_note: Option<&str>, cb: F) -> UpdateWatchHandle`   | 提交更新     |

### 播放时长追踪

| 方法                                     | 签名                                                                     | 说明     |
|----------------------------------------|------------------------------------------------------------------------|--------|
| `start_playtime_tracking`              | `fn start_playtime_tracking<F>(&self, ids: &[PublishedFileId], cb: F)` | 开始追踪   |
| `stop_playtime_tracking`               | `fn stop_playtime_tracking<F>(&self, ids: &[PublishedFileId], cb: F)`  | 停止追踪   |
| `stop_playtime_tracking_for_all_items` | `fn stop_playtime_tracking_for_all_items<F>(&self, cb: F)`             | 停止全部追踪 |

### Game Server 专用

| 方法                     | 签名                                                                                     | 说明                 |
|------------------------|----------------------------------------------------------------------------------------|--------------------|
| `init_for_game_server` | `fn init_for_game_server(&self, workshop_depot: sys::DepotId_t, folder: &str) -> bool` | 初始化 Game Server 工坊 |

### 类型

```rust
pub struct PublishedFileId(pub u64);  // 实现 From<u64>

pub enum FileType { Community, Microtransaction, Collection, Art, Video, Screenshot, Game, Software, ... }
pub enum UGCQueryType { RankedByVote, RankedByPublicationDate, RankedByTrend, RankedByTextSearch, ... }
pub enum UserList { Published, VotedOn, VotedUp, VotedDown, WillVoteLater, Favorited, Subscribed, ... }
pub enum UserListOrder { CreationOrderAsc, CreationOrderDesc, TitleAsc, LastUpdatedDesc, SubscriptionDateDesc, ... }

pub enum AppIDs {
    CreatorAppId(AppId),           // 指定创建者 App
    ConsumerAppId(AppId),          // 指定消费者 App
    Both { creator: AppId, consumer: AppId },  // 两者都指定
}
// AppIDs 方法:
//   fn creator_app_id(&self) -> Option<AppId>
//   fn consumer_app_id(&self) -> Option<AppId>

pub struct ItemState: u32 {
    const NONE = 0;
    const SUBSCRIBED = 1;
    const LEGACY_ITEM = 2;
    const INSTALLED = 4;
    const NEEDS_UPDATE = 8;
    const DOWNLOADING = 16;
    const DOWNLOAD_PENDING = 32;
}

pub struct InstallInfo {
    pub folder: String,
    pub size_on_disk: u64,
    pub timestamp: u32,
}

pub struct CreateQueryError;  // 查询参数无效时返回
```

### `UpdateWatchHandle` — 更新监控

```rust
pub struct UpdateWatchHandle { /* 更新监控句柄 */ }
```

| 方法         | 签名                                               | 说明                     |
|------------|--------------------------------------------------|------------------------|
| `progress` | `fn progress(&self) -> (UpdateStatus, u64, u64)` | 获取更新进度 `(状态, 已完成, 总数)` |

### `QueryHandle` — 查询构建器

链式调用设置过滤条件，最后调用 `fetch`/`fetch_total`/`fetch_ids` 执行：

| 方法                               | 签名                                                                                   | 说明           |
|----------------------------------|--------------------------------------------------------------------------------------|--------------|
| `require_tag`                    | `fn require_tag(self, tag: &str) -> Self`                                            | 要求物品包含此标签    |
| `exclude_tag`                    | `fn exclude_tag(self, tag: &str) -> Self`                                            | 排除包含此标签的物品   |
| `add_required_tag`               | `fn add_required_tag(self, tag: &str) -> Self`                                       | 添加必须标签       |
| `add_excluded_tag`               | `fn add_excluded_tag(self, tag: &str) -> Self`                                       | 添加排除标签       |
| `add_required_key_value_tag`     | `fn add_required_key_value_tag(self, key: &str, value: &str) -> Self`                | 添加必须键值标签     |
| `set_match_any_tag`              | `fn set_match_any_tag(self, match_any_tag: bool) -> Self`                            | 匹配任意标签（而非全部） |
| `set_search_text`                | `fn set_search_text(self, search_text: &str) -> Self`                                | 设置搜索文本       |
| `set_ranked_by_trend_days`       | `fn set_ranked_by_trend_days(self, days: u32) -> Self`                               | 趋势排序天数       |
| `set_language`                   | `fn set_language(self, language: &str) -> Self`                                      | 设置语言过滤       |
| `set_allow_cached_response`      | `fn set_allow_cached_response(self, max_age_seconds: u32) -> Self`                   | 允许缓存响应       |
| `set_cloud_file_name_filter`     | `fn set_cloud_file_name_filter(self, file_name: &str) -> Self`                       | 云文件名过滤       |
| `set_return_only_ids`            | `fn set_return_only_ids(self, return_only_ids: bool) -> Self`                        | 仅返回 ID       |
| `set_return_key_value_tags`      | `fn set_return_key_value_tags(self, return_kv_tags: bool) -> Self`                   | 返回键值标签       |
| `set_return_long_description`    | `fn set_return_long_description(self, return_long_desc: bool) -> Self`               | 返回详细描述       |
| `set_return_metadata`            | `fn set_return_metadata(self, return_metadata: bool) -> Self`                        | 返回元数据        |
| `set_return_children`            | `fn set_return_children(self, return_children: bool) -> Self`                        | 返回子物品        |
| `set_return_additional_previews` | `fn set_return_additional_previews(self, return_additional_previews: bool) -> Self`  | 返回额外预览       |
| `set_return_total_only`          | `fn set_return_total_only(self, return_total_only: bool) -> Self`                    | 仅返回总数        |
| `fetch`                          | `fn fetch<F>(self, cb: F) where F: FnOnce(Result<QueryResults<'_>, SteamError>)`     | 执行查询         |
| `fetch_total`                    | `fn fetch_total<F>(self, cb: F) where F: Fn(Result<u32, SteamError>)`                | 仅查询总数        |
| `fetch_ids`                      | `fn fetch_ids<F>(self, cb: F) where F: Fn(Result<Vec<PublishedFileId>, SteamError>)` | 仅查询 ID 列表    |

### `QueryResults<'a>` — 查询结果

| 方法                   | 签名                                                                                       | 说明        |
|----------------------|------------------------------------------------------------------------------------------|-----------|
| `was_cached`         | `fn was_cached(&self) -> bool`                                                           | 结果是否来自缓存  |
| `total_results`      | `fn total_results(&self) -> u32`                                                         | 匹配总数      |
| `returned_results`   | `fn returned_results(&self) -> u32`                                                      | 本页返回数     |
| `get`                | `fn get(&self, index: u32) -> Option<QueryResult>`                                       | 按索引获取单个结果 |
| `iter`               | `fn iter(&self) -> impl Iterator<Item = Option<QueryResult>>`                            | 迭代所有结果    |
| `preview_url`        | `fn preview_url(&self, index: u32) -> Option<String>`                                    | 预览图 URL   |
| `statistic`          | `fn statistic(&self, index: u32, stat_type: UGCStatisticType) -> Option<u64>`            | 物品统计值     |
| `get_children`       | `fn get_children(&self, index: u32) -> Option<Vec<PublishedFileId>>`                     | 子物品列表     |
| `key_value_tags`     | `fn key_value_tags(&self, index: u32) -> u32`                                            | 键值标签数量    |
| `get_key_value_tag`  | `fn get_key_value_tag(&self, index: u32, kv_tag_index: u32) -> Option<(String, String)>` | 获取键值标签    |
| `get_metadata`       | `fn get_metadata(&self, index: u32) -> Option<Vec<u8>>`                                  | 获取元数据     |
| `content_descriptor` | `fn content_descriptor(&self, index: u32) -> Vec<UGCContentDescriptorID>`                | 内容描述符     |

### `QueryResult` — 单个查询结果

```rust
pub struct QueryResult {
    pub published_file_id: PublishedFileId,
    pub creator_app_id: Option<AppId>,
    pub consumer_app_id: Option<AppId>,
    pub title: String,
    pub description: String,
    pub owner: SteamId,
    pub time_created: u32,
    pub time_updated: u32,
    pub time_added_to_user_list: u32,
    pub visibility: PublishedFileVisibility,
    pub banned: bool,
    pub accepted_for_use: bool,
    pub tags: Vec<String>,
    pub tags_truncated: bool,
    pub file_name: String,
    pub file_type: FileType,
    pub file_size: u32,
    pub url: String,
    pub num_upvotes: u32,
    pub num_downvotes: u32,
    pub score: f32,
    pub num_children: u32,
}
```

### 补充枚举

```rust
pub enum UGCType { Items, ItemsMtx, ItemsReadyToUse, Collections, Artwork, Videos, Screenshots, AllGuides, WebGuides, IntegratedGuides, UsableInGame, ControllerBindings, GameManagedItems, All }
pub enum UGCStatisticType { Subscriptions, Favorites, Followers, UniqueSubscriptions, UniqueFavorites, UniqueFollowers, UniqueWebsiteViews, Reports, SecondsPlayed, PlaytimeSessions, Comments }
pub enum UpdateStatus { Invalid, PreparingConfig, PreparingContent, UploadingContent, UploadingPreviewFile, CommittingChanges }
pub enum UGCContentDescriptorID { NudityOrSexualContent, FrequentViolenceOrGore, AdultOnlySexualContent, GratuitousSexualContent, AnyMatureContent }
pub const RESULTS_PER_PAGE: u32;  // = sys::kNumUGCResultsPerPage
```

### Callbacks

```rust
pub struct DownloadItemResult {
    pub app_id: AppId,
    pub published_file_id: PublishedFileId,
    pub error: Option<SteamError>,  // None = 成功
}

pub struct DeleteItemResult {
    pub published_file_id: PublishedFileId,
    pub error: Option<SteamError>,  // None = 成功
}
```