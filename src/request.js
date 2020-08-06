function SessionCache(){
    let cache = {};

    return {
        get(name){
            return cache[name] || null;
        },
        set(name, data){
            cache[name] = data;
        }
    }
}

function LocalCache(){
    return {
        get(name){
            try {
                return JSON.parse(localStorage.getItem(name)) || null
            }catch (e) {
                return null
            }
        },
        set(name, data){
            localStorage.setItem(name, JSON.stringify(data));
        }
    }
}

function Request(drivers){
    if(typeof drivers !== 'object'){
        throw new Error(`Drivers are not transferred!`)
    }
    if(!drivers.hasOwnProperty('default')){
        throw new Error('Driver "default" is not transferred!');
    }

    let sessionCache = new SessionCache();
    let localCache = new LocalCache();

    function getCache(name){
        let cacheDriver;
        switch (name) {
            case 'session': cacheDriver = sessionCache; break;
            case 'local': cacheDriver = localCache; break;
            default : throw new Error(`Driver ${name} not exist!`);
        }
        return cacheDriver;
    }

    function interceptor(driver, name, data){
        if(driver.hasOwnProperty('interceptors') && driver.interceptors.hasOwnProperty(name)){
            return driver.interceptors[name](data);
        }
        return data;
    }

    return {
        send({url, method, params, data, headers}, nameDriver = 'default'){
            if(!drivers.hasOwnProperty(nameDriver)){
                throw new Error(`Driver "${nameDriver}" not exist!`);
            }

            return new Promise((resolve, reject) => {
                let query = {url , method, params, data};
                let driver = drivers[nameDriver];
                query = interceptor(driver, 'request', query);
                // Cache get
                let cache = null;
                let response = null;
                if(driver.hasOwnProperty('cache')){
                    cache = getCache(driver.cache);
                    response = cache.get(url);
                    if(response !== null){
                        response = interceptor(driver, 'responseSuccess', response);
                        resolve(response);
                        return;
                    }
                }
                driver(query)
                    .then(response => {
                        response = interceptor(driver, 'responseSuccess', response);
                        if(driver.hasOwnProperty('cache')){
                            getCache(driver.cache).set(url, response);
                        }
                        resolve(response);
                    })
                    .catch(response => {
                        response = interceptor(driver, 'responseError', response);
                        reject(response);
                    });
            });
        }
    }
}

module.exports = Request;