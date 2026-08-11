import { create } from 'zustand'

const useAuthStore = create((set) => ({
	token: null,
	username: null,
	isLoggedIn: false,
	login: (token, username) => set({ token, username, isLoggedIn: true }),
	logout: () => set({ token: null, username: null, isLoggedIn: false }),
}))

export default useAuthStore