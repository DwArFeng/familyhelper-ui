# Compile By Source - 从源码编译

## 准备依赖

该项目的所有依赖均在中央仓库下，因此无需额外准备依赖，但您仍然可以使用其它仓库，以满足您的需求。

### 使用其它仓库

您可以在 `settings.xml` 中添加如下配置，以使用其它仓库，通常 `settings.xml` 在 `$HOME/.m2/` 文件目录下。

```xml

<settings
        xmlns="http://maven.apache.org/SETTINGS/1.0.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
        http://maven.apache.org/xsd/settings-1.0.0.xsd"
>

    <servers>
        <server>
            <id>xxx-releases</id>
            <username>your-username-here</username>
            <password>your-password-here</password>
        </server>
        <server>
            <id>rdc-snapshots</id>
            <username>your-username-here</username>
            <password>your-password-here</password>
        </server>
    </servers>

    <profiles>
        <profile>
            <id>xxx</id>
            <properties>
                <altReleaseDeploymentRepository>
                    xxx-releases::default::https://your-repository-url-here/
                </altReleaseDeploymentRepository>
                <altSnapshotDeploymentRepository>
                    xxx-snapshots::default::https://your-repository-url-here/
                </altSnapshotDeploymentRepository>
            </properties>
        </profile>
    </profiles>

    <activeProfiles>
        <activeProfile>xxx</activeProfile>
    </activeProfiles>
</settings>
```

## 下载源码

使用 git 进行源码下载。

```shell
git clone git@github.com:DwArFeng/familyhelper-ui.git
```

对于中国用户，可以使用 gitee 进行下载。

```shell
git clone git@gitee.com:dwarfeng/familyhelper-ui.git
```

## 项目编译、打包

进入项目根目录，执行 maven 命令。

```shell
mvn clean package
```

如果上述命令执行失败，请仔细阅读报错内容，并依据报错内容针对性地解决问题。请您重复上述步骤，直到编译成功。

## 寻找打包后的目标文件

找到打包后的目标文件

```
familyhelper-ui-distribute/target/familyhelper-ui-distribute-${version}-release/
```

如能找到该文件，则说明编译成功。
