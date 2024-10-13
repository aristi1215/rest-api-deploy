const express = require('express')
const movies = require('./movies.json')
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovies } = require('./schemas/movies')

const app = express()

const PORT = process.env.PORT || 1234


//TODOS LOS RECURSOS QUE SEAN MOVIES SE IDENTIFICAN CON /MOVIES
//REST ARQUITECTURA


app.use(express.json())


const ALLOWED_ORIGINS = [
    'http://localhost:8080',
]


app.post('/movies', (req, res) => {

    //Se puede sacar directament el request body dado que ya paso por un proceso de validación
    //En caso de no pasar por validacion, hacer una validación, wtf
    const result = validateMovie(req.body)
    if (result.error) {
        return res.status(422).send(`Error validating the request body ${result.error}`)
    }
    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }
    movies.push(newMovie)
    return res.status(201).json(newMovie)
})


//get all the movies
app.get('/movies', (req, res) => {
    const origin = req.header('Origin')
    if (ALLOWED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }
    const { genre } = req.query
    if (genre) {
        const filterByGenre = movies.filter(movie => movie.Genre.toLowerCase().includes(genre.toLocaleLowerCase()))
        res.json(filterByGenre)
        return res.json(movies)
    } else {
        res.json(movies)
    }
})

//Get movie by id
app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.imdbID === id)
    res.json(movie || 'Movie not found')
})

//get paginated
app.get('/movies/pagination/:page', (req, res) => {

    const { page } = req.params

    const paginatedMovies = () => {
        if (page == 1) {
            return movies.slice(0, 10)
        } else if (page == 2) {
            return movies.slice(10, 20)
        } else {
            return movies
        }
    }
    res.json(paginatedMovies())

})

app.patch('/movies/:id', (req, res) => {
    const { id } = req.params
    const result = validatePartialMovies(req.body)
    const movieIndex = movies.findIndex(movie => movie.imdbID === id)

    if (movieIndex === -1) return res.status(400).json({ "message": "Movie not found" })

    if (result.error) {
        return res.status(404).json(result.error)
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.status(200).json(updateMovie)

})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('Origin')
    if (ALLOWED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }
    const { id } = req.params

    if (!id) {
        res.json({ "Message": "Please send an id" })
    }

    const movieIndex = movies.findIndex(movie => movie.imdbID === id)

    if (movieIndex === -1) {
        return res.status(404).json({ "Message": "The movie does not exists"})
    }
    console.log(movieIndex)
    movies.splice(movieIndex, 1)

    res.status(204).json({"Message": "eliminado"})

})

app.options('/movies/:id', (req,res) => {
    const origin = req.header('Origin')
    if(ALLOWED_ORIGINS.includes(origin) || !origin){
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'DELETE, PATCH, PUT')
    }
    res.send(200)
})







app.listen(PORT, () => {
    console.log(`Listning on port: http://localhost:${PORT}`)
})


