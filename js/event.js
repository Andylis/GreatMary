/**
 * 抽奖
 */
var baseUrl = 'https://cheyixiao.autoforce.net';

var cur = {
    id: null,
    user: null,
    canDraw: 1,  //1 不合法链接， 2 未抽过奖， 3 已抽过奖
    prizeIdx: -1,
    prize: '',
    prizeImg: '',
    addrFlag: true
};
var cityData = {};
function findPrizeById(id) {
    var idx = prize.findIndex(function(it) {
        return it.id === Number(id);
    });
    if(idx > -1) {
        cur.prizeIdx = idx;
        cur.prize = prize[idx].name;
        cur.prizeImg = prize[idx].img;
    }
}
function getParamFromUrl(url){
    if(typeof url === 'string') {
        var tempArr = url.split('?');
        var search = tempArr[1];
        if(search) {
            var paraObj = {};
            var para = search.split('&');
            for(var i = 0, l = para.length; i < l; i++) {
                var it = para[i].split('=');
                paraObj[it[0]] = it[1];
            }
            return paraObj;
        } else {
            return {};
        }
    } else {
        return {};
    }
}
getUserState();
function getUserState() {
    var self = this;
    var query = getParamFromUrl(window.location.href);
    cur.id = query.id;
    cur.user = query.user;
    var idx = customer.findIndex(function(item) {
        return item.id === Number(cur.id);
    });
    if(idx > -1) {
        console.log('客户叫啥名儿？？？ ',customer[idx].name);
        //致亲爱的xxx显示客户姓名
        $('#customerName').text(customer[idx].firstName + '总');
    }
    console.log(query);
    self.time = self.time || 3;
    $.ajax({
        url: baseUrl + '/api/h5/prize/share/user/status',
        data: {
            user_id: cur.id,
            name: cur.user
        },
        success: function (res) {
            if (res.code == 404){
                // 链接不合法
                cur.canDraw = 1;
                // $('#toast').text(res.msg || '不合法的链接！').fadeIn().delay(3000).fadeOut();
                console.log('不合法的链接');
            } else if (res.code == 202){
                // 未抽过奖
                cur.canDraw = 2;
            } else if(res.code == 200) {
                // 已抽过奖
                cur.canDraw = 3;
                findPrizeById(res.prize_id);
                cur.addrFlag = res.address_status === 1 ? true : false;
                if(!cur.addrFlag) {
                    $('#prizeName').text(cur.prize);
                    $('#curPrize').attr('src', cur.prizeImg);
                    getCity();
                    showCurWrap($('.form-wrap'));
                }
            }
            // initAwardPage()
        },
        error: function (err) {
            if (self.times > 1) {
                self.times--;
                self.getUserState();
            } else {
                // initAwardPage();
                $('#toast').text('网络错误，请稍后再试！').fadeIn().delay(3000).fadeOut();
            }
        }
    });
};
function getPrize(cb){
    if(!cur.id ) {
        $('#awardToast').text('您没有抽奖权限！').fadeIn().delay(3000).fadeOut();
        return;
    }
    $.ajax({
        url: baseUrl + '/api/h5/prize/share/action',
        type: 'POST',
        data: {
            user_id: cur.id,
            name: cur.user
        },
        success: function(res) {
            if(res.code === 200) {
                findPrizeById(res.prize_id);
                if(cur.prizeIdx > -1) {
                    cb && cb();
                    getCity();
                    showCurWrap($('.form-wrap'));
                } else {
                    $('#awardToast').text(res.msg || '抽奖失败').fadeIn().delay(3000).fadeOut();
                }
            }/*else if(res.code === 202) {
                showCurWrap( $('.tip') );
                $('.form-bg').css('background-image', 'url(./img/toast_bg.png)');
            }*/else {
                $('#awardToast').text(res.msg || '抽奖失败').fadeIn().delay(3000).fadeOut();
            }
        }
    })
}
function getCity() {
    $.ajax({
        url: baseUrl + '/api/h5/prize/share/areas',
        success: function(res) {
            if(res.code === 200) {
                renderPrv(res.result);
            } else {
                $('#awardToast').text(res.msg || '获取城市列表失败！').fadeIn().delay(3000).fadeOut();
            }
        }
    })
}

function rotateFn(angles){  //控制轮盘在angle度停下
    var self = this;
    this.bRotate=!this.bRotate;
    $('#turntable').stopRotate();
    $("#turntable").rotate({
        angle: 0,                //旋转的角度
        animateTo: angles+1800,  //从当前角度旋转多少度
        duration: 3000,          //持续时间
        callback: function(){    //回调函数
        //todo 弹出中奖信息和联系方式表单
            $('#prizeName').text()
            $("#form").fadeIn("slow");
            this.bRotate=!this.bRotate;
        }
    })
}

