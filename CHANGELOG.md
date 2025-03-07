# ChangeLog

### Release_3.0.0_20250307_build_A

#### 功能构建

- `component-util` 子模块建立。
  - 编写通用工具函数。
  - 构建模块初始结构。

- `component-api` 子模块优化。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `component-iconfont` 子模块优化。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `component-ckeditor` 子模块优化。
  - 添加 `@ckeditor/ckeditor5-core`，消除模块打包时的警告输出。
  - 建立构建脚本格式化机制。
  - 建立代码格式化机制。
  - 建立代码检查机制。

- `component-api` 子模块回归。

- `component-iconfont` 子模块回归。

- `component-ckeditor` 子模块回归。

- 优化 `familyhelper-ui-view` 模块打包机制。
  - 将打包机制由 `build -> lint` 更改为 `build -> check`，允许子模块引入更多的检查机制。
  - 修改对应的构建脚本。

- 建立 `familyhelper-ui-view` 模块构建脚本格式化机制。

#### Bug修复

- 修复 `familyhelper-ui-view` 模块的脚本 bug。
  - 修复 `packages` 目录不存在时无法执行 pnpm 指令的 bug。

#### 功能移除

- 移除 `familyhelper-ui-view` 模块旧版本 `packages` 目录。

---

### 更早的版本

[View all changelogs](./changelogs)
