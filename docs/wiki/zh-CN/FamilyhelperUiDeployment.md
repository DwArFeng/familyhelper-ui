# Familyhelper UI - 分发包部署与初始化

本文面向 Familyhelper UI 的部署和运维人员，说明如何将 Maven 生成的分发产物部署到 Tomcat，
以及如何完成外置日志配置、WAR 发布和基础运行检查。

分发包中的 `familyhelper-ui.war` 提供 Web 应用，`conf/familyhelper-ui` 提供 WAR 启动时读取的外置配置。
部署时需要将两部分分别放入同一个 Tomcat 实例的 `webapps` 和 `conf` 目录，不能只复制 WAR。

## 适用范围

本文适用于项目生成或正式发布的 `familyhelper-ui-distribute-${version}-release.tar.gz` 分发包，
以及以 JRE 1.8、Tomcat 9.0.x 运行该分发包的 Windows 10 或 CentOS 7 环境。

本文使用 `${CATALINA_BASE}` 表示目标 Tomcat 实例的运行目录。
当 `CATALINA_HOME` 与 `CATALINA_BASE` 分离时，应使用实际实例的 `${CATALINA_BASE}`，
因为应用配置、WAR、工作目录和运行日志均属于实例目录。

本文不覆盖以下内容：

- 从源码安装依赖和执行 Maven 构建，相关流程见 [Compile By Source - 从源码编译](./CompileBySource.md)。
- `familyhelper-webapi`、各业务微服务及注册中心的部署。
- 数据库建库、数据迁移、默认账号和业务数据初始化。
- 反向代理、HTTPS 证书、负载均衡和 Tomcat 集群配置。

Familyhelper UI 的生产前端默认访问 `/familyhelper-webapi/api/v1`。
因此，UI 页面和静态资源可访问只表示当前 WAR 部署成功；完整业务功能仍依赖 Web API 和下游服务。

## 分发包结构

解压 `familyhelper-ui-distribute-${version}-release.tar.gz` 后，归档内的版本化目录结构如下：

```text
familyhelper-ui-distribute-${version}/
├── conf/
│   └── familyhelper-ui/
│       └── logging/
│           ├── README.md
│           ├── settings.xml
│           ├── settings-ref-linux.xml
│           └── settings-ref-windows.xml
├── webapps/
│   └── familyhelper-ui.war
├── README.md
├── CHANGELOG.md
└── LICENSE
```

各部分用途如下：

- `conf/familyhelper-ui/logging`：应用的外置日志配置及不同操作系统的参考配置。
- `webapps/familyhelper-ui.war`：包含 PC 端、移动端静态资源和 Web 容器配置的部署文件。
- `README.md`：项目简介及基本打包、配置和部署说明。
- `CHANGELOG.md`：版本变更记录，升级前可用于确认行为和兼容性变化。
- `LICENSE`：项目许可证。

发布包顶层的 `conf` 和 `webapps` 是迁移来源，不是一个可直接替代 `${CATALINA_BASE}` 的完整 Tomcat 目录。

## 部署前准备

部署前应完成以下检查：

1. 根据 [System Requirements - 系统需求](./SystemRequirements.md) 准备 JRE 1.8 和 Tomcat 9.0.x。
2. 确认 `${CATALINA_BASE}` 指向本次部署的 Tomcat 实例，而不是其它实例或仅包含程序文件的 `CATALINA_HOME`。
3. 确认 Tomcat Connector 使用的 HTTP 或 HTTPS 端口未被其它进程占用，并允许目标客户端访问。
4. 确认运行 Tomcat 的用户可以读取 `${CATALINA_BASE}/conf/familyhelper-ui` 和 WAR 文件，
   并可以写入 `${CATALINA_BASE}/webapps`、`${CATALINA_BASE}/work`、`${CATALINA_BASE}/temp` 及配置的日志目录。
5. 首次部署时确认目标路径不存在同名但来源不明的配置或 WAR；升级部署时先备份现有配置和部署文件。
6. 根据操作系统和日志保留要求确定 `settings.xml` 中的控制台编码、日志目录、滚动大小、保留数量和保留时间。
7. 如果需要完整业务验证，确认 `/familyhelper-webapi` 对应的 Web API 已部署，或由反向代理转发到可用服务。

升级前至少应备份以下内容：

```text
${CATALINA_BASE}/conf/familyhelper-ui/
${CATALINA_BASE}/webapps/familyhelper-ui.war
${CATALINA_BASE}/webapps/familyhelper-ui/
```

其中最后一个目录只会在 Tomcat 展开 WAR 时存在。
日志目录通常包含运行审计信息，不应把删除日志作为清理旧版本的步骤。

## 解压与目录配置

将发布归档解压到 Tomcat 目录之外的临时发布位置，然后检查以下文件是否齐全：

```text
conf/familyhelper-ui/logging/settings.xml
webapps/familyhelper-ui.war
README.md
CHANGELOG.md
LICENSE
```

部署时只迁移发布包中的 `conf/familyhelper-ui` 和 `webapps/familyhelper-ui.war`：

