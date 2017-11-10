var films = [];
var filmsSvc = new filmsService();

// carga inicial de datos
filmsSvc.getFilms().then(function (res) {
    films = res.data;
    renderTable(films);
});

function addFilm(e, form) {
    e.preventDefault();

    // obtengo todos los datos del formulario
    var filmName = form.filmName.value;
    var filmYear = Number(form.filmYear.value);
    var filmGenre = form.filmGenre.value;
    var filmVoters = Number(form.filmVoters.value);
    var filmTotalVotes = Number(form.filmTotalVotes.value);

    // me fijo si la pelicula ya esta cargada
    var existingFilm = getFilm(filmName);

    // si esta cargada?
    if (existingFilm != undefined) {

        // actualizo el objecto film en el array
        existingFilm.name = filmName;
        existingFilm.year = filmYear;
        existingFilm.genre = filmGenre;
        existingFilm.voters = filmVoters;
        existingFilm.totalVotes = filmTotalVotes;
        existingFilm.totalVotes = filmTotalVotes;
        existingFilm.raiting = getRaiting(filmVoters, filmTotalVotes);

        // actualizo la pelicula en el backend
        filmsSvc.updateFilm(existingFilm).then(function (res) {
            // limpio el formulario
            cleanAddFilmForm();

            // dibujo de nuevo la tabla con la película actualizada
            renderTable(films);
        })
            // si el request se ejecutó con errores
            .catch(function (errResp) {
                console.warn(errResp);
                alert("No se pudo editar la pelicula");
            });;
    } else
    // si no esta cargada
    {
        var film = {
            name: filmName,
            year: filmYear,
            genre: filmGenre,
            voters: filmVoters,
            totalVotes: filmTotalVotes,
            raiting: getRaiting(filmVoters, filmTotalVotes)
        };

        // hago un request para agregar la pelicula a la base de datos
        filmsSvc.addFilm(film)
            // si el request se ejecutó correctamente
            .then(function (res) {

                var addedFilm = res.data;

                // agrego la pelicula al array
                films.push(addedFilm);

                // limpio el formulario
                cleanAddFilmForm();

                // la agrego a la tabla
                addFilmToTable(addedFilm);
            })
            // si el request se ejecutó con errores
            .catch(function (errResp) {
                console.warn(errResp);
                alert("No se pudo agregar la pelicula");
            });
    }
}

function getRaiting(voters, totalVotes) {
    return (totalVotes / voters).toFixed(2);
}

function getFilm(filmName) {
    return films.find(function (film) {
        return film.name.toLowerCase() == filmName.toLowerCase();
    });
}


function cleanAddFilmForm() {
    var form = document.getElementById("addOrEditFilmsForm");
    var legend = document.getElementById("addOrEditFilmsFormLegend");
    var filmNameInput = document.getElementById("filmName");

    legend.innerHTML = "Ingresar Películas";
    filmNameInput.removeAttribute("readonly");

    form.filmName.value = "";
    form.filmYear.value = "";
    form.filmGenre.selectedIndex = 0;
    form.filmVoters.value = "";
    form.filmTotalVotes.value = "";
}

function addFilmToTable(film) {
    var tableBody = document.getElementById('filmsTableBody');
    var newFilmRow = tableBody.insertRow();
    newFilmRow.classList.add('text-center');

    var nameCell = newFilmRow.insertCell(0);
    nameCell.innerHTML = film.name;

    var yearCell = newFilmRow.insertCell(1);
    yearCell.innerHTML = film.year;

    var genreCell = newFilmRow.insertCell(2);
    genreCell.innerHTML = film.genre;

    var averageCell = newFilmRow.insertCell(3);
    averageCell.innerHTML = film.raiting;

    var deleteAction = document.createElement('span');
    deleteAction.className = "glyphicon glyphicon-remove clickable";

    deleteAction.addEventListener("click", function () {
        deleteFilm(film);
    });

    var editAction = document.createElement('span');
    editAction.className = "glyphicon glyphicon-pencil clickable editIcon";

    editAction.addEventListener("click", function () {
        var form = document.getElementById("addOrEditFilmsForm");
        var legend = document.getElementById("addOrEditFilmsFormLegend");
        var filmNameInput = document.getElementById("filmName");

        legend.innerHTML = "Editando película: " + film.name;
        filmNameInput.setAttribute("readonly", "true");

        form.filmName.value = film.name;
        form.filmYear.value = film.year;
        form.filmGenre.value = film.genre;
        form.filmVoters.value = film.voters;
        form.filmTotalVotes.value = film.totalVotes;
    });

    var actionsCell = newFilmRow.insertCell(4);
    actionsCell.appendChild(deleteAction);
    actionsCell.appendChild(editAction);

}

