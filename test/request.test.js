const Request = require('../src/request');
const { drivers } = require('./drivers');

describe('Request', () => {
    const successQuery = {url:'api/success',method:'POST'};
    const errorQuery = {url:'api/error',method:'GET'};

    describe('Инициализация', () => {
        test('экземпляр Request должен быть объектом', () => {
            expect(typeof new Request(drivers)).toBe('object');
        });
        test('экземпляр Request должен содержать send метод', () => {
            expect(new Request(drivers).hasOwnProperty('send')).toBeTruthy();
        });
        test('если не переданы драйвера, то вызывается ошибка', () => {
            expect(() => new Request()).toThrow(new Error(`Drivers are not transferred!`));
        });
        test('если не передан стандартный дравйвер, то вызывается ошибка', () => {
            expect(() => new Request({other: drivers.other})).toThrow(new Error('Driver "default" is not transferred!'));
        })
    });

    describe('Отправка запроса', () => {
        let defaultDriver, otherDriver,
            successCallback, errorCallback, defaultCallback, otherCallback,
            instanceRequest;
        beforeEach(() => {
            defaultCallback = jest.fn();
            defaultDriver = (query) => {
                defaultCallback();
                return drivers.default(query);
            };
            defaultDriver.interceptors = drivers.default.interceptors;
            otherCallback = jest.fn();
            otherDriver = (query) => {
                otherCallback();
                return drivers.other(query);
            };
            otherDriver.interceptors = drivers.other.interceptors;
            successCallback = jest.fn();
            errorCallback = jest.fn();
            instanceRequest = new Request({
                default: defaultDriver,
                other: otherDriver
            });
        });
        test('Успешный запрос => код 2**', async () => {
            let query = instanceRequest.send(successQuery);
            expect(query instanceof Promise).toBeTruthy();
            await query.then(successCallback).catch(errorCallback);
            expect(defaultCallback).toHaveBeenCalled();
            expect(successCallback).toHaveBeenCalled();
            expect(errorCallback).not.toHaveBeenCalled();
        });
        test('Ошибочный запрос => ошибка сервера или ресерс не найден, ...', async () => {
            let query = instanceRequest.send(errorQuery);
            expect(query instanceof Promise).toBeTruthy();
            await query.then(successCallback).catch(errorCallback);
            expect(defaultCallback).toHaveBeenCalled();
            expect(errorCallback).toHaveBeenCalled();
            expect(successCallback).not.toHaveBeenCalled();
        });
        test('Запрос с помощью другого драйвера => instance.send(query, "other")', () => {
            instanceRequest.send(successQuery, 'other');
            expect(otherCallback).toHaveBeenCalled();
        });
        test('если драйвер не существует, то вызывает ошибку', () => {
            let nameDriver = 'errorName';
            expect(() => instanceRequest.send(successQuery, nameDriver))
                .toThrow(new Error(`Driver "${nameDriver}" not exist!`));
        });
    });

    describe('Вызывы interceptors', () => {
        let driver,
            requestCallback, responseSuccessCallback, responseErrorCallback,
            request, responseSuccess, responseError,
            instanceRequest;
        beforeEach(() => {
            requestCallback = jest.fn();
            request = (query) => {
                requestCallback();
                return query;
            };
            responseSuccessCallback = jest.fn();
            responseSuccess = (query) => {
                responseSuccessCallback();
                return query;
            };
            responseErrorCallback = jest.fn();
            responseError = (query) => {
                responseErrorCallback();
                return query;
            };
            driver = drivers.default;
            driver.interceptors = { request, responseSuccess, responseError };
            instanceRequest = new Request({default: driver})
        });
        test('Вызовы интерсептора перед отпрвкой запроса', () => {
            instanceRequest.send(successQuery);
            expect(requestCallback).toHaveBeenCalled();
        });
        test('Вызовы интерсептора после получения успешного запроса', async () => {
            await instanceRequest.send(successQuery);
            expect(responseSuccessCallback).toHaveBeenCalled();
            expect(responseErrorCallback).not.toHaveBeenCalled();
        });
        test('Вызовы интерсептора после получения ошибочного запроса', async () => {
            await instanceRequest.send(errorQuery).catch(() => {});
            expect(responseErrorCallback).toHaveBeenCalled();
            expect(responseSuccessCallback).not.toHaveBeenCalled();
        });
    });

    describe('Кэширование', () => {
        let instanceRequest, driver, driverCallback;
        beforeEach(() => {
            driverCallback = jest.fn();
            driver = (query) => {
                driverCallback();
                return drivers.default(query);
            };
            driver.cache = 'session';
            instanceRequest = new Request({default:driver})
        });
        test('получение из кеша', async () => {
            await instanceRequest.send(successQuery);
            await instanceRequest.send(successQuery);
            expect(driverCallback).toHaveBeenCalledTimes(1)
        });
    })
});