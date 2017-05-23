/**
 * 浏览器本地存储模块
 */
(function(global){
    function guid() {//http://blog.csdn.net/mr_raptor/article/details/52280753
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    var KEY = 'NamedlocalStorage';
    var domain = global.document.domain || '';
    var localStorage = hasLocalStorage();

    function getAll(key){
        all = localStorage.getItem(KEY);
        if(all){
            if(!key)
                return JSON.parse(all);
            else{
                return JSON.parse(all).map(function(e){
                    return e[key];
                });
            }
        }else{
            return [];
        }
    }


    function hasLocalStorage(){
        if(!global.localStorage){
                console.info('提示：您的浏览器不支持本地存储，部分功能无法正常运行');
            }
            return false;
        }
        return global.localStorage;
    }

    function getLocalStorage(){
        var items=[],data= {
            domain:domain,
            items:items
        } , all = localStorage.getItem(KEY);

        if(!all){
            all = [data];
        }else{
            all = JSON.parse(all);

            var data = all.filter(function(e){
                return e.domain == domain;
            })

            if(data.length){
                return data[0];
            }else{
                all.push(data);
            }
        }

        localStorage.setItem(KEY,JSON.stringify(all));
        return data;
    }


    function setLocalStorage(items){
        if(hasLocalStorage()){
            getLocalStorage();

            var all = JSON.parse(localStorage.getItem(KEY));
            all = all.map(function(e){
                if(e.domain == domain){
                    e.items=items;
                }
                return e;
            })

            localStorage.setItem(KEY,JSON.stringify(all));
        }
    }

    function removeLocalStorage(){
        if(hasLocalStorage()){
            localStorage.removeItem(KEY);
        }
    }

    var LOCALSTORAGE = function (_domain){

        domain = _domain || domain;

        this.getAllDomain = function(){
            return getAll('domain');
        }
        
        /**
         * 清空某name的本地存储
         * name为空，清空所有key的本地存储
         * name不为空，清空指定key的本地存储
         * @param enterpriseId
         * @returns {*}
         */
        this.clear = function clearNamedLocalStorage(name){
            removeLocalStorage();
        }

        /**
         * 获取某name的本地存储
         * name为空，返回所有key的本地存储
         * name不为空，如果有匹配，则返回匹配的记录，如果没有匹配，则新建一个记录并返回
         * @param name
         * @returns {*}
         */
        this.get = function getNamedLocalStorage(name){

            var items = getLocalStorage().items;

            var item ={
                name:name,
            };


            if (items.length) {
                if(!name) {
                    item = items;
                }else{
                    items = items.filter(function (e) {
                        return e.name = name;
                    });

                    if (!items.length) {
                        items.push(item);
                    }else{
                        return items[0];
                    }

                }
            } else {
                items.push(item);
            }

            setLocalStorage(items);

            return item;
        }

        /**
         * 设置name的本地存储
         * key不存在时，自动创建记录
         * @param name
         * @param keyvalue
         */
        this.set = function setNamedLocalStorage(name,keyvalue){
            if(name&&keyvalue) {
                getNamedLocalStorage(name);//自动创建

                var items = getNamedLocalStorage();

                items = items.map(function (e) {
                    if (e.enterpriseId == name) {
                        for (var key in keyvalue) {
                            e[key] = keyvalue[key];
                        }
                    }
                    return e;
                })

                setLocalStorage(items);
            }
        }

    };

    global.LOCALSTORAGE = global.LOCALSTORAGE==undefined?LOCALSTORAGE:global.LOCALSTORAGE;
})(window)