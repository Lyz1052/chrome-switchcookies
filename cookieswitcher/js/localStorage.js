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
    var VERSION = '1.3';
    var ISOLATED_DATA_KEY = '_ISOLATED_DATA';
    var localStorage = hasLocalStorage();

    //给对象织入get方法，并且返回相应的对象（是否返回和域名相关的本地存储）
    function weaveFunction(obj){
        if(!obj)return;

        if(Array.isArray(obj)){


            obj.forEach(function(e){
                weaveFunction(e);
                if(Array.isArray(e.items))
                    weaveFunction(e.items);
            });
        }else{
            obj.get = function(key){
                if(key)
                    return this._keyvalue[key];
            };
        }
    }

    function getAll(key){
        all = localStorage.getItem(KEY);
        var isDomainData = this.domain != ISOLATED_DATA_KEY;
        if(all){
            var obj = JSON.parse(all);
            obj = obj.filter(function(e){
                return e.isDomainData == isDomainData;
            })

            weaveFunction(obj);

            if(!key){
                return obj;
            }else{
                return obj.map(function(e){
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
            return false;
        }
        return global.localStorage;
    }

    function getLocalStorage(domain){
        var isDomainData = domain!=ISOLATED_DATA_KEY;

        var items=[],data= {
            isDomainData:isDomainData,
            domain:domain,
            items:items,
            _keyvalue:{}
        } , all = localStorage.getItem(KEY);

        if(!all){
            all = [data];
        }else{
            var all = JSON.parse(all);

            weaveFunction(all,isDomainData);

            var filtered = all.filter(function(e){
                return e.domain == domain;
            })

            if(filtered.length){
                return filtered[0];
            }else{
                all.push(data);
            }
        }

        localStorage.setItem(KEY,JSON.stringify(all));
        return data;
    }


    function setLocalStorage(key,value,domain){
        if(hasLocalStorage()){
            getLocalStorage(domain);

            var all = JSON.parse(localStorage.getItem(KEY));
            all = all.map(function(e){
                if(e.domain == domain){
                    e[key]=value;
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

    /**
     * 构造方法
     * _domain 为 string：操作该域名下的本地存储
     * _domain 为 false: 操作与域名无关的本地存储
     * @param {*} _domain 
     */
    var LOCALSTORAGE = function (_domain){

        /**
         * 获取所有存储
         */
        this.getAll = getAll;

        /**
         * 清空domain下name的本地存储
         * 
         * domain默认为当前域名
         * name为空，则清空domain下所有存储
         * name和domain都为空，清空所有存储
         * 
         * @param name
         * @param domain
         * @returns {*}
         */
        this.clear = function clearNamedLocalStorage(name,domain){
            if(name||domain){
                domain = domain || _domain;

                var items = getLocalStorage(domain).items;
                if (items.length) {

                    if(name)
                        items = items.filter(function (e) {
                            return e.name != name;
                        });
                    else
                        items = [];

                    setLocalStorage('items',items,domain);
                    return true;
                }
            }else{
                removeLocalStorage();
                return true;
            }
        }

        if(typeof _domain == 'string'){
            this.domain = _domain;
        }else if(typeof _domain=='boolean'&&!_domain){
            _domain = ISOLATED_DATA_KEY;
        }else{//domain未识别，不能进行除了获取全部域名存储以外的操作
            return;
        }

        this.domain = _domain || global.document.domain;
        


        /**
         * 获取某name的本地存储
         * name为空，返回所有key的本地存储
         * name不为空，如果有匹配，则返回匹配的记录，如果没有匹配，则新建一个记录并返回
         * @param name
         * @returns {*}
         */
        this.get = function getNamedLocalStorage(name,key){
            key = key || 'items';
            var items = getLocalStorage(_domain)[key];

            var item ={
                name:name,
                _keyvalue:{}
            };


            if(Array.isArray(items)){//获取domain的items

                if (items.length) {
                    if(!name) {
                        item = items;
                    }else{
                        var filtered = items.filter(function (e) {
                            return e.name == name;
                        });

                        if (!filtered.length) {
                            items.push(item);
                        }else{
                            return filtered[0];
                        }

                    }
                } else {//自动添加
                    if(name)
                        items.push(item);
                    else
                        item = items;
                }
            
            }else{//获取domain的属性
                
                return items[name];

            }

            setLocalStorage(key,items,_domain);

            return item;
        }

        /**
         * 设置name的本地存储
         * name不存在时，自动创建记录
         * @param name
         * @param keyvalue
         */
        this.set = function setNamedLocalStorage(name,keyvalue){
            if(name) {
                if(keyvalue&&typeof name == 'string'&&typeof keyvalue == 'object'){
                    this.get(name);//自动创建

                    var items = this.get();

                    items = items.map(function (e) {
                        if (e.name == name) {
                            Object.assign(e['_keyvalue'],keyvalue);
                        }
                        return e;
                    })

                    setLocalStorage('items',items,_domain);

                }else if(typeof name == 'object'){
                    keyvalue = name;
                    var data = getLocalStorage(_domain);

                    setLocalStorage('_keyvalue',Object.assign(data['_keyvalue'],keyvalue),_domain);
                }
            }
        }

    }

    LOCALSTORAGE.VERSION = VERSION;


    function compareVersion(v1,v2){
        var res = 0;
        try{
            var v1s=v1.split('.'),v2s=v2.split('.');
            if(v1s.length==v2s.length){
                for(var i=0;i<v1s.length;i++){
                    var n1=Number(v1s[i]);
                    var n2=Number(v2s[i]);
                    if(n1>n2){res=1;break;}
                    if(n1<n2){res=-1;break;}
                }
            }
        }catch(e){
            res = -1;
        }
        return res;
    }

    if(!global.LSTOG||
        (global.LSTOG&&
        compareVersion(global.LSTOG.VERSION,VERSION)<0)){
        global.LSTOG = LOCALSTORAGE;
    }

})(window)