function getRowByFilmName(filmName) {
    var tableBody = document.getElementById('filmsTableBody');

    for (var i = 0; i < tableBody.rows.length; i++) {
        var actualRow = tableBody.rows[i];
        if (actualRow.cells[0].innerText == filmName)
            return actualRow;
    }
}

function filterFilms(e, filterForm) {
    e.preventDefault();

    var filteredFilms = [];
    var filterName = filterForm.nameFilter.value;
    var filterYear = filterForm.yearFilter.value;
    var filterGenre = filterForm.genreFilter.value;
    var filterRaiting = filterForm.raitingFilter.value;

    films.forEach(function (film) {
        if (filterName != "" && film.name.indexOf(filterName) == -1)
            return;

        if (filterYear != "" && film.year < Number(filterYear))
            return;

        if (filterGenre != "nofilter" && film.genre != filterGenre)
            return;

        if (filterRaiting != "" && film.raiting < Number(filterRaiting))
            return;

        filteredFilms.push(film);
    });

    renderTable(filteredFilms);
}

function renderTable(films) {

    // limpio el body de la tabla
    var tableBody = document.getElementById('filmsTableBody');
    tableBody.innerHTML = "";

    // agrego el array de films a la tabla
    films.forEach(function (film) {
        addFilmToTable(film);
    });
}

function cleanFiltersAndReRender() {
    var filterForm = document.getElementById('filterFilmsForm');

    filterForm.nameFilter.value = "";
    filterForm.yearFilter.value = "";
    filterForm.genreFilter.selectedIndex = 0;
    filterForm.raitingFilter.value = "";

    renderTable(films);
}

function deleteFilm(film) {

    // hago el request para eliminar la pelicula de mi backend
    filmsSvc.deleteFilm(film)
        // si el request se ejecuta de forma correcta:
        .then(function () {

            // al array que tengo en memoria, le voy a sacar la pelicula que acabo de eliminar
            films = films.filter(function (f) {
                return f.id != film.id;
            });

            // vuelvo a dibujar la tabla en la vista
            renderTable(films);
        })
        // si el request se ejecuta con errores
        .catch(function (errResp) {
            console.warn(errResp);

            // esta funcion se ejecuta cuando el request retorna con un error
            alert("Error al eliminar pelicula.");
        });
}

function orderByName() {
    var iconElement = document.getElementById('orderByNameIcon');
    if (iconElement.classList.contains('glyphicon-sort-by-alphabet-alt')) {

        //tengo que ordernar alfabeticamente
        films.sort(function (a, b) {
            var nameA = a.name.toLowerCase();
            var nameB = b.name.toLowerCase();

            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        iconElement.classList.remove('glyphicon-sort-by-alphabet-alt');
        iconElement.classList.add('glyphicon-sort-by-alphabet');
    }
    else if (iconElement.classList.contains('glyphicon-sort-by-alphabet')) {
        
        // ordena alfabeticamente de forma descendiente 
        films.sort(function (a, b) {
            var nameA = a.name.toLowerCase();
            var nameB = b.name.toLowerCase();

            if (nameA < nameB) return 1;
            if (nameA > nameB) return -1;
            return 0;
        });

        // cambiar el icono por el ordenamiento descendiente
        iconElement.classList.remove('glyphicon-sort-by-alphabet');
        iconElement.classList.add('glyphicon-sort-by-alphabet-alt');
    }

    renderTable(films);
}



