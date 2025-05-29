
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./config";

export async function signUpWithEmailPasswordName(name: string, email: string, password: string): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro ao cadastrar:", error);
    throw new Error(error.message || "Não foi possível criar a conta.");
  }
}

export async function signInWithEmailPassword(email: string, password: string): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Erro ao fazer login:", error);
    throw new Error(error.message || "Email ou senha inválidos.");
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
