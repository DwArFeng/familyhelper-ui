<%--
  Created by IntelliJ IDEA.
  User: 91572
  Date: 2019/10/19
  Time: 21:28
  To change this template use File | Settings | File Templates.
--%>

<%--JSP 文件的解析器仍然在使用 navigator.platform，因此忽略相关的警告--%>
<%--suppress JSDeprecatedSymbols--%>
<script type="text/javascript">
    const p = navigator.platform;
</script>

<script type="text/javascript">
    const system = {};
    system.win = p.indexOf("Win") === 0;
    system.mac = p.indexOf("Mac") === 0;
    system.x11 = (p === "X11") || (p.indexOf("Linux") === 0);
    //如果是电脑跳转到pc端页面
    if (system.win || system.mac || system.x11) {
        window.location.href = "ui/pc/index.html";
    }
    //如果是手机,跳转到mobile端页面
    else {
        window.location.href = "ui/mobile/index.html";
    }
</script>
