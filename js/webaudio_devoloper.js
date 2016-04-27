'use strict'
LkMusic.WebAudio={
	scriptBufferSize: 256,
    PLAYING_STATE: 0,
    PAUSED_STATE: 1,
    FINISHED_STATE: 2,
	/**
	 * 是否支持最新的webaudio api  moz官方地址  https://developer.mozilla.org/zh-CN/docs/Web/API/OfflineAudioContext
	 * */
	supportsWebAudio:function(){
		return (window.AudioContext || window.webkitAudioContext||window.mozAudioContext||window.msAudioContext) ? true :false;
	},
	/**
	 * 获取audiocontext
	 * */
	getAudioContext:function(){
		if(!LkMusic.WebAudio.audioContext){
			LkMusic.WebAudio.audioContext = new (
				window.AudioContext || window.webkitAudioContext||window.mozAudioContext||window.msAudioContext
			);
		}
		return LkMusic.WebAudio.audioContext;
	},
	/**
	 * 获取offlineaudiocontext
	 * */
	getOfflineAudioContext: function (sampleRate) {
        if (!LkMusic.WebAudio.offlineAudioContext) {
            LkMusic.WebAudio.offlineAudioContext = new (
                window.OfflineAudioContext || window.webkitOfflineAudioContext
            )(1, 2, sampleRate);
        }
        return LkMusic.WebAudio.offlineAudioContext;
    },
	/**
	 * 初始化
	 * */
	init:function(params){
		this.params = params;
		this.ac = params.audioContext || this.getAudioContext();
		this.lastPlay = this.ac.currentTime;
		this.startPosition = 0;
		this.scheduledPause = null;
		this.states = [
		   Object.create(LkMusic.WebAudio.state.playing),
		   Object.create(LkMusic.WebAudio.state.paused),
		   Object.create(LkMusic.WebAudio.state.finished)
		];
		this.createVolumeNode();//创建控制音量的gainnode
		this.createScriptNode();//创建脚本节点
		this.createAnalyserNode();//创建分析节点用于显示频谱
		this.setState(this.PAUSED_STATE);//设置默认状态为暂停
		this.setPlaybackRate(this.params.audioRate);//设置回放帧率
	},
	/**
	 * 滤音
	 * */
	disconnectFilters:function(){
		if(this.filters){
			this.filters.forEach(function(filter){
				filter && filter.disconnect();
			});
			this.filters = null;
			//从新连接到路径
			this.analyser.connect(this.splitter);
		}
	},
	/**
	 * 设置状态
	 * */
	setState:function(state){
		if(this.state !== this.states[state]){
			this.state = this.states[state];
			this.state.init.call(this);
		}
	},
	/**
	 * 解包过滤器
	 * */
	setFilter:function(){
		this.setFilters([].slice.call(arguments));
	},
	/**
	 * 将过滤器单个解包
	 * 
	 * */
	setFilters:function(filters){
		this.disconnectFilters();//先移除存在的过滤器
		if(filters && filters.length){
			this.filters = filters;
			this.analyser.disconnect();
			filters.reduce(function(prev,curr){
				prev.connect(curr);
				return curr;
			},this.analyser).connect(this.splitter);
			
		}
	},
	/**
	 * 创建音频脚本处理节点
	 * */
	createScriptNode:function(){
		if(this.ac.createScriptProcessor){
			this.scriptNode = this.ac.createScriptProcessor(this.scriptBufferSize);
		}else{
			this.scriptNode = this.ac.createJavaScriptNode(this.scriptBufferSize);
		}
		this.scriptNode.connect(this.ac.destination);
	},
	/**
	 * 添加音频脚本处理程序事件
	 * */
	addOnAudioProcess:function(){
		var _this = this;
		this.scriptNode.onaudioprocess = function(){
		    var time = _this.getCurrentTime();
		    if(time >= _this.getDuration()){
		    	_this.setState(_this.FINISHED_STATE);
		    	_this.fireEvent('pause');
		    }else if(time >= _this.scheduledPause){
		    	_this.setState(_this.PAUSED_STATE);
		    	_this.fireEvent('pause');
		    }else if(_this.state === _this.states[_this.PLAYING_STATE]){
		    	_this.fireEvent('audioprocess',time);
		    }
		    
		};
	},
	/**
	 * 移除监听
	 * */
	removeOnAudioProcess:function(){
		this.scriptNode.onaudioprocess = null;
	},
	/**
	 * 创建不同的声道节点
	 * */
	createChannelNodes:function(){
		var channels = this.buffer.numberOfChannels;
		this.splitter = this.ac.createChannelSplitter(channels);
		this.merger = this.ac.createChannelMerger(channels);
		this.setChannel(this.params.channel);
		this.analyser.disconnect();
		this.analyser.connect(this.splitter);
		this.merger.connect(this.gainNode);
	},
	/**
	 * 设置声道
	 * */
	setChannel:function(channel){
		var channels = this.buffer.numberOfChannels;
		this.splitter.disconnect();
		for (var c=0;c<channels;c++) {
			this.splitter.connect(this.merger,channel ===-1 ? c:channel,c);
		}
	},
	/**
	 * 创建分析节点
	 * */
	createAnalyserNode:function(){
		this.analyser = this.ac.createAnalyser();
		this.analyser.connect(this.gainNode);
		
	},
	/**
	 * 创建音量调节
	 * */
	createVolumeNode:function(){
		if(this.ac.createGain){
			this.gainNode = this.ac.createGain();
		}else{
			this.gainNode = this.ac.createGainNode();
		}
		this.gainNode.connect(this.ac.destination);
	},
	/**
	 * 控制音量大小
	 * */
	setVolume:function(newGain){
		this.gainNode.gain.value = newGain;
	},
	/**
	 * 获取音量大小
	 * */
	getVolume:function(){
		return this.gainNode.gain.value;
	},
	/**
	 * 解析arraybuffer
	 * */
	decodeArrayBuffer:function(arraybuffer,callback,errback){
		if(!this.offlineAc){
			this.offlineAc = this.getOfflineAudioContext(this.ac ? this.ac.sampleRate :44100)
		}
		this.offlineAc.decodeAudioData(arraybuffer,(function(data){
			callback(data);
		}).bind(this),errback)
	},
	/**
	 * 解析arraybuffer
	 * */
	decodeArrayBufferInAudioMode:function(arraybuffer,callback,errback){
		
		this.audioContext = this.getAudioContext();
		this.audioContext.decodeAudioData(arraybuffer,(function(data){
			callback(data);
		}).bind(this),errback)
	},
	
    /**
     * Compute the max and min value of the waveform when broken into
     * <length> subranges.
     * @param {Number} How many subranges to break the waveform into.
     * @returns {Array} Array of 2*<length> peaks or array of arrays
     * of peaks consisting of (max, min) values for each subrange.
     */
    getPeaks: function (length) {
        var sampleSize = this.buffer.length / length;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = this.buffer.numberOfChannels;
        var splitPeaks = [];
        var mergedPeaks = [];

        for (var c = 0; c < channels; c++) {
            var peaks = splitPeaks[c] = [];
            var chan = this.buffer.getChannelData(c);

            for (var i = 0; i < length; i++) {
                var start = ~~(i * sampleSize);
                var end = ~~(start + sampleSize);
                var min = 0;
                var max = 0;

                for (var j = start; j < end; j += sampleStep) {
                    var value = chan[j];

                    if (value > max) {
                        max = value;
                    }

                    if (value < min) {
                        min = value;
                    }
                }

                peaks[2 * i] = max;
                peaks[2 * i + 1] = min;

                if (c == 0 || max > mergedPeaks[2 * i]) {
                    mergedPeaks[2 * i] = max;
                }

                if (c == 0 || min < mergedPeaks[2 * i + 1]) {
                    mergedPeaks[2 * i + 1] = min;
                }
            }
        }

        return (this.params.splitChannels || this.params.channel > -1) ? splitPeaks : mergedPeaks;
    },
    /**
     * 获取已经播放了的百分比
     * */
    getPlayedPercents:function(){
    	return this.state.getPlayedPercents.call(this);
    },
    /**
     * 断开sourceNode
     * */
    disconnectSource:function(){
    	if(this.source){
    		this.source.disconnect();
    	}
    },
    /**
     * 全部销毁
     * */
    destroy:function(){
    	if(!this.isPaused()){
    		this.pause();
    	}
    	this.unAll();
    	this.buffer = null;
    	this.disconnectFilters();
    	this.disconnectSource();
    	this.gainNode.disconnect();
    	this.scriptNode.disconnect();
    	this.merger.disconnect();
    	this.splitter.disconnect();
    	this.analyser.disconnect();
    },
    /**
     * 加载
     * */
    load:function(buffer){
    	this.startPosition = 0;
    	this.lastPlay = this.ac.currentTime;
    	this.buffer = buffer;
    	this.createSource();
    	this.createChannelNodes();
    	
    },
    /**
     * 创建source节点
     * */
    createSource:function(){
    	this.disconnectSource();
    	this.source = this.ac.createBufferSource();
    	//兼容老浏览器
    	this.source.start = this.source.start || this.source.noteOn;
    	this.source.stop = this.source.stop || this.source.noteOff;
    	this.source.playbackRate.value = this.playbackRate;
    	this.source.buffer = this.buffer;
    	this.source.connect(this.analyser);
    	
    },
    /**
     * 是否已经停止
     * */
    isPaused:function(){
    	return this.state !== this.states[this.PLAYING_STATE];
    	
    },
    /**
     * 获取音频的总时间
     * */
    getDuration:function(){
    	if(!this.buffer){
    		return 0;
    	}
    	return this.buffer.duration;
    },
    /**
     * 跳转到指定位置播放
     * */
    seekTo: function (start, end) {
        this.scheduledPause = null;

        if (start == null) {
            start = this.getCurrentTime();
            if (start >= this.getDuration()) {
                start = 0;
            }
        }
        if (end == null) {
            end = this.getDuration();
        }

        this.startPosition = start;
        this.lastPlay = this.ac.currentTime;

        if (this.state === this.states[this.FINISHED_STATE]) {
            this.setState(this.PAUSED_STATE);
        }

        return { start: start, end: end };
    },
    /**
     * 获取播放的时间
     * */
    getPlayedTime:function(){
    	return (this.ac.currentTime - this.lastPlay) * this.playbackRate;
    },
    /**
     * 播放
     * */
    play:function(start,end){
    	this.createSource();
    	var adjustedTime = this.seekTo(start,end);
    	start = adjustedTime.start;
    	end = adjustedTime.end;
    	this.scheduledPause = end;
    	this.source.start(0,start,end-start);
    	this.setState(this.PLAYING_STATE);
    	this.fireEvent('play');
    },
    /**
     * 暂停
     * */
    pause:function(){
    	this.scheduledPause = null;
    	this.startPosition += this.getPlayedTime();
    	this.source && this.source.stop(0);
    	this.setState(this.PAUSED_STATE);
    	this.fireEvent('pause');
    },
    /**
     * 获取当前时间
     * */
    getCurrentTime:function(){
    	return this.state.getCurrentTime.call(this);
    },
    /**
     * 设置播放帧率
     * */
    setPlaybackRate:function(value){
    	value = value ||1;
    	if(this.isPaused()){
    		this.playbackRate = value;
    	}else{
    		this.pause();
    		this.playbackRate = value;
    		this.play();
    	}
    }
};
LkMusic.WebAudio.state = {};

LkMusic.WebAudio.state.playing = {
    init: function () {
        this.addOnAudioProcess();
    },
    getPlayedPercents: function () {
        var duration = this.getDuration();
        return (this.getCurrentTime() / duration) || 0;
    },
    getCurrentTime: function () {
        return this.startPosition + this.getPlayedTime();
    }
};

LkMusic.WebAudio.state.paused = {
    init: function () {
        this.removeOnAudioProcess();
    },
    getPlayedPercents: function () {
        var duration = this.getDuration();
        return (this.getCurrentTime() / duration) || 0;
    },
    getCurrentTime: function () {
        return this.startPosition;
    }
};

LkMusic.WebAudio.state.finished = {
    init: function () {
        this.removeOnAudioProcess();
        this.fireEvent('finish');
    },
    getPlayedPercents: function () {
        return 1;
    },
    getCurrentTime: function () {
        return this.getDuration();
    }
};

WaveSurfer.util.extend(LkMusic.WebAudio, WaveSurfer.Observer);


