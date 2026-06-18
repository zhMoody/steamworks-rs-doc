# 09 - 成就 & 统计 & 排行榜

> steamworks-rs 源码: `user_stats.rs`, `user_stats/stats.rs`, `user_stats/stat_callback.rs`

通过 `client.user_stats()` 获取。

---

## `UserStats`

```rust
pub struct UserStats {
    pub(crate) user_stats: *mut sys::ISteamUserStats,
    pub(crate) inner: Arc<Inner>,
}
```

---

### 用户统计

#### `request_user_stats`

```rust
pub fn request_user_stats(&self, steam_user_id: u64)
```

请求用户统计数据。完成后触发 `UserStatsReceived` 回调。

| 参数              | 类型    | 说明          |
|-----------------|-------|-------------|
| `steam_user_id` | `u64` | Steam 用户 ID |

#### `store_stats`

```rust
pub fn store_stats(&self) -> Result<(), ()>
```

将更改提交到服务器。成功后触发 `UserStatsStored`，解锁成就时触发 `UserAchievementStored`。

#### `reset_all_stats`

```rust
pub fn reset_all_stats(&self, achievements_too: bool) -> Result<(), ()>
```

重置当前用户统计，可选是否重置成就。

---

### 读取/设置统计值

| 方法             | 签名                                                                | 说明        |
|----------------|-------------------------------------------------------------------|-----------|
| `get_stat_i32` | `fn get_stat_i32(&self, name: &str) -> Result<i32, ()>`           | 读取 i32 统计 |
| `set_stat_i32` | `fn set_stat_i32(&self, name: &str, stat: i32) -> Result<(), ()>` | 设置 i32 统计 |
| `get_stat_f32` | `fn get_stat_f32(&self, name: &str) -> Result<f32, ()>`           | 读取 f32 统计 |
| `set_stat_f32` | `fn set_stat_f32(&self, name: &str, stat: f32) -> Result<(), ()>` | 设置 f32 统计 |

> **注意**: 这些仅修改内存中值，需调用 `store_stats()` 才提交到服务器。

---

### 成就

#### `achievement`

```rust
pub fn achievement(&self, name: &str) -> AchievementHelper<'_>
```

获取成就辅助器。

| 参数     | 类型     | 说明        |
|--------|--------|-----------|
| `name` | `&str` | 成就 API 名称 |

#### `get_num_achievements`

```rust
pub fn get_num_achievements(&self) -> Result<u32, ()>
```

获取已定义的成就数量。AppId 480 (Spacewar) 返回错误。

#### `get_achievement_names`

```rust
pub fn get_achievement_names(&self) -> Option<Vec<String>>
```

获取所有成就名称列表。

---

## `AchievementHelper<'parent>`

由 `UserStats::achievement()` 返回。

| 方法                                  | 签名                                                                           | 说明                                                     |
|-------------------------------------|------------------------------------------------------------------------------|--------------------------------------------------------|
| `get`                               | `fn get(&self) -> Result<bool, ()>`                                          | 获取成就解锁状态                                               |
| `set`                               | `fn set(&self) -> Result<(), ()>`                                            | 解锁成就                                                   |
| `clear`                             | `fn clear(&self) -> Result<(), ()>`                                          | 重置成就解锁状态                                               |
| `get_achievement_achieved_percent`  | `fn get_achievement_achieved_percent(&self) -> Result<f32, ()>`              | 全球达成百分比（需先调用 `request_global_achievement_percentages`） |
| `get_achievement_and_unlock_time`   | `fn get_achievement_and_unlock_time(&self) -> Result<(bool, u32), ()>`       | 获取状态 + Unix 解锁时间                                       |
| `get_achievement_display_attribute` | `fn get_achievement_display_attribute(&self, key: &str) -> Result<&str, ()>` | 获取显示属性。key 可选: `"name"`, `"desc"`, `"hidden"`          |
| `get_achievement_icon`              | `fn get_achievement_icon(&self) -> Option<Vec<u8>>`                          | 获取成就图标 RGBA 数据                                         |
| `get_achievement_icon_v2`           | `fn get_achievement_icon_v2(&self) -> Option<ImageBuffer>`                   | 获取成就图标（需 `image` feature）                              |

