document.addEventListener('DOMContentLoaded', function() {
    // 定义高亮应用函数
    function applySyntaxHighlighting() {
        if (typeof hljs !== 'undefined') {
            // 移除现有高亮（避免重复）
            $('#wmd-preview pre code').each(function() {
                $(this).removeClass('hljs');
                $(this).removeAttr('data-highlighted');
            });
            
            // 应用新高亮
            hljs.highlightAll();
        }
    }

    // 导航栏折叠按钮
    document.querySelector('.foldbtn').addEventListener('click', function() {
        const navigator = this.closest('.toolbar');
        navigator.classList.toggle('fold');
    });
    
    // 初始化暗色模式（匹配系统设置）
    function initDarkMode() {
        var storedDarkMode = localStorage.getItem("darkmode");
        if (storedDarkMode === null) {
            // 如果没有修改过，使用系统设置
            darkmodeenabled = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            darkmodeenabled = storedDarkMode === "1";
        }
        toggledarkmode(darkmodeenabled);
    }
    
    // 封装功能函数
    function handlePrint() {
        // 保存当前模式（在打印前）
        var printSavedMode = mode;
        
        // 暂时切换到预览模式（打印前）
        if (mode !== 1) {
            mode = 1;
            $('#wmd-input').hide();
            $('#wmd-preview').show();
            $('body').removeClass('fixedheight');
            $('html').removeClass('fixedheight');
            
            // 刷新预览确保内容最新
            if (editor.refreshPreview !== undefined) {
                editor.refreshPreview();
                applySyntaxHighlighting(); // 应用代码高亮
            }
        }
        
        // 隐藏工具栏
        $('.toolbar').hide();
        
        // 打印后恢复的回调函数
        function afterPrint() {
            // 显示工具栏
            $('.toolbar').show();
            
            // 恢复打印前的模式
            mode = printSavedMode;
            
            // 强制重新应用原始模式
            handleToggleMode();
            handleToggleMode();
            handleToggleMode();
            
            // 移除事件监听器
            window.removeEventListener('afterprint', afterPrint);
        }
        
        // 注册打印完成事件
        window.addEventListener('afterprint', afterPrint);
        
        // 执行打印
        window.print();
    }
    
    function handleSave() {
        var blob = new Blob([$('#wmd-input').val()], {type: 'text'});
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, 'newfile.md');
        }
        else {
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = 'newfile.md';        
            document.body.appendChild(elem);
            elem.click();        
            document.body.removeChild(elem);
        }
    }
    
    function handleToggleMode() {
        mode += 1; 
        if (mode == 3) mode = 0;
        
        if (mode == 1) {
            $('#wmd-input').hide();
            $('#wmd-preview').show();
            $('body').removeClass('fixedheight');
            $('html').removeClass('fixedheight');
            // 确保预览模式应用高亮
            setTimeout(applySyntaxHighlighting, 0);
        }
        else if (mode == 2) {
            $('#wmd-preview').hide();            
            $('#wmd-input').show().css('float', 'none').css('width', '100%').focus();
            $('body').addClass('fixedheight');
            $('html').addClass('fixedheight');
        }
        else {
            $('#wmd-input').show().css('float', 'left').css('width', '50%').focus();
            $('#wmd-preview').show();
            // 确保分割视图应用高亮
            setTimeout(applySyntaxHighlighting, 0);
        }
    }
    
    function handleToggleDarkMode() {
        darkmodeenabled = !darkmodeenabled;
        localStorage.setItem("darkmode", darkmodeenabled ? "1" : "0");
        toggledarkmode(darkmodeenabled);
        // 切换模式后重新应用高亮
        applySyntaxHighlighting();
    }
    
    function handleToggleFont() {
        $('html').toggleClass('texroman');
        // 字体切换后重新应用高亮
        applySyntaxHighlighting();
    }
    
    function handleToggleLatex() {
        latexenabled = !latexenabled;
        localStorage.setItem("latex", latexenabled ? "1" : "0");
        togglemathjax(latexenabled);
    }
    
    function handleOpenFile() {
        $('#openFileInput').click();
    }
    
    // 撤销功能
    function handleUndo() {
        // 检查编辑器是否支持自定义undo操作
        if (editor.undo && typeof editor.undo === 'function') {
            editor.undo();
        } else {
            // 回退方案：execCommand方法
            document.execCommand('undo');
        }
        // 执行撤销后更新预览
        editor.refreshPreview();
    }
    
    // 重做功能
    function handleRedo() {
        // 检查编辑器是否支持自定义redo操作
        if (editor.redo && typeof editor.redo === 'function') {
            editor.redo();
        } else {
            // 回退方案：execCommand方法
            document.execCommand('redo');
        }
        // 执行重做后更新预览
        editor.refreshPreview();
    }
    
    // 为按钮添加事件监听器
    function setupButtonListeners() {
        // 打印 (Ctrl+P)
        $('#cp').on('click', handlePrint);
        // 保存 (Ctrl+S)
        $('#cs').on('click', handleSave);
        // 切换模式 (Ctrl+D)
        $('#cd').on('click', handleToggleMode);
        // 切换暗色模式 (Ctrl+Shift+D)
        $('#csd').on('click', handleToggleDarkMode);
        // 切换字体 (Ctrl+Shift+R)
        $('#csr').on('click', handleToggleFont);
        // 切换LaTeX (Ctrl+Shift+L)
        $('#csl').on('click', handleToggleLatex);
        // 打开文件 (Ctrl+Shift+O)
        $('#cso').on('click', handleOpenFile);
        // 撤销按钮 (Ctrl+Z)
        $('#undo-btn').on('click', handleUndo);
        // 重做按钮 (Ctrl+Y)
        $('#redo-btn').on('click', handleRedo);
    }
    
    // 原始函数保持不变
    togglemathjax = function(enabled) {
        if (enabled) {
            if (!latexenabledonce)
            {
                MathJax.Hub.Config(
    {"HTML-CSS": { preferredFont: "TeX", availableFonts: ["STIX","TeX"], linebreaks: { automatic: true }, EqnChunk: (MathJax.Hub.Browser.isMobile ? 10 : 50) },
     tex2jax: { inlineMath: [ ["$", "$"], ["\\\$","\\\$"] ], displayMath: [ ["$$","$$"], ["\$$", "\$$"] ], processEscapes: true, ignoreClass: "tex2jax_ignore|dno" },
     TeX: {  noUndefined: { attributes: { mathcolor: "red", mathbackground: "#FFEEEE", mathsize: "90%" } }, Macros: { href: "{}" } },
     messageStyle: "none", skipStartupTypeset: true });
                mjpd1.mathjaxEditing.prepareWmdForMathJax(editor, '', [["$", "$"]]);
                latexenabledonce = true;
                if (editor.refreshPreview !== undefined) {
                    editor.refreshPreview();
                    // MathJax渲染完成后应用高亮
                    setTimeout(applySyntaxHighlighting, 300);
                }
            }
            else {
                MathJax.Hub.queue.pending = 0;
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, "wmd-preview"], function() {
                    // MathJax渲染完成后应用高亮
                    setTimeout(applySyntaxHighlighting, 0);
                });
            }
        }
        else {
            MathJax.Hub.queue.pending = 1; 
            if (editor.refreshPreview !== undefined) {
                editor.refreshPreview();
                // 禁用LaTeX后应用高亮
                setTimeout(applySyntaxHighlighting, 0);
            }
            else {
               MathJax.Hub.Config({ skipStartupTypeset: true });
            }
        }
    }
    
    toggledarkmode = function(enabled){
        $('body').toggleClass('dark-mode',enabled);
        // 在暗色模式切换后应用高亮
        applySyntaxHighlighting();
    }
    
    if (localStorage.getItem("writing") !== null) {
        $('#wmd-input').val(localStorage.getItem("writing"));
    }
        
    openFile = function(e) {         
      readFile(e.target.files[0]);
    }
    
    readFile = function(file){
      if (!file) {
        return;
      }
      var reader = new FileReader();
      reader.onload = function(e) {
        var contents = e.target.result;
        $('#wmd-input').val(contents);
        editor.refreshPreview();
        // 文件加载后应用高亮
        applySyntaxHighlighting();
      };
      reader.readAsText(file);
    }
    
    document.getElementById('openFileInput').addEventListener('change', openFile, false);
    
    $('body').on('drag dragstart dragend dragover dragenter dragleave drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
      })
      .on('drop', function(e) {
        readFile(e.originalEvent.dataTransfer.files[0]);
    });
    
    $('#wmd-input').on('input', function() {
        localStorage.setItem("writing", $('#wmd-input').val());
        // 延迟应用高亮以适应Markdown解析
        setTimeout(applySyntaxHighlighting, 200);
    });
    
    $('#wmd-input').focus();
    
    $('#helpicon').click(function() {
        $('#help').show();
        // 显示帮助时应用高亮
        setTimeout(applySyntaxHighlighting, 0);
    });
    
    $('#closeicon, #wmd-input, #wmd-preview').click(function() {
        $('#help').hide();
    });
    
    // 修改后的快捷键处理
    $(document).on('keydown', function(e) {
        // 撤销 (Ctrl+Z)
        if (e.keyCode == 90 && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
            handleUndo();
            e.preventDefault();
            return false;
        }
        // 重做 (Ctrl+Y 或 Ctrl+Shift+Z)
        else if ((e.keyCode == 89 && (e.ctrlKey || e.metaKey)) || 
                 (e.keyCode == 90 && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
            handleRedo();
            e.preventDefault();
            return false;
        }
        else if (e.keyCode == 80 && (e.ctrlKey || e.metaKey)) {    // CTRL+P 
            handlePrint();
            e.preventDefault();
            return false;
        }
        else if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {    // CTRL+S
            handleSave();
            e.preventDefault();
            return false;
        }
        else if (e.keyCode == 68 && (e.ctrlKey || e.metaKey) && !e.shiftKey) {    // CTRL+D
            handleToggleMode();
            e.preventDefault();
            return false;
        }        
        else if (e.keyCode == 72 && (e.ctrlKey || e.metaKey) && e.shiftKey) {    // CTRL+SHIFT+H
            $('#help').show();
            e.preventDefault();
            return false;
        }
        else if (e.keyCode == 68 && (e.ctrlKey || e.metaKey) && e.shiftKey) {    // CTRL+SHIFT+D
            handleToggleDarkMode();
            e.preventDefault();
            return false;
        }
        else if (e.keyCode == 76 && (e.ctrlKey || e.metaKey) && e.shiftKey) {    // CTRL+SHIFT+L 
            handleToggleLatex();
            e.preventDefault();
            return false;
        }
        else if (e.keyCode == 79 && (e.ctrlKey || e.metaKey) && e.shiftKey) {    // CTRL+SHIFT+O
            handleOpenFile();
            e.preventDefault();
            return false;
        } 
        else if (e.keyCode == 27)  { // ESC
            $('#help').hide();
        }
    });
    
    // 初始化
    var mode = 0;
    var latexenabledonce = false;
    var latexenabled = localStorage.getItem("latex") !== "0";
    var converter = Markdown.getSanitizingConverter();
    Markdown.Extra.init(converter);
    var editor = new Markdown.Editor(converter, '');
    var mjpd1 = new mjpd();
    
    // 覆盖原refreshPreview方法以确保应用高亮
    var originalRefreshPreview = editor.refreshPreview;
    editor.refreshPreview = function() {
        if (originalRefreshPreview) {
            originalRefreshPreview.apply(this, arguments);
        }
        // 确保DOM更新后应用代码高亮
        setTimeout(applySyntaxHighlighting, 0);
    };
    
    initDarkMode();  // 初始暗色模式
    togglemathjax(latexenabled);
    setupButtonListeners();  // 设置按钮监听器
    editor.run();
    
    // 初始加载后应用高亮
    setTimeout(applySyntaxHighlighting, 500);
});