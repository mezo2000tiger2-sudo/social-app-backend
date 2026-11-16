import { compareSync, hashSync } from "bcrypt"

export const Hash = (plainText: string, Salt_Rounds = 12): string => {
    return hashSync(plainText,Salt_Rounds)
}
export const Compare = (plainText: string, cipherText: string): boolean => {
    return compareSync(plainText ,cipherText)
}