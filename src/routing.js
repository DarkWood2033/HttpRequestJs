const _ = require("lodash");

function Routing(routes){
    function replaceSegments(url, segments) {
        _.eachRight(segments, (paramVal, paramKey) => {
            url = _.replace(url, `:${paramKey}`, paramVal)
        });

        if(url.indexOf(':') !== -1){
            throw new Error('All segments are not transferred!');
        }

        return url
    }

    function getRoute(routes, name) {
        let route = _.get(routes, name);

        if(typeof route === 'undefined'){
            throw new Error(`Route '${name}' not found`)
        }

        return {url: route.url, method: route.method};
    }

    return {
        get(name, segments = {}){
            let route = getRoute(routes, name);

            route.url = replaceSegments(route.url, segments);

            return route
        }
    }
}

module.exports = Routing;