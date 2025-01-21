export type QuizTestType = {
    test: QuizType
}

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
    answers: QuizAnswersType[]
}

export type QuizAnswersType = {
    id: number,
    answer: string,
    correct?: boolean
}