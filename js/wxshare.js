function getData(cb) {
    cb.times = cb.times || 6;
    var url = location.href.split('#')[0];
    $.ajax({
        url: 'https://cheyixiao.autoforce.net/v3/wx/signature?url=' + encodeURIComponent(url),
        type: 'GET',
        success: function (res) {
            if (res.code === 200) {
                cb && cb(res);
            }
        },
        error: function (err) {
            if (cb.times > 1) {
                cb.times--;
                getData(cb);
            } else {
                alert('网络错误，请稍后再试！');
            }
        }
    })
}

getData(function (res) {
    wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: res.appid, // 必填，公众号的唯一标识
        timestamp: res.timestamp, // 必填，生成签名的时间戳
        nonceStr: res.nonceStr, // 必填，生成签名的随机串
        signature: res.signature,// 必填，签名
        jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'] // 必填，需要使用的JS接口列表
    });
    var _href = window.location.href;
    var hrefArr = _href.split('?');
    var link = hrefArr[0] + '?id=' + cur.id + '&user=' + cur.user;
    var imgUrl = 'https://cdn.autoforce.net/ixiao/app/award/img/share_logo.jpg';

    wx.ready(function () {
        wx.onMenuShareTimeline({//朋友圈
            title: '一封来自车势公司的密件，请亲启！',
            link: link,
            imgUrl: imgUrl,
            success: function () {
                // 用户确认分享后执行的回调函数
                console.log('分享到朋友圈成功');
            },
            cancel: function () {
                // 用户取消分享后执行的回调函数
                console.log('你没有分享到朋友圈');
            }
        });
        wx.onMenuShareAppMessage({//朋友
            title: '一封来自车势公司的密件，请亲启！',
            desc: '新春贺岁，车势感谢您一直以来的支持，特为您定制了一份专属惊喜，记得滑到最后试试手气哟~',
            link: link,
            imgUrl: imgUrl,
            trigger: function (res) {
                // 不要尝试在trigger中使用ajax异步请求修改本次分享的内容，因为客户端分享操作是一个同步操作，这时候使用ajax的回包会还没有返回
            },
            success: function (res) {
                console.log('分享给朋友成功');
            },
            cancel: function (res) {
                console.log('你没有分享给朋友');
            },
            fail: function (res) {
                console.log(JSON.stringify(res));
            }
        });
    });
});