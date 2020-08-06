const HttpRequest = require('./index');
const axios = require('axios');

const driver = axios.create();
driver.cache = 'session'; // Cache exist 'session' or 'local'
driver.interceptors = {
    request: query => query, // before query
    responseSuccess: response => response, // after query
    responseError: response => response // after query
};

const routes = {
    auth: {
        login: {
            url: 'api/auth/login',
            method: 'POST'
        },
        registration: {
            url: 'api/auth/registration',
            method: 'POST'
        }
    },
    blog: {
        post: {
            url: 'api/blog/:id',
            method: 'GET'
        }
    }
};

const instance = new HttpRequest(routes, {
    drivers: {
        default: driver
    }
});

instance.route('blog.post', {
    segments: {id: 2}
})
    .then(response => {
        // do
    })
    .catch(response => {
        console.log(response);
        // do
    })
    .finally(() => {
        //do
    });