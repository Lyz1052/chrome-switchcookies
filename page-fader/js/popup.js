$('body').on('mouseenter','.user .row,.env .row',function(){
    $(this).append('<div class="delete"></div>');
}).on('mouseleave','.user .row,.env .row',function(){
    $(this).find('.delete').remove();
})

$(function(){
    var data = readData();
    $('#setBtn').on('click',function(){
        //关闭popup
        //跳转设置页
    })

    $('#adduserBtn').on('click',function(){
        //关闭popup
        //跳转设置页
    })

    $('#relogBtn').on('click',function(){
        //关闭popup
        //跳转设置页
    })
})