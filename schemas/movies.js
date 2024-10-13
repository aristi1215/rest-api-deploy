const z = require('zod')

const movieScheme = z.object({
    Title: z.string({
        "invalid_type_error": 'Title must be a string',
        "required_error": 'Title is required'
    }),
    Year: z.number().int().min(1900).max(3000),
    Director: z.string(),
    Genre: z.string(),
    Poster: z.string().url({
        "message": "Poster must be a valid url"
    })
})


const validateMovie = (object) => {
    return movieScheme.safeParse(object)
}

//Method patch or put validationc
const validatePartialMovies = (object) => {
    return movieScheme.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovies
}