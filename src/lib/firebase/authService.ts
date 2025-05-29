
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./config";

const INTERNAL_EMAIL_DOMAIN = "@fluxofacil.app";

export async function signUpWithEmailPasswordName(username: string, password: string): Promise<User> {
  try {
    const email = username.toLowerCase() + INTERNAL_EMAIL_DOMAIN;
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro ao cadastrar:", error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Este nome de usuário já está em uso.");
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Cadastro com nome de usuário e senha não está habilitado. Verifique as configurações do Firebase Authentication no console do Firebase.");
    }
    throw new Error(error.message || "Não foi possível criar a conta. Verifique os dados e tente novamente.");
  }
}

export async function signInWithEmailPassword(username: string, password: string): Promise<User> {
  try {
    const email = username.toLowerCase() + INTERNAL_EMAIL_DOMAIN;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro ao fazer login:", error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      throw new Error("Usuário ou senha inválidos.");
    }
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Login com nome de usuário e senha não está habilitado. Verifique as configurações do Firebase Authentication no console do Firebase.");
    }
    throw new Error(error.message || "Usuário ou senha inválidos. Tente novamente.");
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Erro ao fazer logout:", error);
    throw new Error(error.message || "Não foi possível fazer logout.");
  }
}

export function onAuthStateChangedObservable(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
