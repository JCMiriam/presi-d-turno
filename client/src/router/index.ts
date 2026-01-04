import { createRouter, createWebHistory } from "vue-router";
import { CreateUserPage } from "@pages/CreateUser";
import { LobbyPage } from "@pages/Lobby";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "user-setup", component: CreateUserPage },
    { path: "/lobby", name: "lobby", component: LobbyPage }
  ]
});