```rust
// 解锁成就示例
client.user_stats().achievement("WIN_THE_GAME").set().unwrap();
client.user_stats().store_stats().unwrap();
```

---

### 全球统计/成就

#### `request_global_achievement_percentages`

```rust
pub fn request_global_achievement_percentages<F>(&self, cb: F)
where F: FnOnce(Result<GameId, SteamError>) + 'static + Send
```

异步请求全球成就达成百分比。完成后可调用 `get_achievement_achieved_percent`。

#### `request_global_stats`

```rust
pub fn request_global_stats<F>(&self, history_days: i32, cb: F)
where F: FnOnce(Result<GameId, SteamError>) + 'static + Send
```

异步请求全球统计数据。

| 参数             | 类型                                   | 说明          |
|----------------|--------------------------------------|-------------|
| `history_days` | `i32`                                | 历史天数（最多 60） |
| `cb`           | `FnOnce(Result<GameId, SteamError>)` | 完成回调        |

#### `get_global_stat_i64`

```rust
pub fn get_global_stat_i64(&self, name: &str) -> Result<i64, ()>
```

获取全球 i64 统计值。需先 `request_global_stats`。

#### `get_global_stat_f64`

```rust
pub fn get_global_stat_f64(&self, name: &str) -> Result<f64, ()>
```

获取全球 f64 统计值。

#### `get_global_stat_history_i64`

```rust
pub fn get_global_stat_history_i64(&self, name: &str, max_days: usize) -> Result<Vec<i64>, ()>
```

获取全球统计历史（i64）。`data[0]`=今天，`data[1]`=昨天...

#### `get_global_stat_history_f64`

```rust
pub fn get_global_stat_history_f64(&self, name: &str, max_days: usize) -> Result<Vec<f64>, ()>
```

获取全球统计历史（f64）。

---

## 排行榜

### `Leaderboard`

```rust
pub struct Leaderboard(u64);

impl Leaderboard {
    pub fn raw(&self) -> u64;
}
```

### `LeaderboardSortMethod`

```rust
pub enum LeaderboardSortMethod { Ascending, Descending }
```

### `LeaderboardDisplayType`

```rust
pub enum LeaderboardDisplayType { Numeric, TimeSeconds, TimeMilliSeconds }
```

### `UploadScoreMethod`

```rust
pub enum UploadScoreMethod { KeepBest, ForceUpdate }
```

### `LeaderboardDataRequest`

```rust
pub enum LeaderboardDataRequest { Global, GlobalAroundUser, Friends }
```

### `LeaderboardEntry`

```rust
pub struct LeaderboardEntry {
    pub user: SteamId,
    pub global_rank: i32,
    pub score: i32,
    pub details: Vec<i32>,
}
```

### `LeaderboardScoreUploaded`

```rust
pub struct LeaderboardScoreUploaded {
    pub score: i32,
    pub was_changed: bool,
    pub global_rank_new: i32,
    pub global_rank_previous: i32,
}
```

### 排行榜方法

#### `find_leaderboard`

```rust
pub fn find_leaderboard<F>(&self, name: &str, cb: F)
where F: FnOnce(Result<Option<Leaderboard>, SteamError>) + 'static + Send
```

#### `find_or_create_leaderboard`

```rust
pub fn find_or_create_leaderboard<F>(
    &self,
    name: &str,
    sort_method: LeaderboardSortMethod,
    display_type: LeaderboardDisplayType,
    cb: F,
) where F: FnOnce(Result<Option<Leaderboard>, SteamError>) + 'static + Send
```

