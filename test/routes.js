module.exports = {
    auth: {
        login: {
            method: 'GET',
            url: 'api/auth/login'
        },
        registration: {
            method: 'GET',
            url: 'api/auth/registration'
        }
    },
    blog: {
        show: {
            method: 'GET',
            url: 'api/blog/:id'
        }
    }
}