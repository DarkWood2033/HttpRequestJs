const Routing = require("./routing");
const Request = require("./request");

function HttpRequest(routes, config = {}){
    if(!routes){
        throw Error('Routes are not transferred!');
    }

    let routing = new Routing(routes);
    let request = new Request(config.drivers);

    return {
        route: function (name, {segments, driver, data, params, headers} = true) {
            let route = routing.get(name, segments);

            let query = {
                url: '/' + route.url,
                method: route.method,
                data,
                params,
                headers
            };

            return request.send(query, driver);
        },

        query: function (query, { driver }) {
            return request.send(query, driver);
        }
    };
};

module.exports = HttpRequest;