
class filmsService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/';
    }

    getFilms() {
        return axios.get(this.baseUrl + 'films');
    }

    addFilm(film) {
        return axios.post('http://localhost:3000/films', film);
    }

    updateFilm(film) {
        return axios.put('http://localhost:3000/films/' + film.id, film);
    }

    deleteFilm(film) {
        return axios.delete('http://localhost:3000/films/' + film.id);
    }
}