```text
<发布包>/conf/familyhelper-ui
    -> ${CATALINA_BASE}/conf/familyhelper-ui

<发布包>/webapps/familyhelper-ui.war
    -> ${CATALINA_BASE}/webapps/familyhelper-ui.war
```

首次部署可以复制完整的 `conf/familyhelper-ui` 目录。
升级部署不能直接覆盖环境已调整的 `settings.xml`；应先比较新旧文件，保留当前环境的路径、编码和保留策略，
再合并新版本确实需要的配置变化。

### conf 目录

配置部署完成后的目标结构应为：

```text
${CATALINA_BASE}/conf/
└── familyhelper-ui/
    └── logging/
        ├── README.md
        ├── settings.xml
        ├── settings-ref-linux.xml
        └── settings-ref-windows.xml
```

WAR 的 `web.xml` 在应用启动时读取固定位置 `conf/familyhelper-ui/logging/settings.xml`。
项目部署约定要求该相对路径位于 `${CATALINA_BASE}` 下，因此目录层级和文件名必须保持不变。

只有 `settings.xml` 是实际生效的日志配置。
`settings-ref-linux.xml` 和 `settings-ref-windows.xml` 仅用于提供操作系统相关的参考值，直接修改参考文件不会改变运行配置。
需要采用参考配置时，应将所需内容合并到 `settings.xml`。

当前配置中的主要差异如下：

- 默认 `settings.xml` 使用 UTF-8 控制台编码，日志目录为相对路径 `logs/familyhelper-ui`。
- Linux 参考配置使用 UTF-8 控制台编码，日志目录为绝对路径 `/var/log/tomcat/familyhelper-ui`。
- Windows 参考配置使用 GBK 控制台编码，日志目录为相对路径 `logs/familyhelper-ui`。

使用绝对日志路径时，应提前创建目录并授予 Tomcat 运行用户写权限。
使用相对日志路径时，其最终位置受 Tomcat 进程工作目录影响，部署后必须通过实际生成位置确认。
日志配置在 Web 应用启动时加载，修改后应重启或重新部署应用再验证。

完整配置项说明见 [ConfDirectory - 配置目录](./ConfDirectory.md)。

### webapps 目录

分发包中的 WAR 来源于 `familyhelper-ui-node` 模块，Maven 构建会把 PC 端和移动端产物分别装入 WAR 的：

```text
WEB-INF/ui/pc/
WEB-INF/ui/mobile/
```

部署目标必须保持为：

```text
${CATALINA_BASE}/webapps/familyhelper-ui.war
```

不要把 WAR 重命名为带版本号的名称，也不要直接改为 `ROOT.war`。
PC 和移动端构建产物的基础资源路径分别固定为 `/familyhelper-ui/ui/pc/` 和 `/familyhelper-ui/ui/mobile/`，
WAR 文件名对应的 `/familyhelper-ui` 上下文与这些路径一致。改变上下文名称会导致页面入口或静态资源请求路径不匹配。

Tomcat 是否把 WAR 展开为 `${CATALINA_BASE}/webapps/familyhelper-ui`，取决于目标 Host 的部署和 `unpackWARs` 配置。
未出现展开目录不一定表示部署失败，应以 Tomcat 启动日志和 HTTP 访问结果为准。

## Tomcat 部署

首次部署和升级部署都应在维护窗口内按以下顺序操作：

1. 确认目标 `${CATALINA_BASE}`、Connector 端口和 Tomcat 运行用户。
2. 使用该环境既有的服务管理方式或 Tomcat 脚本停止实例，并确认进程已经退出。
3. 备份 `${CATALINA_BASE}/conf/familyhelper-ui`、现有 WAR，以及存在时的展开目录。
4. 将发布包中的 `conf/familyhelper-ui` 部署到 `${CATALINA_BASE}/conf`，并按当前环境调整 `settings.xml`。
5. 升级部署时删除旧的 `${CATALINA_BASE}/webapps/familyhelper-ui` 展开目录，避免已经从新 WAR 删除的旧资源继续残留。
6. 如果曾出现旧 JSP、旧类或旧静态资源持续生效，可清理该应用对应的 Tomcat 工作缓存。
   默认 Engine 和 Host 下通常位于 `${CATALINA_BASE}/work/Catalina/localhost/familyhelper-ui`；
   实际目录应以目标 Tomcat 的 `server.xml` 中 Engine 和 Host 名称为准。
7. 将新的 `familyhelper-ui.war` 复制到 `${CATALINA_BASE}/webapps/familyhelper-ui.war`。
8. 检查配置、WAR 和日志目录的属主与权限，再启动 Tomcat。
9. 持续观察 Tomcat 控制台、服务日志或 `${CATALINA_BASE}/logs`，确认 WAR 部署完成且没有配置解析、权限或类加载错误。
10. 查看 `settings.xml` 指定的应用日志目录，确认日志配置已经加载并能够写入。

清理展开目录和工作缓存前必须先停止 Tomcat，并确认目标确实属于 `familyhelper-ui`。
不要删除 `${CATALINA_BASE}/conf/familyhelper-ui` 或应用日志目录来处理缓存问题。

