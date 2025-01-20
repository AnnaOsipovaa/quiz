export type QuizType = {
    error?: boolean,
    message?: string,
    id: number,
    name: string,
    questions: QuizQuestionType[]
}

export type QuizQuestionType = {
    id: number,
    question: string,
    answers: [{ id: number, answer: string }]
}

export type QuizAnswersType = {
    id: number,
    answer: string
}