# 10 - 错误类型 & 回调系统

> steamworks-rs 源码: `error.rs`, `callback.rs`

---

## `SteamError` — Steam API 错误

```rust
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum SteamError {
    // 通用
    Generic,               // 通用失败
    NoConnection,          // 无网络连接
    InvalidPassword,       // 密码/票据无效
    LoggedInElsewhere,     // 在其他位置登录
    InvalidProtocolVersion,// 协议版本不正确
    InvalidParameter,      // 参数无效
    // 文件
    FileNotFound,          // 文件未找到
    // 状态
    Busy,                  // 忙
    InvalidState,          // 对象状态无效
    InvalidName,           // 名称无效
    InvalidEmail,          // 邮箱无效
    DuplicateName,         // 名称不唯一
    AccessDenied,          // 访问被拒绝
    Timeout,               // 超时
    Banned,                // VAC2 封禁
    AccountNotFound,       // 账户未找到
    InvalidSteamID,        // SteamID 无效
    ServiceUnavailable,    // 服务不可用
    NotLoggedOn,           // 未登录
    Pending,               // 请求进行中
    EncryptionFailure,     // 加密/解密失败
    InsufficientPrivilege, // 权限不足
    LimitExceeded,         // 超出限制
    Revoked,               // 访问被撤销
    Expired,               // 访问已过期
    AlreadyRedeemed,       // 许可/通行证已兑换
    DuplicateRequest,      // 重复请求
    AlreadyOwned,          // 已拥有
    IPNotFound,            // IP 地址未找到
    PersistFailed,         // 写入失败
    LockingFailed,         // 获取锁失败
    LogonSessionReplaced,  // 登录会话被替换
    ConnectFailed,         // 连接失败
    HandshakeFailed,       // 握手失败
    IOFailure,             // IO 失败
    RemoteDisconnect,      // 远端断开
    ShoppingCartNotFound,  // 购物车未找到
    Blocked,               // 被阻止
    Ignored,               // 被忽略
    NoMatch,               // 无匹配
    AccountDisabled,       // 账户禁用
    ServiceReadOnly,       // 服务只读
    AccountNotFeatured,    // 账户无此功能
    AdministratorOK,       // 管理员权限 OK
    ContentVersion,        // 内容版本不匹配
    TryAnotherCM,          // 当前 CM 无法服务
    PasswordRequiredToKickSession,
    AlreadyLoggedInElsewhere,
    Suspended,             // 操作暂停
    Cancelled,             // 操作取消
    DataCorruption,        // 数据损坏
    DiskFull,              // 磁盘满
    RemoteCallFailed,      // 远程调用失败
    PasswordUnset,         // 密码未设置
    ExternalAccountUnlinked,
    ExternalAccountAlreadyLinked,
    PSNTicketInvalid,
    RemoteFileConflict,    // 远程文件冲突
    IllegalPassword,       // 非法密码
    SameAsPreviousValue,   // 新值同旧值
    AccountLogonDenied,    // 2FA 失败
    CannotUseOldPassword,
    InvalidLoginAuthCode,
    AccountLogonDeniedNoMail,
    HardwareNotCapableOfIPT,
    IPTInitError,
    ParentalControlRestricted,
    FacebookQueryError,
    ExpiredLoginAuthCode,
    IPLoginRestrictionFailed,
    AccountLockedDown,
    AccountLogonDeniedVerifiedEmailRequired,
    NoMatchingURL,
    BadResponse,
    RequirePasswordReEntry,
    ValueOutOfRange,
    UnexpectedError,
    Disabled,
    InvalidCEGSubmission,
    RestrictedDevice,
    RegionLocked,
    RateLimitExceeded,
    AccountLoginDeniedNeedTwoFactor,
    ItemDeleted,
    AccountLoginDeniedThrottle,
    TwoFactorCodeMismatch,
    TwoFactorActivationCodeMismatch,
    AccountAssociatedToMultiplePartners,
    NotModified,
    NoMobileDevice,
    TimeNotSynced,
    SmsCodeFailed,
    AccountLimitExceeded,
    AccountActivityLimitExceeded,
    PhoneActivityLimitExceeded,
    RefundToWallet,
    EmailSendFailure,
    NotSettled,
    NeedCaptcha,
    GSLTDenied,            // GSLT 被封禁
    GSOwnerDenied,         // GS 拥有者被拒
    InvalidItemType,
    IPBanned,
    GSLTExpired,           // GSLT 已过期
    InsufficientFunds,
    TooManyPending,
    NoSiteLicensesFound,
    WGNetworkSendExceeded,
    AccountNotFriends,
    LimitedUserAccount,
    CantRemoveItem,
    AccountDeleted,
    ExistingUserCancelledLicense,
    CommunityCooldown,
    NoLauncherSpecified,
    MustAgreeToSSA,
    LauncherMigrated,
    SteamRealmMismatch,
    InvalidSignature,
    ParseFailure,
    NoVerifiedPhone,
    InsufficientBattery,
    ChargerRequired,
    CachedCredentialInvalid,
    NotSupported,
    FamilySizeLimitExceeded,
    OfflineAppCacheInvalid,
    TryLater,
}
```