function renderPrv(data) {
    var prvData = [];
    data.forEach(function(char_p, idx) {
        console.log(char_p);
        prvData[idx] = {
            char: char_p[0],
            prvList: []
        }
        char_p[1].forEach(function(prv) {
            prvData[idx].prvList.push({
                name: prv.name
            });

            cityData[prv.name] = [];
            prv.citys.forEach(function(char_c, idx) {
                cityData[prv.name][idx] = {
                    char: char_c[0],
                    cityList: []
                };
                char_c[1].forEach(function(city) {
                    cityData[prv.name][idx].cityList.push({
                        name: city.name
                    })
                })
            })
        })
    });

    var $prvList = $('#prvList');
    $prvList.empty();
    prvData.forEach(function(it) {
        // var $prvGroup = $('<div class="group"></div>');
        it.prvList.forEach(function(p_it) {
            var $prvItem = $('<div class="item">\
                <span class="name">' + p_it.name + '</span>\
            </div>');
            $prvList.append($prvItem)
        });
        // $prvList.append($prvGroup);
    });
    console.log(prvData, cityData);
}

function getFormInfo() {
    var info = {
        name: $('#userName').val().trim(),
        phone: $('#userPhone').val().trim(),
        city: $('#userCity').val(),
        addr: $('#userAddr').val().trim()
    };
    return info;
}

function validateInfo(info) {
    var flag = true;
    for(var key in info) {
        if(info.hasOwnProperty(key)) {
            if(!info[key]) {
                flag = false;
                $('#awardToast').text('请将邮寄信息填写完整！').fadeIn().delay(3000).fadeOut();
                return flag;
            }
            if(key === 'phone') {
                var reg = /^1[0-9]{10}$/;
                if(!reg.test(info[key])) {
                    flag = false;
                    $('#awardToast').text('请输入正确的手机号码！').fadeIn().delay(3000).fadeOut();
                    return flag;
                }
            }
        }
    }
    return flag;
}
function showCurWrap($wrap) {
    $('#form').show();
    $wrap.fadeIn();
    $wrap.siblings('.sib-wrap').hide();
}

function temporaryRepair(){
    var currentPosition, timer;
    var speed = 1;//页面滚动距离
    timer=setInterval(function(){
        currentPosition=document.documentElement.scrollTop || document.body.scrollTop;
        currentPosition-=speed; 
        window.scrollTo(0,currentPosition);//页面向上滚动
        currentPosition+=speed; //speed变量
        window.scrollTo(0,currentPosition);//页面向下滚动
        clearInterval(timer);
    },1);
}

function renderCity(prv) {
    var $cityCon = $('#cityCon');
    $cityCon.empty();
    var curCityData = cityData[prv];
    curCityData.forEach(function(it) {
        // var $cityGroup = $('<div class="group"></div>');
        it.cityList.forEach(function(p_it) {
            var $cityItem = $('<div class="item">' + p_it.name + '</div>');
            $cityCon.append($cityItem)
        });
        // $cityList.append($cityGroup);
    });
}

function initAwardPage() {
    if(cur.canDraw === 3) {
        $('#pointer').hide();
        if(cur.addrFlag) {//已抽奖并已填写信息的显示邮寄页
            $('.form-bg').css('background-image', 'url(./img/toast_bg.png)');
            showCurWrap($('.send-wrap'));
        } else {//已抽奖未填写信息的显示信息表单页
            $('#prizeName').text(cur.prize);
            $('#curPrize').attr('src', cur.prizeImg);
            getCity();
            showCurWrap($('.form-wrap'));
        }
    }
}
$("#selectAddr").click(function(){
    showCurWrap($(".prv-wrap"));
});
$("#submit").click(function(){
    var info = getFormInfo();
    var flag = validateInfo(info);
    if(flag) {
        $.ajax({
            url: baseUrl + '/api/h5/prize/share/user/info',
            type: 'POST',
            data: {
                phone: info.phone,
                address: info.city + ' ' + info.addr,
                name: info.name,
                user_id: cur.id
            },
            success: function(res) {
                if(res.code === 200) {
                    $('#awardToast').text(res.msg || '信息提交成功！').fadeIn().delay(3000).fadeOut();
                    $('.form-bg').css('background-image', 'url(./img/toast_bg.png)');
                    showCurWrap($('.send-wrap'));
                } else {
                    $('#awardToast').text(res.msg || '提交失败！').fadeIn().delay(3000).fadeOut();
                }
            }
        })
    }
});


$('.hot-list').on('click', '.city-item', function(){
    var curAddr = $(this).data('val');
    $('#userCity').val(curAddr);
    showCurWrap($(".form-wrap"));
});

$('.prv-list').on('click', '.item', function(){
    var curPrv = $(this).find('.name').text();
    renderCity(curPrv);
    $('#selectedPrv').text(curPrv);
    $('#selectedCity').text('请选择城市');
    showCurWrap($(".city-wrap"));
});

$('.city-list').on('click', '.item', function(){
    var curCity = $(this).text();
    $('#selectedCity').text(curCity);
    var curAddr = $('#selectedPrv').text() + ' ' + curCity;
    $('#userCity').val(curAddr);
    showCurWrap($(".form-wrap"));
});

$('.prv-wrap .close').click(function(){
    showCurWrap($(".form-wrap"));
});

$('.city-wrap .close').click(function(){
    showCurWrap($(".prv-wrap"));
});

$('input').on('blur', function(){//修复ios微信浏览器键盘无法回弹bug
    temporaryRepair();
});

$('#userCity').on('focus', function() {//修复ios readonly bug
    $(this).blur();
})
