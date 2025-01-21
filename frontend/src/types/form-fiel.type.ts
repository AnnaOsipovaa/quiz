export type FormFielType = {
    name: string,
    id: string,
    element: HTMLInputElement | null,
    regex: RegExp,
    valid: boolean
}