#### `upload_leaderboard_score`

```rust
pub fn upload_leaderboard_score<F>(
    &self,
    leaderboard: &Leaderboard,
    method: UploadScoreMethod,
    score: i32,
    details: &[i32],
    cb: F,
) where F: FnOnce(Result<Option<LeaderboardScoreUploaded>, SteamError>) + 'static + Send
```

#### `download_leaderboard_entries`

```rust
pub fn download_leaderboard_entries<F>(
    &self,
    leaderboard: &Leaderboard,
    request: LeaderboardDataRequest,
    start: usize,
    end: usize,
    max_details_len: usize,
    cb: F,
) where F: FnOnce(Result<Vec<LeaderboardEntry>, SteamError>) + 'static + Send
```

#### 查询方法

| 方法                             | 签名                                                                                                    | 说明    |
|--------------------------------|-------------------------------------------------------------------------------------------------------|-------|
| `get_leaderboard_display_type` | `fn get_leaderboard_display_type(&self, leaderboard: &Leaderboard) -> Option<LeaderboardDisplayType>` | 显示类型  |
| `get_leaderboard_sort_method`  | `fn get_leaderboard_sort_method(&self, leaderboard: &Leaderboard) -> Option<LeaderboardSortMethod>`   | 排序方法  |
| `get_leaderboard_name`         | `fn get_leaderboard_name(&self, leaderboard: &Leaderboard) -> String`                                 | 排行榜名称 |
| `get_leaderboard_entry_count`  | `fn get_leaderboard_entry_count(&self, leaderboard: &Leaderboard) -> i32`                             | 条目总数  |

---

## 排行榜使用示例

```rust
let stats = client.user_stats();

// 查找/创建排行榜
stats.find_or_create_leaderboard(
    "high_scores",
    LeaderboardSortMethod::Descending,
    LeaderboardDisplayType::Numeric,
    move |result| {
        if let Some(lb) = result.unwrap() {
            // 上传分数
            client.user_stats().upload_leaderboard_score(
                &lb, UploadScoreMethod::KeepBest, 9999, &[],
                |r| println!("上传结果: {:?}", r),
            );

            // 下载排行榜
            client.user_stats().download_leaderboard_entries(
                &lb, LeaderboardDataRequest::Global, 0, 10, 0,
                |entries| {
                    for e in entries.unwrap() {
                        println!("#{} {}: {}", e.global_rank, e.user.raw(), e.score);
                    }
                },
            );
        }
    },
);
```

---

## 统计使用示例

```rust
let stats = client.user_stats();

// 请求用户数据
stats.request_user_stats(current_user_id);

// 客户端注册回调后 run_callbacks...

// 读取统计
let kills = stats.get_stat_i32("kills").unwrap_or(0);
stats.set_stat_i32("kills", kills + 1);

// 解锁成就
stats.achievement("FIRST_BLOOD").set().unwrap();

// 提交
stats.store_stats().unwrap();
```

---

## Callback 事件

### `UserStatsReceived`

```rust
pub struct UserStatsReceived {
    pub steam_id: SteamId,
    pub game_id: GameId,
    pub result: Result<(), SteamError>,
}
```

### `UserStatsStored`

```rust
pub struct UserStatsStored {
    pub game_id: GameId,
    pub result: Result<(), SteamError>,
}
```

### `UserAchievementStored`

```rust
pub struct UserAchievementStored {
    pub game_id: GameId,
    pub achievement_name: String,
    pub current_progress: u32,
    pub max_progress: u32,
}
```

### `UserAchievementIconFetched`

```rust
pub struct UserAchievementIconFetched {
    pub game_id: GameId,
    pub achievement_name: String,
    pub achieved: bool,
    pub icon_handle: i32,
}
```

### `GlobalStatsReceived`

```rust
pub struct GlobalStatsReceived {
    pub game_id: GameId,
    pub result: Result<(), SteamError>,
}
```