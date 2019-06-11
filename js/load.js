
var Load = {
    loadTime: 10000,  //倒计时时间
    baseUrl: 'https://cheyixiao.autoforce.net',
    query: null,
    //记录不合法抽奖与否状态 0:未传id或user  1:合法且未抽奖  2:合法已抽奖  3:后台返回不合法 
    prize: 1,  
    content:[
        "",
        "感谢您一路的支持和帮助",
        "凛冬之下，唯有信任不可辜负",
        "未来的日子里",
        "我们将拼搏奋进",
        "始终秉承“赋能车商、成就车商”的使命",
        "为寒冬中的汽车行业送上一份暖阳",
        "期待与您携手同行，一如既往向前奔！"
    ],
    customer: [
        {
            id: 1,
            name: '徐萌萌',
            firstName: '徐'
        },
        {
            id: 2,
            name: '孙雷',
            firstName: '孙'
        },
        {
            id: 3,
            name: '张薇',
            firstName: '张'
        },
        {
            id: 4,
            name: '刘同',
            firstName: '刘'
        },
        {
            id: 5,
            name: '曹霞',
            firstName: '曹'
        },
        {
            id: 6,
            name: '张旭',
            firstName: '张'
        },
        {
            id: 7,
            name: '楼灵燕',
            firstName: '楼'
        },
        {
            id: 8,
            name: 'Anna Xu',
            firstName: 'Anna Xu'
        },
        {
            id: 9,
            name: '卓巧丽',
            firstName: '卓'
        },
        {
            id: 10,
            name: 'Diana',
            firstName: 'Diana'
        },
        {
            id: 11,
            name: '赵熠',
            firstName: '赵'
        },
        {
            id: 12,
            name: '刘林',
            firstName: '刘'
        },
        {
            id: 13,
            name: '乔顺昌',
            firstName: '乔'
        },
        {
            id: 14,
            name: 'Michael Cui',
            firstName: 'Michael Cui'
        },
        {
            id: 15,
            name: '崔广福',
            firstName: '崔'
        },
        {
            id: 16,
            name: '李晶',
            firstName: '李'
        },
        {
            id: 17,
            name: '窦文扬',
            firstName: '窦'
        },
        {
            id: 18,
            name: '陈晓昂',
            firstName: '陈'
        },
        {
            id: 19,
            name: '沈奇',
            firstName: '沈'
        },
        {
            id: 20,
            name: '车玉梅',
            firstName: '车'
        },
        {
            id: 21,
            name: '韩波',
            firstName: '韩'
        },
        {
            id: 22,
            name: '杨总',
            firstName: '杨'
        },
        {
            id: 23,
            name: '张总',
            firstName: '张'
        },
        {
            id: 24,
            name: '史总',
            firstName: '史'
        }
    ],

    loadInit:function() {
        this.query = getParamFromUrl(window.location.href); //初始化获取查询参数
        if(this.query.id && this.query.user){
            this.getStatus();
            this.getNameById();
        }else{
            this.prize = 0;
            this.getContent();
            
        }
        
    },
    getNameById: function(){
        var fName = "";
        var _this = this;
        this.customer.forEach(function(item){
            if(item.id === Number(_this.query.id)){
                fName = item.firstName;
            }
        });
        
        !!fName ? this.content[0] = "亲爱的"+fName+"总" : "";
    },

    loadProgress: function(){
        var _this = this;
        var timer = setInterval(function(){
            
            var wrapW = getById("loadProgress").parentNode.clientWidth;
            var progreW = getById("loadProgress").clientWidth;
            var per = parseInt( (progreW/wrapW).toFixed(2)*100 ) +"%"; 
            getById("progVal").innerText = per;
        },200);
        /* var i = 0;
        var contentTimer = setInterval(function(){
            $("#content .content-p")[i].style.opacity = 1;
            i++;
        },1000) */
        
        //倒计时后结束loading页面开始游戏
        setTimeout(function(){
            window.clearInterval(timer);
            getById('start').click();
            getById("loading_wrap").style.display = "none";
        },_this.loadTime);
    },

    getContent:function(){
        var cont = this.content.map(function(item){
            return '<p class="content-p">'+item+'</p>';
        });
        getById("content").innerHTML = cont.join("");
        this.loadProgress();
    },

    getStatus: function(){
        var _this = this;
        //debugger
        $.ajax({
            url: _this.baseUrl + '/api/h5/prize/share/user/status',
            data: {
                user_id: _this.query.id,
                name: _this.query.user
            },
            success: function (res) {
                if (res.code == 404){
                    // 链接不合法  不显示抽奖的转盘
                    console.log('不合法的链接');
                    this.prize = 3;
                } else if (res.code == 202){
                    // 未抽过奖   //要显示抽奖的转盘
                    console.log('未抽过奖');
                    this.prize = 1;
                } else if(res.code == 200) {
                    // 已抽过奖   
                    console.log('已抽过奖');
                    this.prize = 2;
                }
                _this.getContent();
            },
            error: function (err) {
                
            }
        });
    }
}