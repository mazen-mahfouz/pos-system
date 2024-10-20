// stores/auth.js
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: null,
        user: null,
    }),
    actions: {
        /**
         * Sets the authentication token in the store and in local storage.
         *
         * @param {string} token - The authentication token to be set.
         */
        setToken(token) {
            // Set the token in the store
            this.token = token;

            // Set the token in local storage
            localStorage.setItem("PosUserToken", token);
        },
        /**
         * Sets the user object in the store and in local storage.
         *
         * @param {Object} user - The user object to be set.
         */
        setUser(user) {
            // Set the user in the store
            this.user = user;

            // Set the user in local storage as a JSON string
            localStorage.setItem("PosUserData", JSON.stringify(user));
        },
        /**
         * Logs out the user by clearing the token and user data from the store
         * and local storage.
         */
        logout() {
            // Clear the token from the store
            this.token = null;

            // Clear the user data from the store
            this.user = null;

            // Remove the token from local storage
            localStorage.removeItem("PosUserToken");

            // Remove the user data from local storage
            localStorage.removeItem("PosUserData");

            // Remove user data form cookie
            const userData = useCookie("PosUserData");
            const userToken = useCookie("PosUserToken");

            userData.value = null;
            userToken.value = null;
        },
        /**
         * Initializes the store by retrieving the authentication token and user
         * data from local storage and setting them in the store.
         */
        initializeStore() {
            // Retrieve the authentication token from local storage
            const token = localStorage.getItem("PosUserToken");

            // Retrieve the user data from local storage and parse it as a JSON object
            const user = localStorage.getItem("PosUserData");

            // Set the token in the store if it exists
            if (token) {
                this.token = token;
            }

            // Set the user object in the store if it exists
            if (user) {
                this.user = JSON.parse(user);
            }
        },
    },
});
