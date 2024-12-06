# familyhelper-ui-view

家庭助手的前端界面。

## 项目结构

该项目是一个 monorepo 项目，使用 pnpm workspace 管理，所有的 package 都在 `packages` 目录下。

`packages` 目录下的项目可以分为以下几类：

- `component-*`：组件包，提供一些通用的组件，供 webapp 使用，不同的组件可能会存在依赖关系。
- `webapp-*`：webapp 包，提供一个完整的 webapp，使用 `component-*` 提供的组件，一般来说， webapp 包相互之间不会有依赖关系。

## 项目初始化

1. 使用 `pnpm` 安装依赖。

   ```shell
   pnpm install --frozen-lockfile
   ```

   **需要注意的是，该项目使用 pnpm 作为包管理工具，因此只能使用 pnpm 安装依赖，而不能使用 npm 或者 yarn。**

2. 项目构建。

   ```shell
   pnpm run build
   ```

   该命令会构建所有的包，**需要注意的是，由于部分 webapp 包依赖组件包编译后的文件，因此安装完依赖后，必须执行该命令，
   否则可能导致 webapp 包无法正常 serve。**
