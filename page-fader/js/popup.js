$('body').on('mouseenter','.user .row,.env .row',function(){
    $(this).append('<div class="delete"></div>');
}).on('mouseleave','.user .row,.env .row',function(){
    $(this).find('.delete').remove();
})

$(function(){
    var settings = getSettings();

    if(!settings){//当没有本地设置时，设置账号信息
        // var manager_url = chrome.extension.getURL("settings.html");
        // focusOrCreateTab(manager_url);
        // window.close();
        // return;
    }
    chrome.tabs.query({active:true},function(tabs){
        alert(tabs[0].url);
        $("body").on("click",".delete",function(){

        })

        $('#setBtn').on('click',function(){
            window.close();
            //跳转设置页
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

function getSettings(domain){
    var local = new LOCALSTORAGE();
    var domains = local.getAllDomain();
    if(!domain||!domains.length){
        return null;
    }else{
        if(domain){
            var filtered = domains.filter(function(e){
                return e.domain == domain;
            });

            return filtered.length?filtered[0]:null;
        }else{
            return domains;
        }
    }
}