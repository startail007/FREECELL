window.onload = function() {
	var app = new Vue({
        el: '#app',
        data: {
        	type:[
        		{icon:"spade",color:"black"},
        		{icon:"heart",color:"red"},
        		{icon:"diamond",color:"red"},
        		{icon:"club",color:"black"},
        	],
        	cards:[
        	],
        	putCard:{
        		base:[[],[],[],[],[],[],[],[]],
        		sort:[[],[],[],[]],		        		
        		free:[[],[],[],[]],
        	},
        	collisionRect:{
        		base:[],
        		sort:[],		        		
        		free:[],
        	},
        	imgSrc:{
        		num:["A","2","3","4","5","6","7","8","9","10","J","Q","K"],
        		type:["Spades","Hearts","Diamonds","Clubs"],
        		template:"cards/${folderType}/${num}_${type}.png"
        	},
        	baseblank:0,		        	
        	freeblank:0,
        	dragX:0,
        	dragY:0,
        	pageX:0,
        	pageY:0,
        	dragStartBool:false,
        	draggingBool:false,
        	dragStartTime:0,
        	currentlyTime:0,	        	
        	dragTargetArray:[],
        	cardWidth:120,
        	cardHeight:185,
        	autoId:0,
        	autoBool:false,
        	transitions:false,
        	dragType:"",        	
        	dragIndex:-1,        	
        	dragOrder:-1,
        	step:[],
        	stepCount:0,
        	stepScore:[],
        	time:0,
        	timeBool:false,
        	combo:0,
        	pause:false,
        	page:"",
        	random:[],
        	putRect:null
        },
        mounted: function() {
    		for(var collisionRect_key in this.collisionRect){
        		var collisions = this.$refs["collision_"+collisionRect_key];
        		for(var key in collisions){
	    			this.collisionRect[collisionRect_key][key] = this.getRect(collisions[key]);
	    		}
    		}

        	for(var type_key in this.type){
				for(var i=0;i<13;i++){
					var tempX = 0;
					var tempY = 0;
					var imaSrc = this.imgSrc.template;
					imaSrc = imaSrc.replace("${folderType}", this.type[type_key].icon);
					imaSrc = imaSrc.replace("${type}", this.imgSrc.type[type_key]);
					imaSrc = imaSrc.replace("${num}", this.imgSrc.num[i]);
					this.cards.push({
						type:parseInt(type_key),
						num:i,
						targetPos:{x:tempX,y:tempY},
						pos:{x:tempX,y:tempY},
						currentlyPos:{x:tempX,y:tempY},
						dragging:false,
						animation:false,
						animationTime:0,
						animationDelay:0,
						animationDelayOffset:0,
						animationTotal:300,
						animationTotalOffset:0,
						imgSrc:imaSrc,
						score:0
					});
	        	}
        	}
        	this.random = this.getRandom();
        	/*this.random.sort(function(a,b){
        		return b-a;
        	});*/
	        this.startAnimation();
        	this.init();
        	//this.page = "complete";
        },
        watch:{
        },
        methods: {
        	init:function(){
        		this.baseblank = 0;	        	
        		this.freeblank = 0;
	        	this.dragX = 0;
	        	this.dragY = 0;
	        	this.pageX = 0;
	        	this.pageY = 0;
	        	this.dragStartBool = false;
	        	this.draggingBool = false;
	        	this.dragStartTime = 0;
	        	this.currentlyTime = Date.now();        	
	        	this.dragTargetArray = [];
	        	this.autoBool = false;
	        	this.transitions = true;
	        	this.dragType = "";        	
	        	this.dragIndex = -1;        	
	        	this.dragOrder = -1;
	        	this.step = [];
	        	this.stepCount = 0;
	        	this.stepScore = [];
	        	this.time = 0;
	        	this.timeBool = false;
	        	this.combo = 0;
	        	this.pause = false;
	        	this.page = "";
        		
        		for(var i=0;i<52;i++){
        			var card = this.cards[i];
        			card.currentlyPos.x = card.pos.x;
    				card.currentlyPos.y = card.pos.y;
    				card.dragging = false;
					card.animation = false;
					card.animationTime = 0;
					card.animationDelay = 0;
					card.animationDelayOffset = 0;
					card.animationTotal = 300;
					card.animationTotalOffset = 0;
					card.score = 0;
        		}

        		this.putCard["base"] = [[],[],[],[],[],[],[],[]];
        		this.putCard["sort"] = [[],[],[],[]];
        		this.putCard["free"] = [[],[],[],[]];

        		var putCard = this.putCard["base"];

	        	for(var i=0;i<52;i++){
	        		putCard[i%putCard.length].push(this.random[i]);
	        	}

	        	var startPutRect = this.getRect(this.$refs.startPut);
	        	for(var i=0;i<putCard.length;i++){
	        		for(var j=0;j<putCard[i].length;j++){
	        			var index = putCard[i][j];
	        			var card = this.cards[index];
	        			card.pos.x = startPutRect.left;
	        			card.pos.y = startPutRect.top;
						this.setCardAnimation(card,"base",i,j,30*8*j + 30*i);
	        		}
	        	}

	        	clearTimeout(this.autoId);
	        	this.autoId = setTimeout(function(){
	        			this.autoBool = true;
	        			this.transitions = false;
	        			this.timeBool = true;
	        			for(var key in this.cards){
		        			var card = this.cards[key];
		        			card.animationTime = 0;
	        				card.animationDelayOffset = 0;
		        		}
				    	this.autoMove();
				    }.bind(this),(30*8*6 + 30*7)+400);
        	},
        	getRandom:function(){
        		var random = [];
	        	for(var i=0;i<52;i++){
	        		var randomNum = Math.floor(Math.random()*52);
	        		while(random.indexOf(randomNum)!==-1){
	        			randomNum++;
	        			randomNum%=52;
	        		}
	        		random[i] = randomNum;
	        	}
	        	return random;
        	},
        	checkAABBCollision:function(A, B)
			{
				var AisToTheRightOfB = A.left > B.right;
				var AisToTheLeftOfB = A.right < B.left;
				var AisAboveB = A.bottom < B.top;
				var AisBelowB = A.top > B.bottom;
				if(AisToTheRightOfB || AisToTheLeftOfB || AisAboveB || AisBelowB){							
					return;
				}
				return {
					left:Math.max(A.left,B.left),
		    		top:Math.max(A.top,B.top),
		    		right:Math.min(A.right,B.right),
		    		bottom:Math.min(A.bottom,B.bottom),
				}
			},
			getRect:function(el){
				var parent = el.offsetParent;
				var parentLeft = 0;
				var parentTop = 0;
				while (parent&&parent!==this.$el) {
					parentLeft += parent.offsetLeft + parent.clientLeft;
					parentTop += parent.offsetTop + parent.clientTop;
					parent = parent.offsetParent;
				}
				return {
		    		left:parentLeft + el.offsetLeft + el.clientLeft,
		    		top:parentTop + el.offsetTop + el.clientTop,
		    		right:parentLeft + el.offsetLeft + el.offsetWidth + el.clientLeft,
		    		bottom:parentTop + el.offsetTop + el.offsetHeight + el.clientTop,
		    	}
			},
        	startAnimation:function(){
	        	this.currentlyTime = Date.now();
    			requestAnimationFrame(this.updateAnimation);
	        },
        	updateAnimation:function(){
        		var currentTime = Date.now();
			    var time = (currentTime - this.currentlyTime);
			    this.currentlyTime = currentTime;
			    if(!this.pause){        		
				    if(this.timeBool){
	        			this.time += time;
				    }
		    		this.putCardForeach(function(cardIndex, type, index, order){
	        			var card = this.cards[cardIndex];
	        			if(card.animation){
			    			card.animationTime += time;	
			    			var animationDelay = card.animationDelay+card.animationDelayOffset;
			    			var animationTotal = card.animationTotal+card.animationTotalOffset;
			    			var rate = Math.min(Math.max(0,card.animationTime-animationDelay)/animationTotal,1);
			    			if(card.dragging){
			    				card.pos.x += (card.targetPos.x - card.pos.x)*rate;
							    card.pos.y += (card.targetPos.y - card.pos.y)*rate;
							    if (card.animationTime>animationTotal+animationDelay) {
						    		card.currentlyPos.x = card.targetPos.x - this.dragX;
						    		card.currentlyPos.y = card.targetPos.y - this.dragY;
								    card.animation = false;
								}						    
			    			}else{	
			    				card.pos.x = card.currentlyPos.x + (card.targetPos.x - card.currentlyPos.x)*EasingFunctions.easeOutQuart(rate);
							    card.pos.y = card.currentlyPos.y + (card.targetPos.y - card.currentlyPos.y)*EasingFunctions.easeOutQuart(rate);
							    if (card.animationTime>animationTotal+animationDelay) {
						    		card.currentlyPos.x = card.targetPos.x;
						    		card.currentlyPos.y = card.targetPos.y;
								    card.animation = false;
								}
			    			}
			    							    			
			    		}else if(card.dragging){
			    			card.pos.x += (card.targetPos.x - card.pos.x)*0.5;
							card.pos.y += (card.targetPos.y - card.pos.y)*0.5;
			    		}	
		    		});
		    	}
				requestAnimationFrame(this.updateAnimation);
	        },
	        getMoveMax:function(freeblank, baseblank){
	        	return (freeblank+1)*(baseblank+1)+baseblank*(baseblank-1)/2;
	        },   	
        	mousedown:function(e){
        		if(this.transitions||this.autoBool||this.pause||!this.timeBool){
        			return;
        		}
        		var target = e.target || e.srcElement;

	            if (e.button && e.button !== 0) {
	                return;
	            }
	            if (e.target === e.currentTarget) {
	                return;
	            }

	            var dragTargetArray = [];
			    var temp = this.putCard[this.dragType][this.dragIndex];
	            for(var i=this.dragOrder;i<temp.length;i++){
			    	var card = this.cards[temp[i]];
			    	dragTargetArray.push(card);
			    }
			    this.dragTargetArray = dragTargetArray;

	            var dragTarget = this.dragTargetArray[0];

	            /*判斷花色數字連貫*/
	            var type0 = this.type[dragTarget.type].color==="black";
	            var num0 = dragTarget.num;
			    for(var key in this.dragTargetArray){
			    	if(key!==0){
			    		var card = this.dragTargetArray[key];
				    	var type1 = this.type[card.type].color==="black";
		            	var num1 = card.num;
		            	var count = key;
				    	if((num0-count!==num1)||!(type0^!(count%2===1))^type1){
				    		return;
				    	}
			    	}					    	
			    }

			    /*可動張數*/
			    var putCard = this.putCard["base"];
			    var baseblank = putCard.length;
	    		for(var key in putCard){
	    			if(putCard[key].length){
	    				baseblank--;
	    			}
	    		}
	    		this.baseblank = baseblank;
	    		var putCard = this.putCard["free"];
			    var freeblank = putCard.length;
	    		for(var key in putCard){
	    			if(putCard[key].length){
	    				freeblank--;
	    			}
	    		}
	    		this.freeblank = freeblank;
	    		if(this.dragTargetArray.length>this.getMoveMax(freeblank,baseblank)){
	    			return;
	    		}

			    /*啟動卡片拖曳*/					    
			    clearTimeout(this.autoId);
			    var pos = this.getPutBoxPos(this.dragType,this.dragIndex,this.dragOrder);
	            var xx = dragTarget.pos.x - pos.left;
	            var yy = dragTarget.pos.y - pos.top;

			    for(var key in this.dragTargetArray){
			    	var card = this.dragTargetArray[key];
			    	card.dragging = true;
			    	card.animation = true;
			    	var pos = this.getPutBoxPos(this.dragType,this.dragIndex,this.dragOrder + parseInt(key));
			    	card.targetPos.x = pos.left + xx;
		    		card.targetPos.y = pos.top + yy;
		    		card.currentlyPos.x = pos.left + xx;
		    		card.currentlyPos.y = pos.top + yy;
		    		card.animationDelayOffset = 0;
		    		card.animationTime = 0;
			    }	
	            e.stopPropagation();
        		e.preventDefault();
        		this.pageX = e.pageX;
        		this.pageY = e.pageY;
        		this.dragStartBool = true;
        		this.dragStartTime = e.timeStamp;

        		document.documentElement.addEventListener('mousemove', this.mousemove);
	        	document.documentElement.addEventListener('mouseup', this.mouseup);
        	},
        	mouseup:function(e){
        		if (!this.dragStartBool) {
        			return;
	            }

	            this.putRect = null;
	            this.dragStartBool = false;
        		this.draggingBool = false;
        		document.documentElement.removeEventListener('mousemove', this.mousemove);
	        	document.documentElement.removeEventListener('mouseup', this.mouseup);
	        	var change = false;
	        	var dragTarget = this.dragTargetArray[0];	
	        	var oldType = this.dragType;
	        	var oldIndex = this.dragIndex; 
	        	var dropType = this.dragType;	        	  
	        	var dropIndex = this.dragIndex;
	        	var dragTargetLength = this.dragTargetArray.length;
	            if(e.timeStamp - this.dragStartTime < 150){

	            	/*移動到可放置位置*/
		            var moveData = this.getMoveData(oldType,oldIndex,dragTargetLength);
		            if(moveData){
		            	dropType = moveData.type;
		            	dropIndex = moveData.index
		            	this.spliceData(oldType, oldIndex, moveData.type, moveData.index,dragTargetLength);
		            	change = true;
		            }

	            }else if(Math.abs(this.dragX)>10||Math.abs(this.dragY)>10){
	        		
	        		/*可放置位置*/
			        var putData = this.getPutData(dragTarget,oldType,oldIndex,dragTargetLength)
			        if(putData){	        			
		            	dropType = putData.type;
		            	dropIndex = putData.index;
			        	this.spliceData(oldType, oldIndex, putData.type, putData.index,dragTargetLength);
	            		change = true;
			        }
        		}

        		/*切換成卡片動畫移動*/	
        		if(change){       
        			var score = dragTarget.score; 			
        			if((dropType==="free"||dropType==="sort")&&oldType===dropType){
        				
        			}else{
        				this.stepCount++;
        				if(dropType==="sort"&&oldType!==dropType){
	        				dragTarget.score = 5;
	        			}else if(oldType==="sort"&&oldType!==dropType){
	        				dragTarget.score = 0;
	        			}
        			}
        			if(!this.step[this.stepCount]){
        				this.step[this.stepCount] = [];
        			}
        			this.step[this.stepCount].push({
        				oldType:oldType,
        				oldIndex:oldIndex,
        				type:dropType,
        				index:dropIndex,
        				len:dragTargetLength,
        				score:score
        			});        			       			
			    	this.adjust(oldType,oldIndex,dropType,dropIndex);
        		}	        		
		    	for(var key in this.dragTargetArray){
			    	var card = this.dragTargetArray[key];
					this.setCardAnimation(card,dropType,dropIndex,this.putCard[dropType][dropIndex].length-dragTargetLength+parseInt(key),parseInt(key)*50);
			    }
			    
			    clearTimeout(this.autoId);
			    this.autoId = setTimeout(function(){
			    		this.combo = 0;
			    		this.autoMove();
			    	}.bind(this),200);

        	},        	
        	mousemove:function(e){
        		if (!this.dragStartBool) {
        			return;
	            }
	            e.stopPropagation();
	            this.dragX = e.pageX - this.pageX;			            
	            this.dragY = e.pageY - this.pageY;			            
	            if(!this.draggingBool){
	            	if(this.dragX!==0||this.dragY!==0){
		            	this.draggingBool = true;
		            }
	            }
	            if(!this.draggingBool){
	            	return;
	            }

	            var dragTarget = this.dragTargetArray[0];	
	        	var oldType = this.dragType;
	        	var oldIndex = this.dragIndex;
	        	var dragTargetLength = this.dragTargetArray.length;

	            this.putRect = null;

		        var putData = this.getPutData(dragTarget,oldType,oldIndex,dragTargetLength)
		        if(putData){
		        	var temp;
		        	if(putData.type==="base"){
		    			var len = Math.max(0,this.putCard[putData.type][putData.index].length-1);
		    			temp = this.getPutBoxPos(putData.type,putData.index,len);
		    		}else{
		    			temp = this.collisionRect[putData.type][putData.index];
		    		}
		    		this.putRect = {left:temp.left,top:temp.top,width:this.cardWidth,height:this.cardHeight};
		        }

		    	for(var key in this.dragTargetArray){				    		
			    	var card = this.dragTargetArray[key];    				
		    		card.targetPos.x = card.currentlyPos.x + this.dragX;
		    		card.targetPos.y = card.currentlyPos.y + this.dragY;
		    	}
        	},
        	getPutData:function(dragTarget,oldType,oldIndex,dragTargetLength){

        		/*取得放置區域*/
				var dragTargetRect = {
		    		left:dragTarget.pos.x,
		    		top:dragTarget.pos.y,
		    		right:dragTarget.pos.x + this.cardWidth,
		    		bottom:dragTarget.pos.y + this.cardHeight,
		    	};
		    	var collisionArray = [];
	    		this.collisionRectForeach(function(rect, type, index){
	    			var temp = this.checkAABBCollision(rect,dragTargetRect);
        			if(temp){
        				collisionArray.push({
        					type:type,
        					index:index,
        					area:(temp.right-temp.left)*(temp.bottom-temp.top)
        				});
        			}
	    		});
	    		collisionArray.sort(function(a, b) {
					return b.area - a.area;
				});

        		/*判斷放置資料*/			        		
        		for(var key in collisionArray){
        			var collision = collisionArray[key];
			    	if(this.hasSpliceRange(oldType, oldIndex, collision.type, collision.index,dragTargetLength)){
				    	return {type:collision.type,index:collision.index}
			    	}
		        }
        	},
        	collisionRectForeach:function(fun){
        		for(var collisionRect_key in this.collisionRect){
	        		var collisions = this.collisionRect[collisionRect_key];
	        		for(var key in collisions){
	        			fun.call(this,collisions[key],collisionRect_key,parseInt(key));
	        		}
	        	}
        	},
        	putCardForeach:function(fun){
        		for(var key in this.putCard){
				    var putCard = this.putCard[key];
				    for(var putCard_key in putCard){
				    	var putCardChild = putCard[putCard_key];
				    	for(var putCardChild_key in putCardChild){
	        				fun.call(this,putCardChild[putCardChild_key],key,parseInt(putCard_key),parseInt(putCardChild_key));		        			
				    	}
				    }
				}
        	},
        	setCardAnimation:function(card,type,index,key,animationDelayOffset){
        		card.currentlyPos.x = card.pos.x;
    			card.currentlyPos.y = card.pos.y;
				var pos = this.getPutBoxPos(type,index,key);
	    		card.targetPos.x = pos.left;
	    		card.targetPos.y = pos.top;
    			card.dragging = false;
    			card.animationTime = 0;
		    	card.animationDelayOffset = animationDelayOffset;
    			card.animation = true;
        	},
        	adjust:function(oldType, oldIndex, type, index){
        		if(type==="base"){
	        		var cards = this.putCard[type][index];
			    	for(var key in cards){
			    		var card = this.cards[cards[key]];
				    	this.setCardAnimation(card,type,index,parseInt(key),0);
			    	}
        		}
        		if(oldType==="base"){
			    	var cards = this.putCard[oldType][oldIndex];
			    	for(var key in cards){
		    			var card = this.cards[cards[key]];
				    	this.setCardAnimation(card,oldType,oldIndex,parseInt(key),0);
			    	}
			    }
        	},
        	autoMove:function(){
        		var complete = 0;
        		var sortData = [];          		
        		var sort = this.putCard["sort"];
        		for(var sort_key in sort){
        			var len = sort[sort_key].length;           			
        			sortData[sort_key] = {
        				type:len>0?this.cards[sort[sort_key][0]].type:-1,
        				color:len>0?this.type[this.cards[sort[sort_key][0]].type].color:"",
        				length:len,
        				target:null,
        			}
        			if(len>=13){
        				complete++
        			}
        		}
        		if(complete===4){
        			this.transitions = true;
        			this.timeBool = false;
        			this.page = "complete";
        			return;
        		}
        		var judgeCards = [];

        		var orderType = ["base","free"];
        		for(var orderType_key in orderType){
        			var type = orderType[orderType_key];
				    var putCard = this.putCard[type];
				    for(var key in putCard){
				    	if(putCard[key].length>0){
				    		var card = this.cards[putCard[key][putCard[key].length - 1]];
				    		judgeCards.push({card:card,type:type,index:parseInt(key)});
				    	}
				    }
				}
				var autoCards = [];	            		
        		for(var judgeCards_key in judgeCards){
        			var judgeCard = judgeCards[judgeCards_key];
        			var s = sortData.findIndex(function(el){
        				return el.type===judgeCard.card.type;
        			});
        			if(s!==-1){
        				var sortBox = sortData[s];
        				if(sortBox.target===null&&judgeCard.card.num===sortBox.length){
		            		var a = sortData.filter(function(el){
		            			return el.color!==""&&el.color!==sortBox.color;
		            		});
		            		if(a.length>=2){
		            			a.sort(function(a, b){
			            			return a.length - b.length;
			            		});
			            		if(sortBox.length<=a[0].length){
			            			sortBox.target = judgeCard;
			            		}
		            		}
        				}
        			}else{
        				var s = sortData.findIndex(function(el){
            				return el.length<=0&&el.target===null&&judgeCard.card.num===el.length;
            			});
            			if(s!==-1){
	            			sortData[s].target = judgeCard;
	            		}
        			}     			
            	}
            	var change = false;
            	for(var sortData_key in sortData){
            		if(sortData[sortData_key].target!==null){
            			var card = sortData[sortData_key].target.card;		            			
			        	var oldType = sortData[sortData_key].target.type;
			        	var oldIndex = sortData[sortData_key].target.index; 
            			var data = this.spliceData(oldType,oldIndex, "sort",parseInt(sortData_key),1);
			        	var order = this.putCard["sort"][sortData_key].length-1;

			        	if(!this.step[this.stepCount]){
	        				this.step[this.stepCount] = [];
	        			}
	        			
	        			this.step[this.stepCount].push({
	        				oldType:oldType,
	        				oldIndex:oldIndex,
	        				type:"sort",
	        				index:parseInt(sortData_key),
	        				len:1,
        					score:card.score
	        			});
	        			card.score = 5+this.combo*5;

						this.adjust(oldType,oldIndex);
						this.setCardAnimation(card,"sort",parseInt(sortData_key),order,0);
						change = true;
            		}
        		}
            	if(change){
            		clearTimeout(this.autoId);
			    	this.autoId = setTimeout(function(){
	        				this.combo++;
				    		this.autoMove();
				    	}.bind(this),50);
            	}else{
            		this.autoBool = false;
            	}
        	},
        	getMoveData:function(oldType, oldIndex, len){
        		var orderType = [];
        		if(oldType==="sort"){
        			orderType = ["base","free","sort"];
        		}else if(oldType==="base"){
        			orderType = ["sort","base","free"];
        		}else if(oldType==="free"){
        			orderType = ["sort","base","free"];
        		}
        		for(var orderType_key in orderType){
        			var type = orderType[orderType_key];
				    var putCard = this.putCard[type];
				    var order = [];
				    for(var putCard_key in putCard){
				    	order[putCard_key] = parseInt(putCard_key);
				    }
				    var sort = false;
				    if(orderType[orderType_key]==="base"){
						order.sort(function(a, b) {
							return putCard[b].length - putCard[a].length;
						});	
						sort = true;	    
					}
            		for(var order_key in order){
            			var key = -1;
            			if(orderType[orderType_key]!==oldType){
            				key = order[order_key];
            			}else{
            				key = order[(parseInt(order_key)+(sort?0:(order.indexOf(oldIndex)+1)))%putCard.length];
            			}
            			if(this.hasSpliceRange(oldType, oldIndex, type, key, len)){	    		
					    	return {type:type,index:key};
				    	}
            		}
            	}
        	},
        	spliceData:function(oldType, oldIndex, type, index, len){
    			var data = this.putCard[oldType][oldIndex].splice(-len, len);
		    	this.putCard[type][index] = this.putCard[type][index].concat(data);
		    	return data;				    	
        	},
        	hasSpliceRange:function(oldType, oldIndex, type, index, len){
		    	if(type===undefined||index===undefined){				    		
		    		return false;
		    	}	
		    	if((type===oldType)&&(index===oldIndex)){
		    		return false;
		    	}
        		if((type==="free"||type==="sort")&&(len>1)){		        			
		    		return false;
        		}
        		var dragTarget = this.putCard[oldType][oldIndex];
        		dragTarget = this.cards[dragTarget[dragTarget.length-len]];	        		
		    	var putCard = this.putCard[type];
        		var len00 = putCard[index].length;
        		if(type==="free"&&len00>0){
		    		return false;				    	
        		}
	    		if(type==="base"&&len00<=0){
	    			if(len>this.getMoveMax(this.freeblank,this.baseblank-1)){
	    				return false;
	    			}
        		}
        		if(type==="sort"&&len00!==dragTarget.num){
        			return false;
        		}
        		var card = this.cards[putCard[index][len00-1]];
        		if(type==="sort"&&len00>0){
        			if(card.type!==dragTarget.type){
		    			return false;
        			}
        		}
        		if(type==="base"&&len00>0){
        			if((card.num!==dragTarget.num+1)||(this.type[card.type].color===this.type[dragTarget.type].color)){
        				return false;
        			}
        		}
		    	return true;
		    },				    
		    card_mousedown:function(e,item,type,index,order){
        		if(this.transitions||this.autoBool||this.pause||!this.timeBool){
        			return;
        		}
		    	if (e.button && e.button !== 0) {
	                return;
	            }			            
	            this.dragType = type;
	            this.dragIndex = index;
	            this.dragOrder = order;
		    },
		    getPutBoxPos:function(type, index, order){
    			var rect = this.collisionRect[type][index];
    			if(type==="base"){
    				var count = Math.max(10,this.putCard[type][index].length)-1;
    				if(count>0){			    					
    					count = 1/count;
    				}
    				return {left:rect.left,top:order*(rect.bottom-rect.top-this.cardHeight)*count+rect.top};
    			}		    		
			    return {left:rect.left,top:rect.top};		    						    	
		    },
		    cardStyle:function(item,type,index,order){
		    	var z = 0;
		    	if(type=='sort'){
		    		z = (item.animation?200:0)+order;
		    	}else if(type=='free'){		    		
		    		z = (item.animation?200:0)+order;
		    	}else if(type=='base'){		    		
		    		z = (this.transitions&&item.animation)?((this.putCard[type][index].length-order)*100):((item.animation?100:0)+order);
		    	}
				return {
					left:item.pos.x+'px',
					top:item.pos.y+'px',
					zIndex:z,
					width:this.cardWidth+'px',
					height:this.cardHeight+'px',
					backgroundImage: 'url('+'img/'+item.imgSrc+')'
				};
			},
			cardDragStyle:function(item,index){
				return {
					left:item.pos.x+'px',
					top:item.pos.y+'px',
					zIndex:index,
					width:this.cardWidth+'px',
					height:this.cardHeight+'px',
					backgroundImage: 'url('+'img/'+item.imgSrc+')'
				};
			},
			back_click:function(){
				if(this.step.length>1){
					var backStep = this.step.splice(-1, 1)[0];
					for(var i=backStep.length-1;i>=0;i--){
						var temp = backStep[i];
						var order = this.putCard[temp.type][temp.index].length - temp.len;
						var data = this.spliceData(temp.type, temp.index, temp.oldType, temp.oldIndex, temp.len);
						this.adjust(temp.type, temp.index,temp.oldType, temp.oldIndex);
						this.cards[data[0]].score = temp.score;
						for(var key in data){
							var card = this.cards[data[key]];
							this.setCardAnimation(card,temp.oldType,temp.oldIndex,this.putCard[temp.oldType][temp.oldIndex].length-temp.len+parseInt(key),50*parseInt(key));
						}
					}
					this.stepCount--;
				}
			},
			menu_click:function(){
				this.pause = true;
        		this.page = "menu";
			},
			close_click:function(){
				this.pause = false;
        		this.page = "";
			},
			restart_click:function(){				
				this.init();
			},
			new_click:function(){
				this.random = this.getRandom();
				this.init();
			}
		},
	    computed:{
			showTime:function(){
				var time = Math.floor(this.time/1000);
				var m = Math.floor(time/60);
				var s = time%60;
				return m+":"+(s<10?"0":"")+s;
			},
			score:function(){
				var score = 0;
			    for(var key in this.cards){
			    	score+=this.cards[key].score;
			    }
				return score;
			},
			putRectStyle:function(){
				if(!this.putRect){
					return null;
				}
				return {
					left:this.putRect.left+'px',
					top:this.putRect.top+'px',
					width:this.putRect.width+'px',
					height:this.putRect.height+'px'
				}
			}
		}
    });
}