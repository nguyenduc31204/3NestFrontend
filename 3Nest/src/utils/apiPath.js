<<<<<<< HEAD

export const BASE_URL = "https://e197-58-187-66-182.ngrok-free.app"
//export const BASE_URL = "http://localhost:8000";
=======
export const BASE_URL = "https://e197-58-187-66-182.ngrok-free.app"


>>>>>>> 879804afee4b20d2a49ad9767c72066a7e7e5122

export const API_PATHS = {
    AUTH: {
        LOGIN: "/users/login",
        LOGOUT: "/auth/logout",
    },
    USER: {
        PROFILE: "/user/profile",
        UPDATE_PROFILE: "/user/update-profile",
    },
    PRODUCTS: {
        CREATE: "/products/create-product",
        GET_ALL: "/types/",
        GET_BY_ID: (id) => `/posts/${id}`,
        UPDATE: (id) => `/posts/${id}/update`,
        DELETE: (id) => `/posts/${id}/delete`,
    },
};
