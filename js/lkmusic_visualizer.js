//注意此版本是支持音乐可视化的版本如果不需要音乐可视化的话那么可以使用lkmusic.js这个没有使用到AudioContext这个音频接口版本的js
//此版本完全使用audiocontext来进行的
//自用工具库
var whenReady = (function(){
    var ready = false;
    var funcs = [];//存储函数的数组
    function handler(e){
        if(ready) return;
        if(e.type === 'readystatechange' && document.readyState !== 'commplete'){
            return;
        }
        for(var i=0;i<funcs.length;i++){
              funcs[i].call(document);
        }
        //进行标记
        ready  = true;
        funcs = null;//置空
    }
    if(document.addEventListener){
         document.addEventListener('DOMContentLoaded', handler,false);
         document.addEventListener('readystatechange', handler,false);
         window.addEventListener('load',handler,false);
    }else{
        //兼容IE等不支持addEventListener方法的浏览器
        document.attachEvent('onreadystatechange',handler);
        window.attachEvent('onload',handler);
    }
    return function isReady(f){

        if(ready){
             f.call(document);
        }else{
            funcs.push(f);
        }
    }
}());
//基于smusic开源代码进行修改和加强
(function(win,lkMusic,WaveSurfer){ 
  //此音乐库采用全新的html5 api来对样式的增删改查进行操作 ie版本需要10.0以上 使用此音乐类库请特别注意低版本ie 已不再我的兼容列表里面
  //至于为什么使用classList这个新的api 请参见张兴旭的一篇文章 http://www.zhangxinxu.com/wordpress/2013/07/domtokenlist-html5-dom-classlist-%E7%B1%BB%E5%90%8D/
  //修正一下 实现了操作元素样式的操作类classList默认使用原生支持的api 否则使用模拟的api来进行实现
  function classList(e){
    if(e.classList){
        //这里需要对classList的原生api进行一下加强
        /*
        DOMTokenList.prototype.adds = function(tokens){
            tokens.split(' ').forEach(function(token){
                 this.add(token);
            });
            return this;
        };*/
        return e.classList;
    }//如果原生支持classList这个api那么直接返回
    else return new CSSClassList(e);//否则就伪造一个
  }
  //CSSClassList 是一个模拟DOMTokenList的javascript类
  function CSSClassList(e){
    this.e = e;
  }
  //如果e.className 包含类名c则返回true；否则返回false
  CSSClassList.prototype.contains=function(c){
      if(c.length ===0 || c.indexOf(' ')!==-1){
        throw new Error("invalid class name: '"+c+"'");
      }
      //首先是常规检查
      var classes = this.e.className;
      if(!classes) return false;//e不含类名
      if(classes === c) return true;//e有一个完全匹配的类名
      //否则，把c自身看成一个单词,利用正则表达式搜索
      //\b在正则表达式里面代表单词的边界
      return classes.search('\\b'+c+'\\b') !== -1;
  };
  //如果c不存在，将c添加到e.className中
  CSSClassList.prototype.add = function(c){
    if(this.contains(c)) return;//如果存在就直接返回 不需要再新增一个
    var classes = this.e.className;
    if(classes && classes[classes.length-1] !== ' '){
        c = ' '+c;//如果没有空格需要加上一个空格
    }
    this.e.className +=c;
  };
  //将在e.className中出现的c全部删除
  CSSClassList.prototype.remove =function(c){
    if(!this.contains(c))return;//如果类里面本来就没有就直接返回
    //将所有作为单词的c和多余的尾随空格全部删除
    var pattern = new RegExp('\\b'+c+'\\b\\s*','g');
    this.e.className = this.e.className.replace(pattern,'');
  };
  //如果c不存在，将c添加到e.className中，并且返回true
  //如果c存在，那么将在e.className中出现的所有c都删除，并返回false
  CSSClassList.prototype.toggle=function(c){
     if(this.contains(c)){//如果e.className 包含c
        this.remove(c); //删除它
        return false;
     }else{
        //否则的话
        this.add(c);//否则就添加c
        return true;
     }
  };
  //返回 e.className本身
  CSSClassList.prototype.toString = function(){
    return this.e.className;
  };
  //返回e.className 中的类名 是一个数组
  CSSClassList.prototype.toArray = function(){
    return this.e.className.match(/\b\w+\b/g) || [];
  }
  //禁用右键菜单函数
  function forbidenRightMenu(){
    document.oncontextmenu=function(){
         return false;
    }
    document.onmousedown=function(){

    }
  }
  //实现链式调用
  /**
   * 实现基于jquery的链式调用
   * @AuthorHTL
   * @DateTime  2016-04-08T14:46:18+0800
   * @param     {[type]}                 query [description]
   * @return    {[type]}                       [description]
   */
  function $(query){
     return document.querySelector(query);
  }
  //实现基本拓展
  /**
   * 实现继承
   * @AuthorHTL
   * @DateTime  2016-04-08T14:46:43+0800
   * @param     {[type]}                 o [description]
   * @param     {[type]}                 p [description]
   * @return    {[type]}                   [description]
   */
  function extend(o,p){
    for(prop in p){
      if(p.hasOwnProperty(prop)){
        o[prop] = p[prop];
      }
    }
    return o;
  }
  //实现计算时间
  /**
   * 对时间进行格式化
   * @AuthorHTL
   * @DateTime  2016-04-08T14:45:31+0800
   * @param     {[type]}                 time [description]
   * @return    {[type]}                      [description]
   */
  function calctime(time){
        var hours,minutes,seconds,timer='';
        hours = String(parseInt(time / 3600));
        minutes = String(parseInt((time % 3600)/60));
        seconds = String(parseInt((time % 60)));
        if(hours !== '0'){
            if(hours.length === 1) hours ='0'+hours;
            timer+=(hours+':');
        }
        if(minutes.length === 1 ){
            minutes ='0'+minutes;
        }
        timer+=(minutes+":");
        if(seconds.length === 1){
             seconds = '0'+seconds;
        }
        timer+=seconds;
        return timer;
  }
  //var cover =classList($('.u-cover')).remove('u-cover'); //测试代码
  //实现兼容各个浏览器的XMLHttpRequest
  if(win.XMLHttpRequest === undefined){
     win.XMLHttpRequest = function(){
        try{
             return new ActiveXObject('Msxml2.XMLHTTP.6.0');
        }catch(e1){
             try{
                return new ActiveXObject('Msxml2.XMLHTTP.3.0');
             }catch(e2){
                //否则就出错了
                throw new Error('XMLHttpRequset is not supported!');
             }
        }
     };
  }
  //实现简单的ajax操作
  /**
   * 简单的ajax封装
   * @AuthorHTL
   * @DateTime  2016-04-08T14:45:10+0800
   * @param     {[type]}                 url      [description]
   * @param     {[type]}                 type     [description]
   * @param     {[type]}                 isasync  [description]
   * @param     {Function}               callback [description]
   * @return    {[type]}                          [description]
   */
  function ajax(url,type,isasync,callback){
      if(!url) return false;
      if(!type) type = 'GET';
      if(!isasync) isasync = false;
      if(!callback) callback = function(result){
              console.log(result);
      }
      var xhr = new XMLHttpRequest();
      xhr.open(type,url,isasync);//这里要注意是否异步，如果是true那就是异步调用不会卡死浏览器
      xhr.onreadystatechange = function(){
             if(xhr.readyState === 4 && xhr.status=== 200){
                 var type = xhr.getResponseHeader('Content-Type');
                 if(type){
                    //检查类型
                   if(type.indexOf('xml') !== -1 && xhr.responseXML) callback(xhr.responseXML);//返回xml
                   else if(type === 'application/json')
                   callback(JSON.parse(xhr.responseText));  //如果是json那么就对json数据进行编码操作
                   else
                   //直接返回字符串响应
                   callback(xhr.responseText);
                 }else{
                   callback(xhr.responseText);
                 }

             }
      };
      xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");//让服务器判断是ajax请求还是属于普通请求
      xhr.send(null);//发送请求
  }
  //ajax('http://localhost:808/smusicmyversion/index.html'); 测试代码
  var bufferTimer = null;

  /**
   * 构造函数
   * @AuthorHTL
   * @DateTime  2016-04-08T14:44:48+0800
   * @param     {[type]}                 config [description]
   */
  function LMusic(config){
       //配置参数
       this.config = extend(this.config,config);
       this.musicList = this.config.musicList ||[];
       this.musicLength = this.musicList.length;
       if(!this.musicLength){
          this.musicDom.listWrap.innerHTML = '<p>暂无播放记录</p>';
       }
       this.audioDom = null;
       this.audiocontext =null;//创建audiotext
       this.audiobuffer = null;
       this.gainnode = null;
       this.buffersource = null;
       this.curTime = 0;
       this.Ajax = null;
       this.tmpEvents = [];
       this.init();//初始化播放器相关dom以及事件
  }
  LMusic.prototype ={
    config:{
      musicList:[],//播放列表
      defaultVolume:0.5,//默认音量大小 0-1.0之间
      defaultIndex:0,//播放列表索引
      autoPlay:false,//是否默认自动播放
      defaultMode:1,//播放模式 随机播放 按顺序播放 还是循环播放
      bufferTime:1000,//缓冲的计时器时间
      offlineMode:false, //是否支持离线缓存
      showrightmenu:false,
      gradientleft:'#0f0',
      gradientmiddle:'#ff0',
      gradientright:'#f00',
      gradienttop:'#ff0',
      callback:function(obj){
      }
    },
    prepareAudioApi:function(){
          //统一前缀
          window.requestAnimationFrame = window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame;

          //处理当浏览器不支持AudioContext的情况，这样浏览器就不会报错了
          if(LkMusic.WebAudio.supportsWebAudio()){
             //如果支持webaudio那么就是下面代码
             LkMusic.WebAudio.init(
                {
                    audioContext:new (window.AudioContext || window.webkitAudioContext||window.mozAudioContext||window.msAudioContext)
                }
             );
          }else{
            console.log("对不起您的浏览器暂时不支持AudioContext！无法进行音乐可视化显示！");
          }
    },
    /**
     * 根据列表数组创建列表(以后可以使用List数据结构)
     * @AuthorHTL
     * @DateTime  2016-04-08T15:31:33+0800
     * @return    {[type]}                 [description]
     */
    createListDom:function(){
      var i =0,ul='<ul>';

      for (var i = 0; i < this.musicLength; i++) {
        ul += '<li><strong>'+this.musicList[i]['title']+'</strong> -- <small>'+this.musicList[i]['singer']+'</small></li>';
      }
      ul += '</ul>';
      this.musicDom.listWrap.innerHTML = ul;
    },
    changeVolume:function(percent){
        LkMusic.WebAudio.setVolume(percent);
    },
    /**
     * 重置播放器
     * @AuthorHTL
     * @DateTime  2016-04-15T11:21:32+0800
     * @param     {[type]}                 idx [description]
     * @return    {[type]}                     [description]
     */
    resetPlayer:function(idx){

         (idx >= (this.musicLength-1)) && (idx = this.musicLength-1);
         (idx <=0) && (idx =0);
         var _this = this;
         this.currentMusic = idx;
         var nowMusic = this.musicList[idx];
         this.loadBuffer(nowMusic.src);
         clearInterval(bufferTimer);
         this.musicDom.bufferProcess.style.width = 0+'px';
         this.musicDom.curProcess.style.width = 0 + 'px';

         this.musicDom.cover.innerHTML = '<img src="'+nowMusic.cover+'" title="'+nowMusic.title + ' -- '+ nowMusic.singer + '">';
         this.musicDom.title.innerHTML = '<strong>'+nowMusic.title+'</strong><small>'+nowMusic.singer+'</small>';
         this.musicDom["lyricWrap"].innerHTML = '<li class="eof">正在加载歌词...</li>';
         this.musicDom["lyricWrap"].style.marginTop = 0 + "px";
         this.musicDom["lyricWrap"].scrollTop = 0;
         this.getLyric(idx);
         //设置播放列表选中
         var playlist = document.querySelectorAll('.m-music-list-wrap li'), i = 0;
         for (var i = 0; i < this.musicLength; i++) {
           if (i === idx) {
               var cl = new classList(playlist[i]);
               cl.add('current');
           }else{
               var cl = new classList(playlist[i]);
               cl.remove('current');
           }
         }

         var _callback = nowMusic;
         _callback.index = idx;
         typeof this.config.callback === 'function' && this.config.callback(_callback);
    },
    /**
     * 控制音量播放
     * @AuthorHTL
     * @DateTime  2016-04-15T11:31:58+0800
     * @param     {[type]}                 volume [description]
     */
    setVolume:function(volume){
        _this = this;
        var v = this.musicDom.volume,h=v.volumeEventer.offsetHeight||50;
        (volume >=1) && (volume = 1);
        (volume <=0) && (volume = 0);
        var currentHeight = h*volume;//获取当前的音量高度
        v.volumeCurrent.style.height = currentHeight +'px';
        v.volumeCtrlBar.style.bottom = currentHeight +'px';
        v.volumeProcess.setAttribute('data-volume', volume);
        if(volume === 0){
             var cl = new classList(v.volumeControl);
             cl.add('muted');
             LkMusic.WebAudio.setVolume(0);
        }else{
             var cl = new classList(v.volumeControl);
             cl.remove('muted');
             LkMusic.WebAudio.setVolume(volume);
        }
    },
    clearTmpEvents: function () {
        this.tmpEvents.forEach(function (e) { e.un(); });
    },
    cancelAjax: function () {
        if (this.Ajax) {
            this.Ajax.xhr.abort();
            this.Ajax = null;
        }
    },
    empty: function () {
        if (!LkMusic.WebAudio.isPaused()) {
             this.pause();
             LkMusic.WebAudio.seekTo(0);
             LkMusic.WebAudio.disconnectSource();
        }
        this.cancelAjax();
        this.clearTmpEvents();
    },
    loadBuffer: function (url) {
        this.empty();
        // load via XHR and render all at once
        return this.getArrayBuffer(url, this.loadArrayBuffer.bind(this));
    },
     /**
     * Internal method.
     */
    loadArrayBuffer: function (arraybuffer) {
        LkMusic.WebAudio.decodeArrayBuffer(arraybuffer, function (data) {
            this.loadDecodedBuffer(data);

        }.bind(this));
    },
    /**
     * Directly load an externally decoded AudioBuffer.
     */
    loadDecodedBuffer: function (buffer) {
        LkMusic.WebAudio.load(buffer);
        this.fireEvent('ready',this);
    },

    getArrayBuffer: function (url, callback) {
        var _this = this;
        var ajax = WaveSurfer.util.ajax({
            url: url,
            responseType: 'arraybuffer'
        });
        this.Ajax = ajax;

        this.tmpEvents.push(
            ajax.on('progress', function (e) {
                _this.onProgress(e);

            }),
            ajax.on('success', function (data, e) {
                callback(data);
                _this.Ajax = null;
            }),
            ajax.on('error', function (e) {
                _this.fireEvent('error', 'XHR error: ' + e.target.statusText);
                _this.Ajax = null;
            })
        );

        return ajax;
    },
    onProgress: function (e) {
        if (e.lengthComputable) {
            var percentComplete = e.loaded / e.total;
        } else {
            // Approximate progress with an asymptotic
            // function, and assume downloads in the 1-3 MB range.
            percentComplete = e.loaded / (e.loaded + 1000000);
        }
        this.fireEvent('loading', Math.round(percentComplete * 100), this);
    },
    showProgress:function(percent,target){
        target.setBuffer(percent,target.musicDom.bufferProcess);
    },
    drawSpectrum: function(analyser) {
        var that = this,
            canvas = document.querySelector('.music-container-spectrum'),
            cwidth = canvas.width,
            cheight = canvas.height - 2,
            meterWidth = 10, //width of the meters in the spectrum
            gap = 2, //gap between meters
            capHeight = 2,
            capStyle = this.config.gradienttop,
            meterNum = 800 / (10 + 2), //count of the meters
            capYPositionArray = []; ////store the vertical position of hte caps for the preivous frame
        ctx = canvas.getContext('2d'),
        gradient = ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(1, this.config.gradientleft);
        gradient.addColorStop(0.5, this.config.gradientmiddle);
        gradient.addColorStop(0, this.config.gradientright);
        var drawMeter = function() {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            if (that.status === 0) {
                //fix when some sounds end the value still not back to zero
                for (var i = array.length - 1; i >= 0; i--) {
                    array[i] = 0;
                };
                allCapsReachBottom = true;
                for (var i = capYPositionArray.length - 1; i >= 0; i--) {
                    allCapsReachBottom = allCapsReachBottom && (capYPositionArray[i] === 0);
                };
                if (allCapsReachBottom) {
                    cancelAnimationFrame(that.animationId); //since the sound is top and animation finished, stop the requestAnimation to prevent potential memory leak,THIS IS VERY IMPORTANT!
                    return;
                };
            };
            var step = Math.round(array.length / meterNum); //sample limited data from the total array
            ctx.clearRect(0, 0, cwidth, cheight);
            for (var i = 0; i < meterNum; i++) {
                var value = array[i * step];
                if (capYPositionArray.length < Math.round(meterNum)) {
                    capYPositionArray.push(value);
                };
                ctx.fillStyle = capStyle;
                //draw the cap, with transition effect
                if (value < capYPositionArray[i]) {
                    ctx.fillRect(i * 12, cheight - (--capYPositionArray[i]), meterWidth, capHeight);
                } else {
                    ctx.fillRect(i * 12, cheight - value, meterWidth, capHeight);
                    capYPositionArray[i] = value;
                };
                ctx.fillStyle = gradient; //set the filllStyle to gradient for a better look
                ctx.fillRect(i * 12 /*meterWidth+gap*/ , cheight - value + capHeight, meterWidth, cheight); //the meter
            }
            that.animationId = requestAnimationFrame(drawMeter);
        }
        this.animationId = requestAnimationFrame(drawMeter);
    },
    hideProgress:function(target){
        if(target.config.autoPlay){
            target.play();
         }else{
            target.pause();
         }
         
         LkMusic.WebAudio.setVolume(target.config.defaultVolume);
         
         target.action();
         //开始进行音频频谱的绘制
         target.drawSpectrum(LkMusic.WebAudio.analyser);
    },
    destroy:function(event){
    	
    },
    /**
     * 初始化播放
     * @AuthorHTL
     * @DateTime  2016-04-15T13:54:55+0800
     * @return    {[type]}                 [description]
     */
    initPlay:function(){
		    var idx = this.config.defaultIndex;
		    
		    if(this.config.defaultMode === 2){
		      //随机播放
		      idx = this.getRandomIndex();
		    }
		    
		    var _this = this;
		    
		    this.on('loading', this.showProgress);
		  
		    this.on('ready', this.hideProgress);
		  
		    this.on('destroy', this.destroy);
		  
		    this.on('error', this.hideProgress);
		  
			LkMusic.WebAudio.on('finish', function () { 
				_this.playByMode('ended');
			});
			
			LkMusic.WebAudio.on('play', function () {
				
			});
			
			LkMusic.WebAudio.on('pause', function () {
				
			});
			
			LkMusic.WebAudio.on('audioprocess', function (time) {
			    
			});
		    
		    this.resetPlayer(idx);

    },
    /**
     * 播放音乐
     * @AuthorHTL
     * @DateTime  2016-04-15T14:09:29+0800
     * @return    {[type]}                 [description]
     */
    play:function(start,end){
        var ctrl = this.musicDom.button.ctrl;
        LkMusic.WebAudio.play(start,end);
        var ctrllist = new classList(ctrl);
        ctrllist.remove('paused');
        ctrllist.add('play');
        ctrl.setAttribute('title', '暂停');
        var coverlist = new classList(this.musicDom.cover);
        coverlist.remove('paused');
        coverlist.add('play');
    },
    /**
     * 暂停音乐
     * @AuthorHTL
     * @DateTime  2016-04-15T14:09:38+0800
     * @return    {[type]}                 [description]
     */
    pause:function(){
        var ctrl = this.musicDom.button.ctrl;
        LkMusic.WebAudio.pause();
        var ctrllist = new classList(ctrl);
        ctrllist.remove('play');
        ctrllist.add('paused');
        ctrl.setAttribute('title', '播放');
        var coverlist = new classList(this.musicDom.cover);
        coverlist.remove('play');
        coverlist.add('paused');
    },
    /**
     * 获取随机索引
     * @AuthorHTL
     * @DateTime  2016-04-15T13:59:03+0800
     * @return    {[type]}                 [description]
     */
    getRandomIndex:function(){
        var idx = this.currentMusic,len = this.musicLength,i=0,temp=[];
        //将不是当前播放的推入到新的temp数组之中
        for (var i = 0; i < len; i++) {
            if(i !== idx){
              temp.push(i);  
            } 
       }
       var random = parseInt(Math.random() * temp.length);
       return temp[random];
    },
    /**
     * 根据播放模式来进行播放
     * @AuthorHTL
     * @DateTime  2016-04-15T14:41:01+0800
     * @param     {[type]}                 type [description]
     * @return    {[type]}                      [description]
     */
    playByMode:function(type){
      var mode = this.playMode,
          idx = this.currentMusic,
          len = this.musicLength,
          index = idx;
          switch (mode) {
            case 1:
              if(type === 'prev'){
                  index = ((idx<=len-1)&&(idx>0))?(idx-1):(len-1);
              }else if(type === 'next' || type ==='ended'){
                  index = (idx >= len-1) ? 0 : (idx-1);//这种是三元运算符
              }
              break;
            case 2:
              index = this.getRandomIndex();//随机获取index
              break;
            case 3:
              if(type === 'prev'){
                  index = ((idx<=len-1)&&(idx>0))?(idx-1):(len-1);
              }else if(type === 'next'){
                  index = (idx >= len-1) ? 0 : (idx-1);//这种是三元运算符
              }else{
                index = idx;
              }
              break;
            default:
              //empty code here
              break;
          }
          this.resetPlayer(index);
    },
    initRightPanel:function(options){
        this.musicDom.music.addEventListener('',function(event){
            event = event || window.event;

        });

    },
    /**
     * 一些操作
     * @AuthorHTL
     * @DateTime  2016-04-15T14:53:39+0800
     * @return    {[type]}                 [description]
     */
    action:function(){
         //这里为什么要用_this 这个要明白this在不同地方的指向不一样
         var _this = this,v = this.musicDom.volume,btn=this.musicDom.button;
         var enterFrame = function(){


            var currenttime = calctime(LkMusic.WebAudio.getCurrentTime()),
                    totaltime = calctime(LkMusic.WebAudio.getDuration());
                var currentProcess = (LkMusic.WebAudio.getCurrentTime()/LkMusic.WebAudio.getDuration()) *(_this.musicDom.bufferProcess.parentNode.offsetWidth);
                _this.musicDom.time.innerHTML = ''+currenttime+'/'+totaltime;
                _this.musicDom.curProcess.style.width = currentProcess +"px";
                //歌词进度
                var curTime = parseInt(LkMusic.WebAudio.getCurrentTime()*1e3);//这里不能跟着smusic那样写不然会出很大的错误
                var lyrics = _this.musicDom['lyricWrap'].querySelectorAll('.u-lyric'),
                    sizes = lyrics.length,
                    i =0;
                if(sizes >1){
                   for(;i<sizes;i++){
                     var lyl = lyrics[i];
                     var cl = new classList(lyl);
                     if(lyl){
                         var _time = parseFloat(lyl.getAttribute('data-time'));
                         if(curTime >= _time){
                             var top = (i-1) *30;//30是每个LI的高度
                             _this.musicDom['lyricWrap'].style.marginTop = -top +'px';
                             //移除之前的current
                             for(var j =0;j<sizes;j++){
                                  var cl1 = new classList(lyrics[j]);
                                lyrics[j] && cl1.remove('current');
                             }
                             cl.add('current');
                         }
                     }
                   }
                }
            requestAnimationFrame(enterFrame);
         };
         requestAnimationFrame(enterFrame);
         //音量控制器 静音和回复播放
         v.volumeControl.addEventListener('click',function(event){
          event = event || window.event;
          event.stopPropagation();//阻止冒泡
          var cl = new classList(v.volumeProcess);
          if(cl.contains('show')){
              cl.toggle('muted');
              cl.contains('muted') ?(_this.changeVolume(0)) :(_this.changeVolume(_this.config.defaultVolume));
          }else{
            cl.add('show');
          }
         },false);
         //当点击文档空白区域的时候隐藏音量调节器
         document.addEventListener('click', function(event){
          event = event || window.event;
          event.stopPropagation();
          var target = event.target || event.srcElement;
          var cl = new classList(v.volumeProcess);
          if((target.parentNode !== v.volumeProcess) && target.parentNode !==$('.grid-music-container .u-volume')){
             cl.remove('show');
          }
         },false);
         //绑定音量调节器
         v.volumeEventer.addEventListener('click',function(event){
            event = event || window.event;
            event.stopPropagation();
            var h = this.offsetHeight,
            y = event.offsetY,
            volume = (h-y)/h;
            _this.setVolume(volume);
         },false);
         //绑定简单的播放列表以后我们使用数据结构的list来进行实现
         var playlist = document.querySelectorAll('.m-music-list-wrap li'),i=0;

         for(;i<_this.musicLength;i++){
          !(function(i){
             playlist[i].addEventListener('click',function(){
                _this.resetPlayer(i);
             },false);
          }(i)
          );

         }

         //绑定播放按钮
         btn.ctrl.addEventListener('click',function(){
            var cl = new classList(btn.ctrl);
            if(cl.contains('play')){
               _this.pause();
            }else{
              _this.play();
            }

         },false);
         //绑定下一曲
         btn.prev.addEventListener('click',function(){
          _this.playByMode('prev');
         },false);
         //绑定下一曲
         btn.next.addEventListener('click',function(){
           _this.playByMode('next');
         },false);
         //这里我们还要根据外部配置或者默认配置的播放模式进行
         switch (_this.playMode){

            case 1:
                      var cl = new classList(btn.listCircular);
                    cl.add('current');
                    var cl1 = new classList(btn.singleCircular);
                    cl1.remove('current');
                    var cl2 = new classList(btn.randomPlay);
                    cl2.remove('current');
                break;

            case 2:
                  var cl = new classList(btn.randomPlay);
                    cl.add('current');
                    var cl1 = new classList(btn.listCircular);
                    cl1.remove('current');
                    var cl2 = new classList(btn.singleCircular);
                    cl2.remove('current');
                break;

            case 3:
                  var cl = new classList(btn.singleCircular);
                    cl.add('current');
                    var cl1 = new classList(btn.listCircular);
                    cl1.remove('current');
                    var cl2 = new classList(btn.randomPlay);
                    cl2.remove('current');
                break;

            default:
              //empty code here
                break;
         }
         //绑定列表循环
         btn.listCircular.addEventListener('click',function(){

            var cl = new classList(this);
            cl.add('current');
            var cl1 = new classList(btn.singleCircular);
            cl1.remove('current');
            var cl2 = new classList(btn.randomPlay);
            cl2.remove('current');
            _this.playMode = 1;

         },false);
         //绑定随机播放按钮
         btn.randomPlay.addEventListener('click',function(){
              var cl = new classList(this);
                    cl.add('current');
                    var cl1 = new classList(btn.listCircular);
                    cl1.remove('current');
                    var cl2 = new classList(btn.singleCircular);
                    cl2.remove('current');
                    _this.playMode = 3;

         },false);
         //绑定单曲循环
         btn.singleCircular.addEventListener('click',function(){

                var cl = new classList(this);
                    cl.add('current');
                    var cl1 = new classList(btn.listCircular);
                    cl1.remove('current');
                    var cl2 = new classList(btn.randomPlay);
                    cl2.remove('current');
                    _this.playMode = 3;
            });
         //拖动进度条
         var $progress = this.musicDom['curProcess'].parentNode;
         $progress.addEventListener('click',function(event){
          event = event || window.event;
          var left = this.getBoundingClientRect().left,width = this.offsetWidth;
          var progressX = Math.min(width,Math.abs(event.clientX - left));//防止超出范围
          //这里要特别注意不能讲currentTime 写成了currenttime
          if(LkMusic.WebAudio.getCurrentTime() && LkMusic.WebAudio.getDuration()){
            var start = parseInt((progressX/width) *(LkMusic.WebAudio.getDuration()));
            LkMusic.WebAudio.play(start);
          }
         });

    },
    /**
     * 缓冲加载
     * @AuthorHTL
     * @DateTime  2016-04-08T15:41:55+0800
     * @param     {[type]}                 audio     [description]
     * @param     {[type]}                 bufferDom [description]
     */
    setBuffer:function(percent,bufferDom){
              var w = bufferDom.parentNode.offsetWidth;
              var bufferWidth = percent/100*w;
              bufferDom.style.width = bufferWidth+'px';
              if(percent===100){
                   bufferDom.style.width = w +'px';
              }
    },
    /**
     * 获取歌词
     * @AuthorHTL
     * @DateTime  2016-04-14T16:48:12+0800
     * @param     {[type]}                 index [description]
     * @return    {[type]}                       [description]
     */
    getLyric:function(index){
          var _this = this;
          if(this.lyricCache[index]){
                this.renderLyric(this.lyricCache[index]);
            }else{
                var url = this.musicList[index]["lyric"];
                if(url){
                    ajax(url,'GET',true,function(lrc){

                        var lyric = _this.parseLyric(lrc);

                        _this.lyricCache[index] = lyric ? lyric : null;
                        _this.renderLyric(lyric);
                    })
                }else{

                    this.lyricCache[index] = null;
                    this.renderLyric(null);
                }
            }
    },
    /**
     * 渲染歌词
     * @AuthorHTL
     * @DateTime  2016-04-14T16:48:23+0800
     * @param     {[type]}                 lyric [description]
     * @return    {[type]}                       [description]
     */
    renderLyric:function(lyric){


             var dom = this.musicDom["lyricWrap"], tpl = "";
              if(lyric){
                  for(var k in lyric){
                      var txt = lyric[k] ? lyric[k] :'--- lkmusic ---';
                      tpl += '<li class="u-lyric f-toe" data-time="'+k+'">'+txt+'</li>';
                  }
                  tpl && (tpl += '<li class="u-lyric">www.laijiadayuan.com</li>');
              }else{
                tpl = '<li class="eof">暂无歌词...</li>';
              }
              dom.style.marginTop = 0 + "px";
              dom.screenTop = 0;
              dom.innerHTML = tpl;

    },
    /**
     * 解析歌词
     * @AuthorHTL
     * @DateTime  2016-04-14T15:29:02+0800
     * @param     {[type]}                 lrc [description]
     * @return    {[type]}                     [description]
     */
     /*
      [00:00.91]小苹果
      [00:01.75]作词：王太利 作曲：王太利
      [00:02.47]演唱：筷子兄弟
     */
    parseLyric:function (lrc){
        var lyrics = lrc.split("[");

        var lrcObj = {};
        for(var i=0;i<lyrics.length;i++){
            var lyric = decodeURIComponent(lyrics[i]);
            var timeReg = /\d*:\d*((\.|\:)\d*)*\]/g;
            var timeRegExpArr = lyric.match(timeReg);


            if(!timeRegExpArr)continue;

            var clause = lyric.replace(timeReg,'');


            for(var k = 0,h = timeRegExpArr.length;k < h;k++) {
                var t = timeRegExpArr[k];
                var min = Number(String(t.match(/\d*/i)).slice(1)),
                    sec = Number(String(t.match(/\:\d*/i)).slice(1));
                var time = (min * 60 + sec)*1e3;//必须转换成毫秒才行
                lrcObj[time] = clause;
            }
    }
    return lrcObj;
    },
    /**
     * 初始化播放器
     * @AuthorHTL
     * @DateTime  2016-04-14T15:29:02+0800
     * @return   null                  [description]
     */
    init:function(){
            //缓存DOM结构
            this.musicDom = {
                music : $('.grid-music-container'),
                cover : $('.grid-music-container .u-cover'),
                title : $('.grid-music-container .u-music-title'),
                curProcess : $('.grid-music-container .current-process'),
                bufferProcess : $('.grid-music-container .buffer-process'),
                time : $('.grid-music-container .u-time'),
                listWrap : $('.grid-music-container .m-music-list-wrap'),
                lyricWrap : $('.grid-music-container .js-music-lyric-content'), //歌词区域
                volume   : {
                    volumeProcess : $('.grid-music-container .volume-process'),
                    volumeCurrent : $('.grid-music-container .volume-current'),
                    volumeCtrlBar : $('.grid-music-container .volume-bar'),
                    volumeEventer : $('.grid-music-container .volume-event'),  //主要作用于绑定事件，扩大了音量的触发范围
                    volumeControl : $('.grid-music-container .volume-control')
                },
                button  : {
                    ctrl : $('.grid-music-container .ctrl-play'),
                    prev : $('.grid-music-container .prev'),
                    next : $('.grid-music-container .next'),
                    listCircular : $('.grid-music-container .mode-list'), //列表循环
                    randomPlay   : $('.grid-music-container .mode-random'), //随机循环
                    singleCircular : $('.grid-music-container .mode-single') //单曲循环
                }
            };
            this.currentMusic = this.config.defaultIndex ||0;
            this.playMode = this.config.defaultMode||1;
            this.lyricCache = {};
            this.audioDom = document.createElement('audio');
            this.createListDom();
            //准备api
            this.prepareAudioApi();
            this.initPlay();

            if(!this.config.showrightmenu){
                forbidenRightMenu();
            }
            //支持离线缓存 （可以配置lkmusic.appcache）
            if(this.config.offlineMode){
                 document.documentElement.setAttribute('manifest','lkmusic.appcache');
            }//此功能暂时不起作用 因为必须把这个manifest先写在html中
            //创建支持音乐频谱的cavas背景
            var canvas = document.createElement('canvas');
            canvas.className = 'music-container-spectrum';
            this.musicDom.music.appendChild(canvas);

    }
  };
  //这里是关键代码用来拓展观察者模式来着
  Object.keys(WaveSurfer.Observer).forEach(function (key) {
                LMusic.prototype[key] = WaveSurfer.Observer[key];
  });
  win = win || window;
  win.LMusic = function(options){
     return new LMusic(options);
  };
})(window,LkMusic,WaveSurfer);