## 初始化检查

以下示例使用 `http://<host>:<port>` 表示 Tomcat 的外部访问地址。
如果部署在 HTTPS 或反向代理之后，应替换为实际对外地址，但应用上下文仍应为 `/familyhelper-ui`。

### 页面与静态资源

依次访问以下地址：

```text
http://<host>:<port>/familyhelper-ui/
http://<host>:<port>/familyhelper-ui/ui/pc/index.html
http://<host>:<port>/familyhelper-ui/ui/mobile/index.html
```

根地址由 `index.jsp` 根据浏览器平台跳转到 PC 或移动端入口。
直接访问两个入口可以绕过平台判断，分别检查两套构建产物。

使用浏览器开发者工具或 HTTP 检查工具确认：

- 根页面和两个 `index.html` 返回成功状态，而不是 404 或 500。
- 页面引用的脚本、样式、图片和字体返回 2xx 或有效缓存状态，没有集中出现 404。
- PC 资源位于 `/familyhelper-ui/ui/pc/`，移动端资源位于 `/familyhelper-ui/ui/mobile/`。
- 页面能够进入应用初始化或登录界面，没有因资源加载失败而保持空白。

### 配置与日志

检查 Tomcat 启动日志中是否存在 `log4jConfiguration`、`settings.xml`、XML 解析或目录权限相关错误。
随后检查 `settings.xml` 中 `rolling_file.dir` 指向的位置。
默认配置会使用 `debug.log`、`info.log`、`warn.log` 和 `error.log` 等滚动日志文件；
具体生成情况取决于启动过程产生的日志级别。

确认运行用户可以创建和更新日志，并确认实际目录、编码、滚动大小和保留时间符合部署环境要求。

### 业务请求

页面静态资源正常后，再观察浏览器网络请求。
生产构建默认访问 `/familyhelper-webapi/api/v1`；如果这些请求失败，应分别检查 Web API 部署、反向代理和下游服务，
不要把后端接口失败直接判断为 `familyhelper-ui.war` 部署失败。

## 日志与运行问题

### Tomcat 未部署 WAR

先检查 Tomcat 启动日志中与 `familyhelper-ui.war` 相关的异常，确认 JRE 和 Tomcat 版本符合要求，
并确认运行用户能够读取 WAR、写入 `webapps`、`work` 和 `temp`。

如果 `unpackWARs` 被关闭，Tomcat 不生成展开目录属于正常配置行为；应继续使用 HTTP 地址判断应用是否已经发布。

### 页面整体返回 404

确认 WAR 的目标名称为 `familyhelper-ui.war`，并确认请求上下文为 `/familyhelper-ui`。
同时检查 WAR 是否被复制到了当前运行实例的 `${CATALINA_BASE}/webapps`，而不是其它 Tomcat 实例。

### 页面入口存在但静态资源返回 404

检查 WAR 是否被重命名、反向代理是否移除了 `/familyhelper-ui` 上下文，
以及浏览器请求是否分别位于 `/familyhelper-ui/ui/pc/` 或 `/familyhelper-ui/ui/mobile/`。
升级后出现旧资源时，检查旧展开目录、应用工作缓存和浏览器缓存。

### 日志配置未生效

确认实际文件是 `${CATALINA_BASE}/conf/familyhelper-ui/logging/settings.xml`，而不是只修改了 `settings-ref-*.xml`。
检查 `settings.xml` 是否为有效 XML，并在修改后重启或重新部署应用。

WAR 内还包含用于早期启动的控制台日志配置。
因此，外置配置路径错误时应优先查看 Tomcat 控制台或服务日志中的 Log4j 初始化信息，不能仅以应用日志目录为空判断没有异常。

### 应用日志无法写入

检查 `rolling_file.dir` 的最终路径、目录是否存在以及 Tomcat 运行用户的写权限。
对于相对路径 `logs/familyhelper-ui`，还应确认 Tomcat 进程的实际工作目录；
对于 `/var/log/tomcat/familyhelper-ui` 等绝对路径，应检查其上级目录权限。

### Tomcat 无法启动或端口不可用

检查 `${CATALINA_BASE}/conf/server.xml` 中 Connector 的端口及 Tomcat 启动日志。
端口占用、XML 配置错误和 JRE 不兼容都发生在应用页面检查之前，应先恢复 Tomcat 实例本身的正常启动状态。

### 页面可打开但业务数据加载失败

在浏览器网络面板中区分 UI 静态资源请求与 `/familyhelper-webapi/api/v1` 请求。
如果只有后者失败，继续检查 Web API、认证、反向代理和下游服务；这些内容不由当前分发包初始化。

## 参阅

- [System Requirements](./SystemRequirements.md) - 系统需求，说明推荐的操作系统、JRE 和 Tomcat 版本。
- [Compile By Source](./CompileBySource.md) - 从源码编译，说明 Maven 构建和分发产物位置。
- [ConfDirectory](./ConfDirectory.md) - 配置目录，说明日志配置文件、参数和参考配置的使用方式。
