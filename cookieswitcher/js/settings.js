if (!chrome.cookies) {
  chrome.cookies = chrome.experimental.cookies;
}

var cached=[];//cached cookies
var pageOperating = false;//是否正在操作，操作时不自动刷新列表
var myStorage = new LSTOG();

/**
 * Cookie有关方法
 */
var cookieFunction = {
    inspectCookie(obj){
        var cookies;
        var domain = $(obj).closest('tr').find('td[role="domain"]').html();
        var domainName = $(obj).closest('tr').find('td[role="domainName"]').html();

        if($(obj).closest('#storagedCookie').length){
            var name = $(obj).closest('tr').find('td[role="name"]').html();
            cookies = new LSTOG(domain).get(name).get('cookies');
        }else if($(obj).closest('#browserCookie').length){
            cookies = getCookies(domain);
        }

        if(cookies&&cookies.length){
            var html = "";
            cookies.forEach(function(cookie,i){
                html+="<tr><td>"+(i+1)+"</td><td title='"+cookie.name+"'>"+cookie.name+"</td><td title='"+cookie.value+"' >"+cookie.value+"</td></tr>"
            })
            $('#cookieModal tbody').html(html);
            $('#cookieModal').modal('show');
        }
    },
    addCookie(obj){
        pageOperating = true;

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

        pageOperating = false;
    },
    confirmAddCookie(){
        pageOperating = true;

        $('#accountNameInput').trigger('input');//显示错误提示
        $('#domainNameInput').trigger('input');

        if(!$('#accountNameInput').val()||!$('#domainNameInput').val()){
            return;
        }

        var domain = $('#domainInput').val();

        var domainName = $('#domainNameInput').val();
        domainName = domainName?domainName:domain;//（必填，缺省值为地址值）

        var name = $('#accountNameInput').val();

        var cookies = getCookies(domain);

        var saver = new LSTOG(domain);

        var defaultSettingSaver = new LSTOG(false);

        defaultSettingSaver.set('defaultName',{//该站点的默认登陆者
            domainName:domainName,
            name:name
        });

        saver.set({//站点名
            name:domainName
        });

        saver.set(name,{//账户名
            cookies:cookies
        });

        pageOperating = false;

        $('#addModal').modal('hide');
    },
    deleteCookie(obj){
        pageOperating = true;
        var domain = $(obj).closest('tr').find('td[role="domain"]').html();
        var name = $(obj).closest('tr').find('td[role="name"]').html();
        var deleter = new LSTOG(domain);
        deleter.clear(name);
        loadStorage();
        pageOperating = false;
    }
}



/**
 * 页面，事件初始化
 */
$(function(){

    cacheCookies(function(){
        loadCookie();
        loadStorage();
    });

    chrome.cookies.onChanged.addListener(function(c){//cookies的change事件
        if(!pageOperating)
            cacheCookies(function(){
                loadCookie();
                loadStorage();
            })
    });

    $('[data-toggle="popover"]').popover();

    $('#searchDomainInput').on('input',function(){
        loadCookie();
    })

    $('#domainNameInput').on('input',function(){
        if($(this).val()){
            $(this).parent().removeClass('has-error');
        }else{
            $(this).parent().addClass('has-error');
        }
    })

    $('#accountNameInput').on('input',function(){
        if($(this).val()){
            $(this).parent().removeClass('has-error');
        }else{
            $(this).parent().addClass('has-error');
        }
    })

    $('#searchDomainBtn').on('click',function(){
        loadCookie();
    })

    $('body').on('click','button[role]',function(e){
        cookieFunction[$(this).attr('role')].call(this,this);
        e.stopPropagation();
        return false;
    })

    $('.modal').on('hidden.bs.modal',function(){
        loadCookie();
        loadStorage();
    })

})

/**
 * 缓存Cookies
 * @param {*} callback 
 */
function cacheCookies(callback){
    chrome.cookies.getAll({}, function(cookies) {
        cached = cookies;
        callback();
    });
}

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
function loadCookie(){
    pageOperating = true;
    searchDomain = $('#searchDomainInput').val();
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
                html+="<td><div class='btn-group' role='group'><button role='inspectCookie' type='button' class='btn btn-default'>详细</button><button role='addCookie' type='button' class='btn btn-default'>添加</button></div></td>";
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
    pageOperating = true;

    var html ="";
    var all = myStorage.getAll();
    all.forEach(function(data){
        var domain = data.domain;
        var domainName = data.get('name');
        var domainCookies = getCookies(domain);

        data.items.forEach(function(item){
            html += "<tr>";
            var name = item.name;
            var cookies = item.get('cookies');

            html+="<td role='domain'>"+domain+"</td>";//域名地址
            html+="<td role='domainName' >"+domainName+"</td>";//名称
            html+="<td role='count'>"+cookies.length+"</td>";//数量
            html+="<td role='name'>"+name+"</td>";//账户

            // if(checkSameCookie(cookies,domainCookies))
                html+="<td><div class='btn-group' role='group'><button role='inspectCookie' type='button' class='btn btn-default'>详细</button><button role='deleteCookie' type='button' class='btn btn-default'>删除</button></div></td>";
            // else
            //     html+="<td><div onclick='updateCookie(this)'>更新</div><div>删除</div></td>";

            html+="</tr>"
        })

    });

    $('#storagedCookie').html(html);

    pageOperating = false;
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