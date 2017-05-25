var myStorage = new LSTOG();

$('body').on('mouseenter','.user .row,.env .row',function(){
    // $(this).append('<div class="delete"></div>');
}).on('mouseleave','.user .row,.env .row',function(){
    // $(this).find('.delete').remove();
})

$(function(){
    var domains = myStorage.getAll('domains');

    if(!domains.length){//当没有本地设置时，设置账号信息
        jumpSettingPage();
        return;
    }

    $('body').on('click','#env .row',function(){//切换地址
        $(this).siblings().removeClass('ok');
        $(this).addClass('ok');

        //渲染
        var domain = $(this).attr('data-domain');
        var data = getDomainLocalStorage(domain);
        if(data&&data.items){
            var html = "";
            data.items.forEach(function(e){
                var className = "hover row ";
                if(data.get('defaultName') == e.name){//默认账户
                    className+="ok";
                }

                html+='<div data-domain="'+domain+'" data-name="'+e.name+'" class="'+className+'">'
                        + '<div class="text">'+e.name+'</div></div>';
            })
            $('#user').html(html);
        }
    })

    $('body').on('click','#user .row',function(){//切换账户
        $(this).siblings().removeClass('ok');
        $(this).addClass('ok');
        var domain = $(this).attr('data-domain');
        var name = $(this).attr('data-name');
        var cookies = getDomainLocalStorage(domain).items.filter(function(e){
            return e.name == name;
        })[0].get('cookies');

        cookies.forEach(function(cookie){
            var copied = {
                url:'http://*/*',
                name:cookie.name,
                value:cookie.value,
                domain:cookie.domain,
                path:cookie.path,
                secure:cookie.secure,
                // httpOnly:cookie.httpOnly,
                // expirationDate:cookie.expirationDate,
                // sameSite:cookie.sameSite,
                storeId:cookie.storeId
            };
            chrome.cookies.set(cookie,function(c){

            });
        })
    });
    
    chrome.tabs.query({active:true},function(tabs){
        var data = getDomainLocalStorage();
        var html = "";

        //渲染
        data.forEach(function(e){
            html+='<div data-domain="'+e.domain+'" class="hover row"><div class="text" title="'+e.domain+'">'+e.get('name')+'</div></div>';
        })
        $('#env').html(html);

        $("body").on("click",".delete",function(){
            
        })

        $('#setBtn').on('click',function(){
            jumpSettingPage();
        })

        $('#adduserBtn').on('click',function(){
            window.close();
            //跳转设置页
        })

        $('#relogBtn').on('click',function(){
            window.close();
            //跳转设置页
        })
    })

})

function jumpSettingPage(){
    var manager_url = chrome.extension.getURL("settings.html");
    focusOrCreateTab(manager_url);
    window.close();
}

function focusOrCreateTab(url) {
  chrome.windows.getAll({"populate":true}, function(windows) {
    var existing_tab = null;
    for (var i in windows) {
      var tabs = windows[i].tabs;
      for (var j in tabs) {
        var tab = tabs[j];
        if (tab.url == url) {
          existing_tab = tab;
          break;
        }
      }
    }
    if (existing_tab) {
      chrome.tabs.update(existing_tab.id, {"selected":true});
    } else {
      chrome.tabs.create({"url":url, "selected":true});
    }
  });
}

function getDomainLocalStorage(domain){
    var all = myStorage.getAll();
    if(!all||!all.length){
        return null;
    }else{
        if(domain){
            var filtered = all.filter(function(e){
                return e.domain == domain;
            });

            return filtered.length?filtered[0]:null;
        }else{
            return all;
        }
    }
}