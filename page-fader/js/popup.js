var myStorage = new LSTOG();
var cookiesMap ={};
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
        var defaultNameObj = new LSTOG(false).get('defaultName');//获取默认账户
        var domainName = $(this).attr('data-domainName');
        var data = cookiesMap[domainName];
        var html = ""
        
        for(var name in data){
            var className = "hover row ";
            
            if(defaultNameObj.get('name') == name){//默认账户
                className+="ok";
            }

            html+='<div data-domainName="'+domainName+'" data-name="'+name+'" class="'+className+'">'
                    + '<div class="text">'+name+'</div></div>';
        }

        $('#user').html(html);

    });

    $('body').on('click','#user .row',function(){//切换账户
        $(this).siblings().removeClass('ok');
        $(this).addClass('ok');
        var domainName = $(this).attr('data-domainName');
        var name = $(this).attr('data-name');

        var domainAndCookies = cookiesMap[domainName][name];

        domainAndCookies.cookies.forEach(function(cookie){
            chrome.cookies.set(cookieForCreationFromFullCookie(cookie),function(c){

            });
        })

        //修改默认账户
        var defaultSetting = new LSTOG(false);
        defaultSetting.set('defaultName',{
            domainName:domainName,
            name:name
        })
    });
    
    chrome.tabs.query({active:true},function(tabs){
        var data = getDomainLocalStorage();

        /**
         * 数据结构：
         * {
         *  '淘宝':{
         *          'tbaccount01':[{domain:'.taobao.com',cookies:[...cookies]},{a.taobao.com,cookies:[...cookies]}]
         *          'tbaccount02':[{domain:'.taobao.com',cookies:[...cookies]},{a.tabao.com,cookies:[...cookies]}]
         *      }
         * }
         */

        data.forEach(function(e){
            var name = e.get('name');
            cookiesMap[name] = cookiesMap[name] || {};
            e.items.forEach(function(item){
                cookiesMap[name][item.name] = cookiesMap[name][item.name] || [];
                cookiesMap[name][item.name].push({
                    domain:e.domain,
                    cookies:item.get('cookies')
                });
            })
            
        })

        var html = "";

        //渲染
        for(var domainName in cookiesMap){
            html+='<div data-domainName="'+domainName+'" class="hover row"><div class="text">'+domainName+'</div></div>';
        }

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

function cookieForCreationFromFullCookie(fullCookie) {
	var newCookie = {};
    //If no real url is available use: "https://" : "http://" + domain + path
    newCookie.url = "http" + ((fullCookie.secure) ? "s" : "") + "://" + fullCookie.domain + fullCookie.path;
    newCookie.name = fullCookie.name;
    newCookie.value = fullCookie.value;
    if(!fullCookie.hostOnly)
        newCookie.domain = fullCookie.domain;
    newCookie.path = fullCookie.path;
    newCookie.secure = fullCookie.secure;
    newCookie.httpOnly = fullCookie.httpOnly;
    if(!fullCookie.session)
        newCookie.expirationDate = fullCookie.expirationDate;
    newCookie.storeId = fullCookie.storeId;
    return newCookie;
}