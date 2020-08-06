const result = {
    success: {
        status: 200,
        data: {
            message: 'OK'
        }
    },
    error: {
        errors: {
            data: {
                status: 500,
                message: 'Error'
            }
        }
    }
};

const interceptors = {
    request: (request) => request,
    responseSuccess: (response) => response,
    responseError: (response) => response,
};

const driverOne = (query) => query.url === 'api/success'
    ? Promise.resolve(result.success)
    : Promise.reject(result.error);
driverOne.interceptors = {};
driverOne.interceptors.request = interceptors.request;
driverOne.interceptors.responseSuccess = interceptors.responseSuccess;
driverOne.interceptors.responseError = interceptors.responseError;
driverOne.cache = 'session';

const driverTwo = (query) => query.url === 'api/success'
    ? Promise.resolve(result.success)
    : Promise.reject(result.error);
driverTwo.interceptors = {};

module.exports = {
    interceptions: interceptors,
    drivers: {
        default: driverOne,
        other: driverTwo
    },
    results: result
};