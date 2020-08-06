const Routing = require('../src/routing');
const routes = require('./routes');

describe('Routing', () => {

    describe('Инициализация', () => {
        test('экземпляр Routing должен быть объектом', () => {
            expect(typeof new Routing(routes)).toBe('object')
        });
        test('экземпляр Routing должен содержать get метод', () => {
            expect(new Routing(routes).hasOwnProperty('get')).toBeTruthy()
        })
    });

    describe('Получение route', () => {
        let instanceRouting;
        beforeEach(() => {
            instanceRouting = new Routing(routes);
        });
        test('route без сегментов => instance.get("auth.login")', () => {
            expect(instanceRouting.get('auth.login')).toStrictEqual(routes.auth.login)
        });
        test('route с сегментами => instance.get("blog.show", {id: 5}) => api/blog/:id -> api.blog/5', () => {
            expect(instanceRouting.get('blog.show', {'id':5})).toStrictEqual({method: 'GET', url: 'api/blog/5'})
        });
        test('если не найден route, то вызывается ошибка', () => {
            const name = 'error.route';
            expect(() => instanceRouting.get(name)).toThrow(new Error(`Route '${name}' not found`));
        });
        test('если не переданы сегменты, то вызывается ошибка', () => {
            expect(() => instanceRouting.get('blog.show')).toThrow(new Error('All segments are not transferred!'));
        })
    })

});