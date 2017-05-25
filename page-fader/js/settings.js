if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}

var cached=[];//cached cookies
var pageOperating = false;//是否正在操作 
var myStorage = new LSTOG();

/**
 * Cookie有关方法
 */
var cookieFunction = {
    addCookie(obj){
        var domain = $(obj).closest('tr').find('td[role="domain"]').html();
        var domainName = $(obj).closest('tr').find('td[role="domainName"]').html();
        var localStorageItem = getDomainLocalStorageItem(domain);

        $('#domainTitle').html(domain);

        $('#domainInput').val(domain);

        $('#domainNameInput').val(domainName);

        if(localStorageItem){
            $('#accountNameInput').val(localStorageItem?localStorageItem.name:'');
        }

        $('#addModal').modal('show');
    },
    confirmAddCookie(){
        if(!$('#accountNameInput').val()){
            return;
        }

        var domain = $('#domainInput').val();

        var domainName = $('#domainNameInput').val();

        var name = $('#accountNameInput').val();

        var cookies = getCookies(domain);

        var saver = new LSTOG(domain);

        saver.set({//站点名和该站点的默认账户名（当前存储的Cookies作为该站点的默认的账户名）
            name:domainName,
            dafaultName:name
        });

        saver.set(name,{//账户名
            cookies:cookies
        });

        $('#addModal').modal('hide');
    }
}

/**
 * 页面，事件初始化
 */
$(function(){
    chrome.cookies.getAll({}, function(cookies) {
        cached = cookies;
        loadCookie();
        loadStorage();
    });

    $('#searchDomainInput').on('input',function(){
        loadCookie($(this).val());
    })

    $('#searchDomainBtn').on('click',function(){
        loadCookie($('#searchDomainInput').val());
    })

    $('body').on('click','button[role]',function(){
        cookieFunction[$(this).attr('role')].call(this,this)
    })

    $('.modal').on('hidden.bs.modal',function(){
        loadCookie();
        loadStorage();
    })
    
})
/**
 * 获取Cookie
 * @param {*} domain 
 */
function getCookies(domain){
    if(domain){
        return cached.filter(function(cookie){
            return cookie.domain == domain;
        })
    }else{
        return cached;
    }
}

/**
 * 加载并显示Cookie
 * @param {*} searchDomain 
 */
function loadCookie(searchDomain){
    pageOperating = true;
    var cookies = getCookies();
    var localStorageData = myStorage.getAll();
    
    var loader = {
        map:[],
        render(){
            var html = "";
            this.map.forEach(function(e){
                var domain = e.domain;
                html += "<tr>";

                if(searchDomain){
                    if(domain.indexOf(searchDomain)==-1)
                        return;
                }

                var local = getDomainLocalStorage(localStorageData,domain);
                var domainName = local?local.get('name'):'';
                var cookies = e.cookies;

                html+="<td role='domain'>"+domain+"</td>";//域名地址
                html+="<td role='domainName'>"+domainName+"</td>";//名称
                html+="<td role='count'>"+cookies.length+"</td>";//数量
                // if(!getDomainLocalStorageItem(domain,cookies,local,localStorageData))
                html+="<td><div class='btn-group'><button role='addCookie' type='button' class='btn btn-default'>添加</button></div></td>";
                // else
                //     html+="<td><div class='btn-group'><button role='updateCookie' type='button' class='btn btn-default'>更新</button></div></td>";

                html+="</tr>"
            });
            $('#browserCookie').html(html);
        },setMap(cookie){
            var domain = cookie.domain;
            var filtered = this.map.filter(function(e){
                return e.domain == domain;
            })
            if(filtered.length){
                filtered[0].cookies.push(cookie);
            }else{
                this.map.push({
                    domain:domain,
                    cookies:[cookie]
                })
            }
        }
    };

    cookies.forEach(function(cookie){
        loader.setMap(cookie);
    })

    loader.render();
    
    pageOperating = false;
}


/**
 * 加载并显示本地存储
 */
function loadStorage(){

    var html ="";
    myStorage.getAll().forEach(function(data){
        var domain = data.domain;
        var domainName = data.get('name');
        var domainCookies = getCookies(domain);

        data.items.forEach(function(item){
            html += "<tr>";
            var name = item.name;
            var cookies = item.get('cookies');

            html+="<td>"+domain+"</td>";//域名地址
            html+="<td>"+domainName+"</td>";//名称
            html+="<td>"+cookies.length+"</td>";//数量
            html+="<td>"+name+"</td>";//账户

            // if(checkSameCookie(cookies,domainCookies))
                html+="<td><div class='btn-group'><button role='deleteCookie' type='button' class='btn btn-default'>删除</button></div></td>";
            // else
            //     html+="<td><div onclick='updateCookie(this)'>更新</div><div>删除</div></td>";

            html+="</tr>"
        })

    })
    $('#storagedCookie').html(html);
}

/**
 * 根据指定的Cookies，获取domain的本地存储
 */
function getDomainLocalStorageItem(domain,cookies,filteredLocal,localStorageData){
    var localStorageItem = null;

    localStorageData = localStorageData || myStorage.getAll();
    
    if(!cookies){
        var allCookie = getCookies();
        var filteredCookies = allCookie.filter(function(cookie){
            return cookie.domain == domain;
        });
        if(filteredCookies.length){
            cookies = filteredCookies;
        }
    }

    filteredLocal = filteredLocal || getDomainLocalStorage(localStorageData,domain);

    if(filteredLocal){
        filteredLocal.items.forEach(function(item){
            if(checkSameCookie(item.get('cookies'),cookies)){
                localStorageItem = item;
                return false;
            }
        });
    }

    return localStorageItem;
}

/**
 * 获取domain的所有Cookies本地存储
 * @param {*} localStorageData 
 * @param {*} domain 
 */
function getDomainLocalStorage(localStorageData,domain){
    var filtered = localStorageData.filter(function(data){
        return data.domain == domain
    });

    if(filtered.length)
        return filtered[0];
    else
        return null;
}




// function checkSameCookie(){

// }

/**
 * 检查cookie是否相同
 * @param {*} c1 
 * @param {*} c2 
 */
function checkSameCookie(c1, c2) {
    return false;
//   return (c1.name == c2.name) && (c1.domain == c2.domain) &&
//          (c1.hostOnly == c2.hostOnly) && (c1.path == c2.path) &&
//          (c1.secure == c2.secure) && (c1.httpOnly == c2.httpOnly) &&
//          (c1.session == c2.session) && (c1.storeId == c2.storeId);
}