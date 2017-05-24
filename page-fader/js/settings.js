if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}

var cached=[];//cached cookies
var pageOperating = false;//是否正在操作 
var myStorage = new LOCALSTORAGE();

$(function(){
    chrome.cookies.getAll({}, function(cookies) {
        cached = cookies;
        loadCookie();
    });
})

function getCookie(domain){
    if(domain){
        return cached.filter(function(cookie){
            return cookie.domain == domain;
        })
    }else{
        return cached;
    }
}

function loadCookie(){
    var cookies = getCookie();
    var localStorageData = myStorage.getAll();
    var html = "";

    cookies.forEach(function(cookie){
        html = "<tr>";
        var domain = cookie.domain;
        var local = getlocalStorage(localStorageData,domain);
        var domainName = local?local.get('name'):'';

        html+="<td>"+domain+"</td>";//域名地址
        html+="<td>"+domainName+"</td>";//名称

        if(!haslocalStorage(localStorageData,domain,cookie))
            html+="<td><div onclick='addCookie(this)'>添加</div></td>";
        else
            html+="<td><div onclick='updateCookie(this)'>更新</div></td>";

        html+="</tr>"
    })

    $('#browserCookie').html(html);
}

function loadStorage(){

    var html ="";
    myStorage.getAll().forEach(function(data){
        var domain = data.domain;
        var domainName = data.get('name');
        var domainCookie = getCookie(domain);

        data.items.forEach(function(item){
            html = "<tr>";
            var name = item.name;
            var cookie = item.get('cookie');

            html+="<td>"+domain+"</td>";//域名地址
            html+="<td>"+domainName+"</td>";//名称
            html+="<td>"+name+"</td>";//账户

            if(checkSameCookie(cookie,domainCookie))
                html+="<td><div onclick='deleteCookie(this)'>删除</div></td>";
            else
                html+="<td><div onclick='updateCookie(this)'>更新</div><div>删除</div></td>";

            html+="</tr>"
        })

    })
    $('#storagedCookie').html(html);
}

/**
 * 某地址下的指定cookie是否有本地存储
 * @param {*} localStorageData 
 * @param {*} domain 
 * @param {*} cookie 
 */
function haslocalStorage(localStorageData,domain,cookie){
    var result = false;

    var filtered = localStorageData.filter(function(data){
        return data.domain == domain
    });

    if(filtered.length){
        filtered.items.forEach(function(item){
            if(checkSameCookie(item.get('cookie'),domainCookie)){
                result = true;
                return false;
            }
        });
    }
    return result;
}

function getlocalStorage(localStorageData,domain){
    var filtered = localStorageData.filter(function(data){
        return data.domain == domain
    });

    if(filtered.length)
        return filtered[0];
    else
        return null;
}

function checkSameCookie(){

}

function cookieMatch(c1, c2) {
  return (c1.name == c2.name) && (c1.domain == c2.domain) &&
         (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
         (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
         (c1.session == c2.session) && (c1.storeId == c2.storeId);
}