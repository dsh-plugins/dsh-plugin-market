<div align="center">

![Banner](./docs/banner.png)

# dsh-plugin-market

**DeepSeek Harness 结构化插件市场 —— 每个插件以 JSON 描述，自动聚合为单一 `plugins.json` 供 dsh-plugins.github.io 站点消费。**

[English](README.md) | 简体中文

</div>

## 目录结构

```
plugins/                  # 每个插件一个 JSON 描述文件
  dsh-plugins-<id>.json
scripts/
  aggregate.mjs           # 聚合脚本：plugins/*.json → plugins.json
plugins.json              # 聚合产物（由 workflow 自动维护）
.github/workflows/
  aggregate.yml           # push 到 plugins/ 时聚合 + 通知站点仓库
```

## 插件描述格式

```jsonc
{
  "id": "@dsh-plugin/dsh-auxiliary",        // 插件唯一 id（npm 包名或 github:owner/repo）
  "name": "DSH Auxiliary",                  // 展示名
  "description": [                          // 多语言描述（可省略，或直接给字符串）
    { "language": "en-US", "content": "..." },
    { "language": "zh-CN", "content": "..." }
  ],
  "support_versions": ">=0.1.0-rc.6",       // 支持的 dsh 版本（semver range 或版本数组）
  "urls": {                                 // 项目链接（可省略）
    "homepage": "https://github.com/dsh-plugins/dsh-auxiliary",
    "repository": "https://github.com/dsh-plugins/dsh-auxiliary",
    "issues": "https://github.com/dsh-plugins/dsh-auxiliary/issues"
  },
  "relationship": [                         // 依赖/冲突关系（可省略）
    { "type": "dependency", "id": "@dsh-plugin/dsh-loader", "versions": ">=1.3.0" },
    { "type": "incompatibility", "id": "@dsh-plugin/dsh-auxiliary", "versions": "*" }
  ]
}
```

### 字段说明

- `id` — **必填**。插件唯一标识：npm 包名（`@scope/name`）或
  `github:owner/repo`。
- `name` — **必填**。人类可读的插件名。
- `description` — 可选。字符串或 `{language, content}[]` 多语言数组。
- `support_versions` — 可选。semver range 字符串（`>=0.1.0-rc.6`）、
  interval（`[0.1.0-rc.6, 0.1.1)`）或版本数组（`["0.1.0-rc.6","0.1.0-rc.7"]`）。
  缺省表示任意版本。
- `urls` — 可选。`{homepage, repository, issues}` 链接。
- `relationship` — 可选。`{type, id, versions}[]`，`type` ∈
  `dependency` | `incompatibility`，`versions` 为 semver range，
  `*` 表示任意版本。

### 版本号规则

`support_versions` 与 `relationship[].versions` 中的版本号写法取决于
`id` 的类型：

- **npm 包 id**（`@scope/name`）—— 使用 npm 版本号（如 `>=1.3.0`、
  `^0.14.0`）。
- **GitHub id**（`github:owner/repo`）—— 使用 git tag（`v1.3.0`）或
  commit hash（短哈希长哈希均可，如 `dac813a`）。

## 工作流

1. 向 `plugins/` 新增或修改插件 JSON 并 push 到 `main`；
2. `aggregate.yml` 自动聚合出 `plugins.json` 并提交回仓库；
3. 通过 `repository_dispatch`（事件类型 `plugins-updated`）通知
   `dsh-plugins/dsh-plugins.github.io`；
4. 站点仓库的 `sync-plugins.yml` 拉取 `plugins.json` 写入
   `public/api/plugins.json` 并推送，触发其 Pages 部署。

> 通知站点仓库需要 `PLUGIN_MARKET_PAT`（一个拥有 `dsh-plugins.github.io`
> 仓库 `contents: write` 权限的 Personal Access Token），配置在仓库
> Settings → Secrets and variables → Actions。
>
> 创建步骤：GitHub → Settings → Developer settings → Personal access
> tokens → Fine-grained tokens → Generate new token → 仅勾选
> `dsh-plugins/dsh-plugins.github.io` 仓库，Repository permissions 里
> `Contents: Read and write` → 生成后复制 token → 在本仓库
> Settings → Secrets and variables → Actions → New repository secret
> 命名为 `PLUGIN_MARKET_PAT` 粘贴保存。
>
> 配置 `PLUGIN_MARKET_PAT` 后，每次向 `plugins/` 推送，站点仓库会自动
> 同步并部署，无需手动触发。
