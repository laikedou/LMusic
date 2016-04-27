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
(function(win){
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
  function LkMusic(config){
       //配置参数
       this.config = extend(this.config,config);
       this.musicList = this.config.musicList ||[];
       this.musicLength = this.musicList.length;
       if(!this.musicLength){
          this.musicDom.listWrap.innerHTML = '<p>暂无播放记录</p>';
       }
       this.audioDom = null;
       this.init();//初始化播放器相关dom以及事件
  }
  
  LkMusic.prototype ={
    config:{
      musicList:[],//播放列表
      defaultVolume:0.5,//默认音量大小 0-1.0之间
      defaultIndex:0,//播放列表索引
      autoPlay:false,//是否默认自动播放
      defaultMode:1,//播放模式 随机播放 按顺序播放 还是循环播放
      bufferTime:1000,//缓冲的计时器时间
      offlineMode:false, //是否支持离线缓存
      showrightmenu:false,
      callback:function(obj){
     
      
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

         var tempBuffer = function (){
                 return _this.setBuffer(this,_this.musicDom.bufferProcess);
         };
         this.audioDom.removeEventListener('canplay',tempBuffer,false);
         clearInterval(bufferTimer);
         this.musicDom.bufferProcess.style.width = 0+'px';
         this.musicDom.curProcess.style.width = 0 + 'px';
         this.audioDom.src = nowMusic.src;
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
         this.audioDom.addEventListener('canplay',tempBuffer,false);
         if(this.config.autoPlay){
            this.play();
         }else{
            this.pause();
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
        var v = this.musicDom.volume,h=v.volumeEventer.offsetHeight||50;
        (volume >=1) && (volume = 1);
        (volume <=0) && (volume = 0);
        this.audioDom.volume = volume;
        var currentHeight = h*volume;//获取当前的音量高度
        v.volumeCurrent.style.height = currentHeight +'px';
        v.volumeCtrlBar.style.bottom = currentHeight +'px';
        v.volumeProcess.setAttribute('data-volume', volume);
        if(volume === 0){
             var cl = new classList(v.volumeControl);
             cl.add('muted');
             this.audioDom.muted = true;
        }else{
             var cl = new classList(v.volumeControl);
             cl.remove('muted');
             this.audioDom.muted = false;
        }
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
      //设置默认音量大小
      this.audioDom.volume = this.config.defaultVolume;
      this.audioDom.load();
      this.resetPlayer(idx);
    },
    /**
     * 播放音乐
     * @AuthorHTL
     * @DateTime  2016-04-15T14:09:29+0800
     * @return    {[type]}                 [description]
     */
    play:function(){
        var ctrl = this.musicDom.button.ctrl;
        this.audioDom.play();
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
        this.audioDom.pause();
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
         this.audioDom.addEventListener('timeupdate',function(event){
            var audio = this;//指向this.audioDom
            if (!isNaN(audio.duration)) {
                var currenttime = calctime(audio.currentTime),
                    totaltime = calctime(audio.duration);
                var currentProcess = (audio.currentTime/audio.duration) *(_this.musicDom.bufferProcess.parentNode.offsetWidth);
                _this.musicDom.time.innerHTML = ''+currenttime+'/'+totaltime;
                _this.musicDom.curProcess.style.width = currentProcess +"px";
                //歌词进度
                var curTime = parseInt(audio.currentTime*1e3);//这里不能跟着smusic那样写不然会出很大的错误
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
            }
         },false);
         //当播放完成后恢复到原始状态
         this.audioDom.addEventListener('ended',function(){
             _this.playByMode('ended');
         },false);
         //音量控制器 静音和回复播放
         v.volumeControl.addEventListener('click',function(event){
          event = event || window.event;
          event.stopPropagation();//阻止冒泡
          var cl = new classList(v.volumeProcess);
          if(cl.contains('show')){
              cl.toggle('muted');
              cl.contains('muted') ?(_this.audioDom.muted = true) :(_this.audioDom.muted = false);
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
          if(_this.audioDom.currentTime && _this.audioDom.duration){
            _this.audioDom.currentTime = parseInt((progressX/width) *(_this.audioDom.duration));
            _this.play();
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
    setBuffer:function(audio,bufferDom){
      var w = bufferDom.parentNode.offsetWidth;
      bufferTimer = setInterval(function(){
           var buffer = audio.buffered.length;
           if(buffer>0 && audio.buffered !==undefined){
              var bufferWidth = (audio.buffered.end(buffer-1)/audio.duration)*w;
              bufferDom.style.width = bufferWidth+'px';
              if(Math.abs(audio.duration-audio.buffered.end(buffer-1))<1){
                   bufferDom.style.width = w +'px';
                   clearInterval(bufferTimer);
              }
           }
      },this.config.bufferTime);
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
            this.initPlay();
            this.action();
            if(!this.config.showrightmenu){
            	forbidenRightMenu();
            }
            //支持离线缓存 （可以配置lkmusic.appcache）
            if(this.config.offlineMode){
            	 document.documentElement.setAttribute('manifest','lkmusic.appcache');
            }//此功能暂时不起作用 因为必须把这个manifest先写在html中
    }
  };
  win = win || window;
  win.LMusic = function(options){
     return new LkMusic(options);
  };
})(window);