---

## `InvalidSteamError`

```rust
pub enum InvalidSteamError {
    Ok,              // 不是错误，是 OK
    Unknown(i64),    // 未识别的错误码
}
```

---

## `SteamAPIInitError` — 初始化错误

```rust
pub enum SteamAPIInitError {
    Generic(String),          // 其他失败
    NoSteamClient(String),    // 未连接 Steam（通常 Steam 未运行）
    VersionMismatch(String),  // Steam 客户端版本太旧
}
```

---

## `SteamResult`

```rust
pub type SteamResult<T = ()> = Result<T, SteamError>;
```

---

## 回调系统

### `Callback` trait

```rust
pub unsafe trait Callback {
    const ID: i32;
    unsafe fn from_raw(raw: *mut c_void) -> Self;
}
```

所有可注册为回调的结构体都实现了此 trait。

### `CallbackHandle`

```rust
pub struct CallbackHandle { /* private */ }
```

- 超出作用域时自动从 Steam 取消注册
- 由 `Client::register_callback()` 返回

### `CallbackResult`

```rust
pub enum CallbackResult {
    AuthSessionTicketResponse(AuthSessionTicketResponse),
    DownloadItemResult(DownloadItemResult),
    FloatingGamepadTextInputDismissed(FloatingGamepadTextInputDismissed),
    GameLobbyJoinRequested(GameLobbyJoinRequested),
    GameOverlayActivated(GameOverlayActivated),
    GamepadTextInputDismissed(GamepadTextInputDismissed),
    GameRichPresenceJoinRequested(GameRichPresenceJoinRequested),
    LobbyChatMsg(LobbyChatMsg),
    LobbyChatUpdate(LobbyChatUpdate),
    LobbyCreated(LobbyCreated),
    LobbyDataUpdate(LobbyDataUpdate),
    LobbyEnter(LobbyEnter),
    MicroTxnAuthorizationResponse(MicroTxnAuthorizationResponse),
    NetConnectionStatusChanged(NetConnectionStatusChanged),
    NetworkingMessagesSessionFailed(NetworkingMessagesSessionFailed),
    NetworkingMessagesSessionRequest(NetworkingMessagesSessionRequest),
    P2PSessionConnectFail(P2PSessionConnectFail),
    P2PSessionRequest(P2PSessionRequest),
    PersonaStateChange(PersonaStateChange),
    RelayNetworkStatusCallback(RelayNetworkStatusCallback),
    RemotePlayConnected(RemotePlayConnected),
    RemotePlayDisconnected(RemotePlayDisconnected),
    ScreenshotRequested(ScreenshotRequested),
    ScreenshotReady(ScreenshotReady),
    SteamServerConnectFailure(SteamServerConnectFailure),
    SteamServersConnected(SteamServersConnected),
    SteamServersDisconnected(SteamServersDisconnected),
    TicketForWebApiResponse(TicketForWebApiResponse),
    UserAchievementStored(UserAchievementStored),
    UserAchievementIconFetched(UserAchievementIconFetched),
    UserStatsReceived(UserStatsReceived),
    UserStatsStored(UserStatsStored),
    ValidateAuthTicketResponse(ValidateAuthTicketResponse),
    GSClientApprove(GSClientApprove),
    GSClientDeny(GSClientDeny),
    GSClientKick(GSClientKick),
    GSClientGroupStatus(GSClientGroupStatus),
    NewUrlLaunchParameters(NewUrlLaunchParameters),
}
```

在使用 `Client::process_callbacks()` 时，每个回调会以 `CallbackResult` 的形式传入闭包。

---

## 注册回调示例

```rust
// register_callback — 需要 Send + 'static
let _handle = client.register_callback(|event: NetConnectionStatusChanged| {
    println!("连接状态变更: {:?}", event.connection_info.state());
});

// process_callbacks — 不需要 Send + 'static
loop {
    client.process_callbacks(|result| match result {
        CallbackResult::NetConnectionStatusChanged(event) => { /* ... */ }
        CallbackResult::LobbyEnter(event) => { /* ... */ }
        _ => {}
    });
}
```