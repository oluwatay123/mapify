'use strict';

// prettier-ignore

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//creating the general class for the cycling and running
class workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(distance, duration, coord) {
    this.distance = distance;
    this.duration = duration;
    this.coord = coord;
   
  }

  _setDescription() {
    //PRETTIER-IGNORE
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} ${
      months[this.date.getMonth()]
    }${this.date.getDate()}`;
  }
}

//createing the children class cycling and running
class running extends workout {
  type = 'running';
  constructor(distance, duration, coord, cadence) {
    super(distance, duration, coord);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
  }
}

class cycling extends workout {
  type = 'cycling';
  constructor(distance, duration, coord, elevatioGain) {
    super(distance, duration, coord);
    this.elevatioGain = elevatioGain;
    this.calcspeed();
    this._setDescription();
  }
  calcspeed() {
    this.speed = this.distance / this.duration;
  }

  // creating n instance of the classes
}

const run1 = new running(123, 23, [12, 23], 23);
console.log(run1);
//refactoring the code
class App {
  #map;
  #mapMarker;
  #workout = [];
  //the constructor automatically initilaize the function insode it
  constructor() {
    this._getPosition();
  
    this._getLocalStorage()
    form.addEventListener('submit', this._newWorkOut.bind(this));
    inputType.addEventListener('change', this._toggleElevatedField.bind(this));
    containerWorkouts.addEventListener("click", this._setToView.bind(this))
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),
      function () {
        alert('could not get your current location');
      }
    );
  }
  //for loading the map
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(
      `https://www.google.com/maps/@${latitude},${longitude},12z?entry=ttu`
    );
    // putting the latitudeand longitude in an array
    const coord = [latitude, longitude];
    this.#map = L.map('map').setView(coord, 13);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    //handling the click event to change the maker from each position

    this.#workout.forEach(work=> 
        this.RenderWorkoutMap(work)  
            )
  }

  // to show the workout form
  _showForm(eMap) {
    {
      this.#mapMarker = eMap;
      form.classList.remove('hidden');
      inputDistance.focus();
    }
  }

  _clearForm() {
    form.style.display = 'none';
    form.classList.add('hidden');
    // to show the workout on the list without transition
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  // to toggle between the cycling and running options form
  _toggleElevatedField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  // to create new workout when one is created previusly
  _newWorkOut(e) {
    //helper functions
    const validateNUmber = (...input) =>
      input.every(inp => Number.isFinite(inp));
    const isPositive = (...input) => input.every(inp => inp > 0);
    e.preventDefault();
    //get data froom the from
    const type = inputType.value;
    const distance = +inputDistance.value;
    const Duration = +inputDuration.value;
    const { lat, lng } = this.#mapMarker.latlng;
    let Workout;
    //if activity is running create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid
      if (
        !validateNUmber(distance, Duration, cadence) ||
        !isPositive(distance, Duration, cadence)
      )
        return alert('is not a positive number');
      Workout = new running(distance, Duration, [lat, lng], cadence);
    }
    // if actitvity is cycling create cycling object
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        !validateNUmber(distance, Duration, elevationGain) ||
        !isPositive(distance, Duration)
      )
        return alert('is not a positive number');
      //creting a new object for cycling
      Workout = new cycling(distance, Duration, [lat, lng], elevationGain);
    }
    // store the wrokout object in a the array
    this.#workout.push(Workout);

    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    //   positioning the marker and render workout on map
    this.RenderWorkoutMap(Workout);
    this.RenderWorkout(Workout);
    this._clearForm(Workout);
    this._setLocalStorage()
  }
  // renderimg the workout on the map
  RenderWorkoutMap(workout) {
    L.marker(workout.coord)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 100,
          maxHeight: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        ` ${workout.type === 'running' ? '🏃' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  RenderWorkout(workout) {
    let html = `
<li class="workout workout--${workout.type}" data-id="${workout.id}">
 <h2 class="workout__title">${workout.description}</h2>
 <div class="workout__details">
   <span class="workout__icon">${
     workout.type === 'running' ? '🏃' : '🚴‍♀️'
   }</span>
   <span class="workout__value">${workout.distance}</span>
   <span class="workout__unit">km</span>
 </div>
 <div class="workout__details">
   <span class="workout__icon">⏱</span>
   <span class="workout__value">${workout.duration}</span>
   <span class="workout__unit">min</span>
 </div>
 `;

    if (workout.type === 'running') {
      html += `
    <div class="workout__details">
  <span class="workout__icon">⚡️</span>
  <span class="workout__value">${workout.pace.toFixed(1)}</span>
  <span class="workout__unit">min/km</span>
</div>
<div class="workout__details">
  <span class="workout__icon">🦶🏼</span>
  <span class="workout__value">${workout.cadence}</span>
  <span class="workout__unit">spm</span>
</div>
    `;
    }

    if (workout.type === 'cycling') {
      html += `
    <div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value">${workout.speed.toFixed(1)}</span>
    <span class="workout__unit">km/h</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⛰</span>
    <span class="workout__value">${workout.elevatioGain}</span>
    <span class="workout__unit">m</span>
  </div>
    
    `;
    }

    form.insertAdjacentHTML('afterend', html);
  }

  _setToView(e){
   const workOutEl = e.target.closest('.workout')

   if(!workOutEl) return

   const workout =   this.#workout.find(wrkout => wrkout.id === workOutEl.dataset.id)

   this.#map.setView(workout.coord, 13, {
    animate: true,
    pan :{
        duration:1
    }
   })
  }
_setLocalStorage(){
    localStorage.setItem('workout', JSON.stringify(this.#workout))
}

_getLocalStorage(){
 const data =   JSON.parse(localStorage.getItem('workout'))
if(!data) return
this.#workout = data 
 this.#workout.forEach(work=> 
this.RenderWorkout(work)  
    )
}
  
}

//calling the class

const app = new App();
